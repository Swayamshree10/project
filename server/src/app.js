// src/app.js — Express app with all routes mounted
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/quiz', require('./routes/quiz'))
app.use('/api/flashcards', require('./routes/flashcards'))
app.use('/api/roadmap', require('./routes/roadmap'))
app.use('/api/notebook', require('./routes/notebook'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/rag', require('./routes/rag'))

module.exports = app
