const { Router } = require('express');
const syllabusRoutes = require('./syllabus.routes');
const dashboardRoutes = require('./dashboard.routes');
const quizRoutes = require('./quiz.routes');
const flashcardRoutes = require('./flashcard.routes');
const aiRoutes = require('./ai.routes');

const router = Router();

router.use('/syllabus', syllabusRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/quiz', quizRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
