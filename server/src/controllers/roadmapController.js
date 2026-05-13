// controllers/roadmapController.js — generates prerequisite graph via AI
const { callClaude } = require('../services/claudeService')

async function getPrerequisiteGraph(req, res) {
  const { branch, subject, level, weakTopics } = req.body

  const systemPrompt = `You are a curriculum expert. Return ONLY valid JSON, no markdown, no explanation.`

  const prompt = `Generate a prerequisite topic graph for ${subject} (${branch}, ${level} level).
Weak topics the student struggles with: ${weakTopics?.join(', ') || 'none identified yet'}.

Return this exact JSON:
{
  "nodes": [
    { "id": "topic_id", "label": "Topic Name", "bloom": "Remember|Understand|Apply|Analyze|Evaluate|Create", "difficulty": "easy|medium|hard" }
  ],
  "edges": [
    { "source": "topic_id_1", "target": "topic_id_2" }
  ]
}

Rules:
- 8 to 12 nodes covering the subject thoroughly
- edges go from prerequisite → dependent (source must be learned before target)
- bloom = the primary Bloom's level this topic targets
- difficulty = relative difficulty of the topic`

  try {
    const raw = await callClaude([{ role: 'user', content: prompt }], systemPrompt, 2000)
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim()
    const data = JSON.parse(cleaned)
    res.json(data)
  } catch (err) {
    console.error('[Roadmap Error]', err?.message || err)
    res.status(500).json({ error: err?.message || 'Failed to generate graph' })
  }
}

module.exports = { getPrerequisiteGraph }
