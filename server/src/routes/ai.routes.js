const { Router } = require('express');
const aiController = require('../controllers/ai.controller');

const router = Router();

router.post('/explain', aiController.explainConcept);

module.exports = router;
