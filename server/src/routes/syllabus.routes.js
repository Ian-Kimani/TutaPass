const { Router } = require('express');
const syllabusController = require('../controllers/syllabus.controller');
const validateRequest = require('../middleware/validateRequest');
const { validateSyllabusImport } = require('../validators/api.validators');

const router = Router();

router.get('/', syllabusController.getAllSyllabi);
router.post('/import', validateRequest(validateSyllabusImport), syllabusController.importSyllabus);

module.exports = router;
