/**
 * Exam Readiness Engine
 * Calculates multi-domain mastery, retention velocity, and overall exam pass readiness score.
 */

const calculateReadiness = async (db, userId = 'demo-learner') => {
  // 1. Fetch official domains
  const domainRes = await db.query(`
    SELECT d.id, d.name, d.weight_min, d.weight_max, d.description
    FROM domains d
    JOIN syllabi s ON d.syllabus_id = s.id
    WHERE s.is_flagship = true
    ORDER BY d.id ASC;
  `);

  const domains = domainRes.rows;

  // 2. Fetch user attempts grouped by domain
  const attemptsRes = await db.query(`
    SELECT 
      qq.domain_id,
      COUNT(ua.id)::int AS total_attempts,
      COUNT(CASE WHEN ua.is_correct THEN 1 END)::int AS correct_attempts
    FROM user_attempts ua
    JOIN quiz_questions qq ON ua.question_id = qq.id
    WHERE ua.user_id = $1
    GROUP BY qq.domain_id;
  `, [userId]);

  const attemptMap = {};
  let totalUserAttempts = 0;
  let totalUserCorrect = 0;

  attemptsRes.rows.forEach((row) => {
    attemptMap[row.domain_id] = {
      total: row.total_attempts,
      correct: row.correct_attempts,
    };
    totalUserAttempts += row.total_attempts;
    totalUserCorrect += row.correct_attempts;
  });

  // 3. Fetch flashcards telemetry
  const cardsRes = await db.query(`
    SELECT 
      domain_id,
      COUNT(id)::int AS total_cards,
      COUNT(CASE WHEN repetition_count > 0 THEN 1 END)::int AS reviewed_cards,
      COUNT(CASE WHEN next_review_at <= CURRENT_TIMESTAMP THEN 1 END)::int AS due_cards
    FROM flashcards
    WHERE user_id = $1
    GROUP BY domain_id;
  `, [userId]);

  const cardsMap = {};
  let totalCardsCount = 0;
  let dueCardsCount = 0;

  cardsRes.rows.forEach((row) => {
    cardsMap[row.domain_id] = {
      total: row.total_cards,
      reviewed: row.reviewed_cards,
      due: row.due_cards,
    };
    totalCardsCount += row.total_cards;
    dueCardsCount += row.due_cards;
  });

  // 4. Compute per-domain mastery
  let weightedMasterySum = 0;
  let totalWeightSum = 0;

  const domainMasteryList = domains.map((domain) => {
    const attempts = attemptMap[domain.id] || { total: 0, correct: 0 };
    const cards = cardsMap[domain.id] || { total: 0, reviewed: 0, due: 0 };

    const avgWeight = (domain.weight_min + domain.weight_max) / 2;
    totalWeightSum += avgWeight;

    // Calculate accuracy percentage for this domain
    let domainScore = 0;
    if (attempts.total > 0) {
      domainScore = (attempts.correct / attempts.total) * 100;
    } else {
      // Baseline cold-start score
      domainScore = 40;
    }

    // Incorporate flashcard reinforcement bonus if any cards reviewed
    if (cards.total > 0) {
      const cardFactor = (cards.reviewed / cards.total) * 10;
      domainScore = Math.min(100, domainScore + cardFactor);
    }

    const roundedDomainScore = Math.round(domainScore);
    weightedMasterySum += roundedDomainScore * avgWeight;

    return {
      id: domain.id,
      name: domain.name,
      weightRange: `${domain.weight_min}–${domain.weight_max}%`,
      totalAttempts: attempts.total,
      correctAttempts: attempts.correct,
      masteryPercentage: roundedDomainScore,
      cardsCount: cards.total,
      cardsDue: cards.due,
    };
  });

  // 5. Calculate composite overall readiness score
  const rawReadiness = totalWeightSum > 0 ? weightedMasterySum / totalWeightSum : 0;
  const overallReadiness = Math.min(100, Math.max(0, Math.round(rawReadiness)));

  // 6. Determine Exam Readiness Verdict
  let verdict = 'Build Foundation';
  let verdictColor = 'amber';
  let advice = 'Focus on core concepts and basic quizzes to establish foundational knowledge.';

  if (overallReadiness >= 80) {
    verdict = 'Exam Ready!';
    verdictColor = 'emerald';
    advice = 'Outstanding! You are scoring at certification pass level. Do speed drills and stay confident.';
  } else if (overallReadiness >= 60) {
    verdict = 'Sharpening Phase';
    verdictColor = 'indigo';
    advice = 'Solid progress! Drill down on distractor autopsies and clear due flashcards to reach 80%+.';
  }

  return {
    overallReadiness,
    verdict,
    verdictColor,
    advice,
    domains: domainMasteryList,
    metrics: {
      totalAttempts: totalUserAttempts,
      correctAttempts: totalUserCorrect,
      overallAccuracy: totalUserAttempts > 0
        ? Math.round((totalUserCorrect / totalUserAttempts) * 100)
        : 0,
      totalFlashcards: totalCardsCount,
      dueFlashcards: dueCardsCount,
    },
  };
};

module.exports = {
  calculateReadiness,
};
