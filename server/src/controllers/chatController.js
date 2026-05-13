// controllers/chatController.js — builds system prompt from user profile and calls NVIDIA NIM
const { callClaude } = require('../services/claudeService')

async function sendMessage(req, res) {
  const { messages, branch, subject, level, interests } = req.body

  if (!messages || messages.length === 0)
    return res.status(400).json({ error: 'messages are required' })

  const systemPrompt = `You are Mind Trail, an expert engineering tutor specializing in ${branch} engineering.
The student is studying ${subject} at a ${level} level.
Their interests include: ${interests || 'general engineering'}.
Explain concepts clearly with real-world examples. Be concise and use markdown for code blocks and lists.`

  try {
    const reply = await callClaude(messages, systemPrompt)
    res.json({ reply })
  } catch (err) {
    console.error('[Chat Error]', err?.message || err)
    res.status(500).json({ error: err?.message || 'AI call failed' })
  }
}

module.exports = { sendMessage }
