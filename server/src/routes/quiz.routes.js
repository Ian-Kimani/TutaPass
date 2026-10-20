const { Router } = require('express');
const quizController = require('../controllers/quiz.controller');
const validateRequest = require('../middleware/validateRequest');
const { validateQuizAttempt } = require('../validators/api.validators');

const router = Router();

router.get('/', quizController.getQuestions);
router.post('/attempt', validateRequest(validateQuizAttempt), quizController.submitAttempt);
router.post('/generate', quizController.generateMoreQuestions);

module.exports = router;
