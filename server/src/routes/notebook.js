// routes/notebook.js
const { Router } = require('express')
const { getNotes, createNote, updateNote, deleteNote, summarizeNote } = require('../controllers/notebookController')
const router = Router()

router.get('/', getNotes)
router.post('/', createNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)
router.post('/summarize', summarizeNote)

module.exports = router
