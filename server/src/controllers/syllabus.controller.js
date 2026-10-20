const db = require('../config/db');
const geminiService = require('../services/gemini.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Fetch all syllabi with their associated domains and weights.
 */
const getAllSyllabi = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      s.id, 
      s.title, 
      s.code, 
      s.description, 
      s.is_flagship, 
      s.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', d.id, 
            'name', d.name, 
            'weight_min', d.weight_min, 
            'weight_max', d.weight_max, 
            'description', d.description
          ) ORDER BY d.id ASC
        ) FILTER (WHERE d.id IS NOT NULL), '[]'
      ) AS domains
    FROM syllabi s
    LEFT JOIN domains d ON s.id = d.syllabus_id
    GROUP BY s.id
    ORDER BY s.is_flagship DESC, s.id ASC;
  `;

  const { rows } = await db.query(query);
  return sendSuccess(res, rows);
});

/**
 * Universal Syllabus Importer
 * Uses Gemini to parse raw outline text into structured domains, then persists to Neon.
 */
const importSyllabus = asyncHandler(async (req, res) => {
  const { rawText, title } = req.body;

  const { result, promptTelemetry } = await geminiService.parseSyllabus({
    rawText,
    title: title || 'Imported Certification Curriculum',
  });

  if (!result || !result.domains || !Array.isArray(result.domains)) {
    return sendError(res, 'Failed to extract structured syllabus domains from provided text.', 422);
  }

  // Insert into syllabi table
  const syllabusInsert = await db.query(
    `INSERT INTO syllabi (title, code, description, is_flagship)
     VALUES ($1, $2, $3, false)
     RETURNING id, title, code, description, is_flagship, created_at;`,
    [
      result.title || title || 'Custom Imported Syllabus',
      result.code || 'CUSTOM',
      result.description || 'Imported curriculum via TutaPass Universal Importer',
    ]
  );

  const newSyllabus = syllabusInsert.rows[0];
  const createdDomains = [];

  // Insert domains
  for (const d of result.domains) {
    const dRes = await db.query(
      `INSERT INTO domains (syllabus_id, name, weight_min, weight_max, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, weight_min, weight_max, description;`,
      [
        newSyllabus.id,
        d.name,
        d.weight_min || 20,
        d.weight_max || 30,
        d.description || '',
      ]
    );
    createdDomains.push(dRes.rows[0]);
  }

  // Automatically seed starter scenario questions with Distractor Autopsies for each new domain
  for (const d of createdDomains) {
    try {
      const qGen = await geminiService.generateQuizQuestions({
        domainName: d.name,
        topicTag: d.name,
        count: 1,
        difficulty: 'medium',
      });
      const qList = qGen?.result || [];
      if (Array.isArray(qList) && qList.length > 0) {
        const q = qList[0];
        await db.query(
          `INSERT INTO quiz_questions (domain_id, topic_tag, scenario, question, options, context_translations, difficulty)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [
            d.id,
            q.topic_tag || d.name,
            q.scenario,
            q.question,
            JSON.stringify(q.options),
            JSON.stringify(q.context_translations),
            q.difficulty || 'medium',
          ]
        );
      } else {
        throw new Error('Empty generation');
      }
    } catch {
      // Tailored fallback question for this specific domain
      const fallbackOptions = [
        {
          id: 'A',
          text: `Core established principle for ${d.name}`,
          is_correct: true,
          autopsy: {
            why_wrong: 'N/A - This is correct.',
            right_scenario: `Direct standard procedure for ${d.name}.`,
            trap: 'N/A',
          },
        },
        {
          id: 'B',
          text: `Alternative approach with high latency/overhead`,
          is_correct: false,
          autopsy: {
            why_wrong: `Introduces unnecessary overhead not recommended for ${d.name}.`,
            right_scenario: 'Specialized batch testing environments.',
            trap: 'Picking complex solutions over direct best practices.',
          },
        },
        {
          id: 'C',
          text: `Deprecated or non-standard technique`,
          is_correct: false,
          autopsy: {
            why_wrong: `Fails modern criteria for ${d.name}.`,
            right_scenario: 'Legacy architectures only.',
            trap: 'Relying on obsolete exam patterns.',
          },
        },
        {
          id: 'D',
          text: `Unrelated constraint from another domain`,
          is_correct: false,
          autopsy: {
            why_wrong: `Irrelevant to solving ${d.name}.`,
            right_scenario: 'General security perimeter isolation.',
            trap: 'Confusing domain responsibilities.',
          },
        },
      ];

      const fallbackContext = {
        standard: `Understanding ${d.name} is fundamental to passing this certification. Focus on core application rules and constraints.`,
        african_context: `Think of ${d.name} like running a disciplined market stall or SACCO—you need consistent, verified rules to avoid costly errors!`,
        sheng: `Kwa ${d.name}, jambo la msingi ni kushika sheria za msingi ili usipoteze marks za bure kwa exam.`,
      };

      await db.query(
        `INSERT INTO quiz_questions (domain_id, topic_tag, scenario, question, options, context_translations, difficulty)
         VALUES ($1, $2, $3, $4, $5, $6, 'medium');`,
        [
          d.id,
          d.name,
          `A student or practitioner is presented with a standard problem in ${d.name} and must apply the most effective solution.`,
          `Which method represents the most accurate approach for ${d.name}?`,
          JSON.stringify(fallbackOptions),
          JSON.stringify(fallbackContext),
        ]
      );
    }
  }

  return sendSuccess(
    res,
    {
      syllabus: newSyllabus,
      domains: createdDomains,
    },
    promptTelemetry,
    201
  );
});

module.exports = {
  getAllSyllabi,
  importSyllabus,
};
