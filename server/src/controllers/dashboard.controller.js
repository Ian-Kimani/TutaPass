const db = require('../config/db');
const readinessService = require('../services/readiness.service');
const geminiService = require('../services/gemini.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Returns composite dashboard data: Pass Probability, Domain Mastery Bars, and current Study Plan.
 * Dynamically filtered by syllabusId (or flagship if null).
 */
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.query.userId || 'demo-learner';
  const syllabusId = req.query.syllabusId ? parseInt(req.query.syllabusId, 10) : null;

  // 1. Calculate readiness telemetry for requested syllabus
  const readiness = await readinessService.calculateReadiness(db, userId, syllabusId);

  // 2. Fetch active syllabus
  let syllabusRes;
  if (syllabusId) {
    syllabusRes = await db.query('SELECT * FROM syllabi WHERE id = $1 LIMIT 1;', [syllabusId]);
  } else {
    syllabusRes = await db.query('SELECT * FROM syllabi WHERE is_flagship = true LIMIT 1;');
  }
  const activeSyllabus = syllabusRes.rows[0] || null;
  const resolvedSyllabusId = activeSyllabus?.id || null;

  // 3. Fetch active study plan
  const planRes = await db.query(
    `SELECT * FROM study_plans 
     WHERE user_id = $1 AND ($2::int IS NULL OR syllabus_id = $2)
     ORDER BY created_at DESC 
     LIMIT 1;`,
    [userId, resolvedSyllabusId]
  );

  return sendSuccess(res, {
    readiness,
    studyPlan: planRes.rows[0] || null,
    flagshipSyllabus: activeSyllabus,
    syllabus: activeSyllabus,
  });
});

/**
 * Generates an adaptive, calendar-based study timetable using Gemini and saves to Neon.
 */
