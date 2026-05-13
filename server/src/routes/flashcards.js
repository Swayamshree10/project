// routes/flashcards.js — flashcard generation route
const { Router } = require('express')
const { generateFlashcards } = require('../controllers/flashcardsController')

const router = Router()
router.post('/generate', generateFlashcards)
module.exports = router
