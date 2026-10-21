const db = require('../src/config/db');
const geminiService = require('../src/services/gemini.service');

async function run() {
  try {
    const syllabiRes = await db.query('SELECT * FROM syllabi WHERE is_flagship = false ORDER BY id ASC;');
    console.log(`Found ${syllabiRes.rows.length} non-flagship syllabi to update.`);

    for (const syllabus of syllabiRes.rows) {
      console.log(`\n=== Processing: ${syllabus.title} (ID: ${syllabus.id}, Code: ${syllabus.code}) ===`);

      // 1. Fetch domains
      const dRes = await db.query('SELECT * FROM domains WHERE syllabus_id = $1 ORDER BY id ASC;', [syllabus.id]);
      const domains = dRes.rows;
      console.log(`Found ${domains.length} domains:`, domains.map(d => d.name));

      // 2. Clear old quiz questions and study plans for this syllabus
      await db.query(
        'DELETE FROM quiz_questions WHERE domain_id IN (SELECT id FROM domains WHERE syllabus_id = $1);',
        [syllabus.id]
      );
      await db.query('DELETE FROM study_plans WHERE syllabus_id = $1;', [syllabus.id]);

      // 3. Generate tailored questions for each domain
      for (const d of domains) {
        console.log(`Generating question for domain: "${d.name}"...`);
        try {
          const qGen = await geminiService.generateQuizQuestions({
            syllabusTitle: syllabus.title,
            domainName: d.name,
            topicTag: d.name,
            count: 1,
            difficulty: 'medium',
          });
          const q = qGen.result[0];
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
              'medium',
            ]
          );
          console.log(`✓ Inserted question for "${d.name}":`, q.scenario.slice(0, 70));
        } catch (err) {
          console.error(`Failed to generate question for "${d.name}":`, err.message);
        }
      }

      // 4. Generate tailored study plan
      console.log(`Generating tailored study plan for "${syllabus.title}"...`);
      try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 14);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        const planGen = await geminiService.generateStudyPlan({
          syllabusTitle: syllabus.title,
          targetExamDate: targetDateStr,
          dailyHours: 1.5,
          weakAreas: domains.map(d => d.name),
        });

        const scheduleData = planGen.result?.schedule || planGen.result;
        await db.query(
          `INSERT INTO study_plans (user_id, syllabus_id, target_exam_date, daily_hours, schedule_data)
           VALUES ($1, $2, $3, $4, $5);`,
          [
            'demo-learner',
            syllabus.id,
            targetDateStr,
            1.5,
            JSON.stringify(scheduleData),
          ]
        );
        console.log(`✓ Inserted tailored study plan with ${Array.isArray(scheduleData) ? scheduleData.length : 0} days.`);
      } catch (err) {
        console.error(`Failed to generate study plan:`, err.message);
      }
    }

    console.log('\nAll non-flagship syllabi updated successfully!');
  } catch (err) {
    console.error('Fatal error during update:', err);
  } finally {
    process.exit(0);
  }
}

run();
