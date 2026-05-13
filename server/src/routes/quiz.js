// routes/quiz.js — quiz generation and submission routes
const { Router } = require('express')
const { generateQuiz, submitQuiz } = require('../controllers/quizController')

const router = Router()
router.post('/generate', generateQuiz)
router.post('/submit', submitQuiz)
module.exports = router
