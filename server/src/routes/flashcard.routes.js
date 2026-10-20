const { Router } = require('express');
const flashcardController = require('../controllers/flashcard.controller');
const validateRequest = require('../middleware/validateRequest');
const { validateFlashcardReview } = require('../validators/api.validators');

const router = Router();

router.get('/', flashcardController.getFlashcards);
router.post('/:id/review', validateRequest(validateFlashcardReview), flashcardController.reviewFlashcard);

module.exports = router;
