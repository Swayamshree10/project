// controllers/quizController.js — generates MCQs with Bloom's taxonomy + topic tags
const { callClaude } = require('../services/claudeService')

async function generateQuiz(req, res) {
  const { branch, subject, level, interests, bloomLevel } = req.body

  const bloomFilter = bloomLevel
    ? `Focus questions at Bloom's Taxonomy level: ${bloomLevel}.`
    : `Mix questions across all Bloom's Taxonomy levels (Remember, Understand, Apply, Analyze, Evaluate, Create).`

  const systemPrompt = `You are a quiz generator. Return ONLY valid JSON, no markdown, no explanation, no extra text.`

  const prompt = `Generate 5 MCQs on ${subject} for a ${level} ${branch} student.

JSON format:
{"questions":[{"id":1,"topic":"subtopic","bloom":"Remember","question":"?","options":["A) ","B) ","C) ","D) "],"answer":"A","explanation":"brief"}]}`

  try {
    const raw = await callClaude([{ role: 'user', content: prompt }], systemPrompt, 1200)
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim()
    const data = JSON.parse(cleaned)
    res.json(data)
  } catch (err) {
    console.error('[Quiz Error]', err?.message || err)
    res.status(500).json({ error: err?.message || 'Failed to generate quiz' })
  }
}

async function submitQuiz(req, res) {
  const { questions, answers } = req.body
  let score = 0
  const results = questions.map((q) => {
    const correct = answers[q.id] === q.answer
    if (correct) score++
    return {
      id: q.id,
      topic: q.topic,
      bloom: q.bloom,
      correct,
      chosen: answers[q.id],
      answer: q.answer,
      explanation: q.explanation,
    }
  })
  res.json({ score, total: questions.length, results })
}

module.exports = { generateQuiz, submitQuiz }
