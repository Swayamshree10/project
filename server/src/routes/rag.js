// routes/rag.js
const { Router } = require('express')
const { callClaude } = require('../services/claudeService')
const { getDocumentContext, documentStore } = require('../controllers/uploadController')
const router = Router()

router.post('/query', async (req, res) => {
  const { question } = req.body
  if (!question) return res.status(400).json({ error: 'question required' })

  const context = getDocumentContext(question)

  const systemPrompt = context
    ? `You are Mind Trail, an expert engineering tutor. Use ONLY the context below to answer. If the answer is not in the context, say "I don't have that topic in the uploaded documents yet."\n\nContext:\n${context}`
    : `You are Mind Trail, an expert engineering tutor. Answer the question accurately and technically.`

  try {
    const answer = await callClaude([{ role: 'user', content: question }], systemPrompt, 1000)
    const sources = context
      ? documentStore.slice(-3).map(d => ({ source: d.filename, snippet: d.text.slice(0, 150) }))
      : []
    res.json({ answer, sources })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/health', (_req, res) => res.json({ status: 'ok', docs: documentStore.length }))

module.exports = router