const createOrUpdatePlan = asyncHandler(async (req, res) => {
  const userId = req.body.userId || 'demo-learner';
  const syllabusId = req.body.syllabusId ? parseInt(req.body.syllabusId, 10) : null;
  const { targetExamDate, dailyHours, weakAreas = [] } = req.body;

  // Retrieve requested syllabus or fallback to flagship
  let syllabusRes;
  if (syllabusId) {
    syllabusRes = await db.query('SELECT id, title FROM syllabi WHERE id = $1 LIMIT 1;', [syllabusId]);
  } else {
    syllabusRes = await db.query('SELECT id, title FROM syllabi WHERE is_flagship = true LIMIT 1;');
  }
  const syllabus = syllabusRes.rows[0];

  if (!syllabus) {
    return sendError(res, 'Syllabus not found in database.', 404);
  }

  // Generate study plan with Gemini
  const { result, promptTelemetry } = await geminiService.generateStudyPlan({
    syllabusTitle: syllabus.title,
    targetExamDate,
    dailyHours: parseFloat(dailyHours),
    weakAreas,
  });

  // Save or replace study plan
  const insertRes = await db.query(
    `INSERT INTO study_plans (user_id, syllabus_id, target_exam_date, daily_hours, schedule_data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [
      userId,
      syllabus.id,
      targetExamDate,
      parseFloat(dailyHours),
      JSON.stringify(result.schedule || result),
    ]
  );

  return sendSuccess(
    res,
    {
      plan: insertRes.rows[0],
      summary: result.summary,
    },
    promptTelemetry,
    201
  );
});

/**
 * Resets demo-learner data to initial baseline state (64% score, 3 initial flashcards) for hackathon demo runs.
 */
const resetDemo = asyncHandler(async (req, res) => {
  const userId = 'demo-learner';

  // 1. Delete existing attempts and flashcards for demo-learner
  await db.query('DELETE FROM user_attempts WHERE user_id = $1;', [userId]);
  await db.query('DELETE FROM flashcards WHERE user_id = $1;', [userId]);
  await db.query('DELETE FROM study_plans WHERE user_id = $1;', [userId]);

  // 2. Fetch questions and domains to re-link
  const questionsRes = await db.query('SELECT id, domain_id, topic_tag FROM quiz_questions ORDER BY id ASC;');
  const questions = questionsRes.rows;

  if (questions.length < 6) {
    return sendError(res, 'Not enough seeded questions to reset demo. Please run npm run seed.', 500);
  }

  // 3. Re-seed 11 attempts (7 correct, 4 wrong = ~64% baseline)
  const attemptPlan = [
    { qIdx: 0, opt: 'B', correct: true },
    { qIdx: 1, opt: 'C', correct: true },
    { qIdx: 2, opt: 'A', correct: false },
    { qIdx: 2, opt: 'B', correct: true },
    { qIdx: 3, opt: 'A', correct: false },
    { qIdx: 3, opt: 'C', correct: true },
    { qIdx: 4, opt: 'A', correct: false },
    { qIdx: 4, opt: 'C', correct: false },
    { qIdx: 4, opt: 'B', correct: true },
    { qIdx: 5, opt: 'A', correct: true },
    { qIdx: 5, opt: 'A', correct: true },
  ];

  for (const a of attemptPlan) {
    await db.query(
      `INSERT INTO user_attempts (user_id, question_id, selected_option_id, is_correct)
       VALUES ($1, $2, $3, $4);`,
      [userId, questions[a.qIdx].id, a.opt, a.correct]
    );
  }

  // 4. Re-seed 3 Weak-Spot Flashcards
  const flashcardData = [
    {
      qIdx: 0,
      front: 'What is the fundamental difference between CapEx and OpEx in cloud computing?',
      back: 'CapEx requires upfront physical hardware spending. OpEx is ongoing pay-as-you-go consumption with zero upfront hardware costs.',
      notes: { standard: 'CapEx is upfront hardware; OpEx is pay-as-you-go.', african_analogy: 'CapEx is buying the bus cash; OpEx is paying per trip.', sheng: 'CapEx ni kubuy gari cash; OpEx ni kulipa fare ya matatu kila siku.' },
    },
    {
      qIdx: 2,
      front: 'What protection does an Azure Availability Zone provide that an Availability Set cannot?',
      back: 'Availability Zones protect against an entire data center facility outage (independent power, cooling, network). Availability Sets only protect against rack/server hardware failure inside a single building.',
      notes: { standard: 'Zones provide datacenter-level fault tolerance; Sets provide rack-level tolerance.', african_analogy: 'Sets are backup plugs in the same shop; Zones are shops in different estates with separate KPLC lines.', sheng: 'Sets ni generator kwa duka moja; Zones ni branches tofauti kama Westlands na CBD.' },
    },
    {
      qIdx: 4,
      front: 'When should you use Azure Policy instead of Role-Based Access Control (RBAC)?',
      back: 'Use RBAC to define WHO has permissions to act. Use Azure Policy to enforce WHAT properties and compliance rules (like allowed regions or naming conventions) the resources must follow.',
      notes: { standard: 'RBAC focuses on user identity; Policy focuses on resource compliance.', african_analogy: 'RBAC is checking driver identity at the entrance; Policy is the height bar that prevents big trucks regardless of who drives.', sheng: 'RBAC ni kitambulisho ya dereva; Policy ni bump kwa gate inayozuia gari kubwa kuingia.' },
    },
  ];

  for (const f of flashcardData) {
    const q = questions[f.qIdx];
    await db.query(
      `INSERT INTO flashcards (user_id, domain_id, topic_tag, front_prompt, back_explanation, context_notes, interval_days, repetition_count, ease_factor, next_review_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, 0, 2.50, CURRENT_TIMESTAMP);`,
      [userId, q.domain_id, q.topic_tag, f.front, f.back, JSON.stringify(f.notes)]
    );
  }

  // 5. Re-seed default study plan
  const syllabusRes = await db.query('SELECT id FROM syllabi WHERE is_flagship = true LIMIT 1;');
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);

  const planSchedule = [
    { day: 1, topic: 'Cloud Concepts (CapEx vs OpEx, Cloud Benefits)', status: 'completed' },
    { day: 2, topic: 'Cloud Models: Public, Private & Hybrid', status: 'completed' },
    { day: 3, topic: 'Azure Architecture: Regions & Availability Zones', status: 'in_progress' },
    { day: 4, topic: 'Azure Compute: VMs vs App Service vs Functions', status: 'pending' },
    { day: 5, topic: 'Azure Storage & Networking Fundamentals', status: 'pending' },
    { day: 6, topic: 'Identity, Access & Security (Microsoft Entra ID)', status: 'pending' },
    { day: 7, topic: 'Azure Governance: Policy, RBAC & Locks', status: 'pending' },
    { day: 8, topic: 'Cost Management & Resource Tagging', status: 'pending' },
    { day: 9, topic: 'Weak Area Revision (Flashcard Drill)', status: 'pending' },
    { day: 10, topic: 'Full AZ-900 Simulation Sprint', status: 'pending' }
  ];

  await db.query(
    `INSERT INTO study_plans (user_id, syllabus_id, target_exam_date, daily_hours, schedule_data)
     VALUES ($1, $2, $3, $4, $5);`,
    [userId, syllabusRes.rows[0].id, targetDate, 1.5, JSON.stringify(planSchedule)]
  );

  const updatedReadiness = await readinessService.calculateReadiness(db, userId);

  return sendSuccess(res, {
    message: 'Demo learner telemetry cleanly reset to initial baseline state.',
    readiness: updatedReadiness,
  });
});

module.exports = {
  getDashboardData,
  createOrUpdatePlan,
  resetDemo,
};
