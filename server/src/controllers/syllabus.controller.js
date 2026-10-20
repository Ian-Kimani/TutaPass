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
