// controllers/flashcardsController.js — generates flashcards via NVIDIA NIM
const { callClaude } = require('../services/claudeService')

async function generateFlashcards(req, res) {
  const { branch, subject, level } = req.body

  const systemPrompt = `You are a flashcard generator for engineering students. Return ONLY valid JSON, no markdown, no explanation.`

  const prompt = `Generate 10 flashcards for ${subject} (${branch} engineering, ${level} level).

Return this exact JSON:
{
  "flashcards": [
    { "front": "question or concept", "back": "answer or explanation with formula if applicable" }
  ]
}`

  try {
    const raw = await callClaude([{ role: 'user', content: prompt }], systemPrompt, 2000)
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim()
    const data = JSON.parse(cleaned)
    res.json(data)
  } catch (err) {
    console.error('[Flashcards Error]', err?.message || err)
    res.status(500).json({ error: err?.message || 'Failed to generate flashcards' })
  }
}

module.exports = { generateFlashcards }
