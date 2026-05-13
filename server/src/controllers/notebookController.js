// controllers/notebookController.js — in-memory notebook (no MongoDB required)
const { callClaude } = require('../services/claudeService')

const notes = []
let nextId = 1

async function getNotes(req, res) {
  const { userId, topic } = req.query
  let result = notes.filter(n => n.userId === userId)
  if (topic && topic !== 'All') result = result.filter(n => n.topic === topic)
  res.json(result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
}

async function createNote(req, res) {
  const note = { _id: String(nextId++), ...req.body, createdAt: new Date(), updatedAt: new Date() }
  notes.push(note)
  res.status(201).json(note)
}

async function updateNote(req, res) {
  const idx = notes.findIndex(n => n._id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date() }
  res.json(notes[idx])
}

async function deleteNote(req, res) {
  const idx = notes.findIndex(n => n._id === req.params.id)
  if (idx !== -1) notes.splice(idx, 1)
  res.json({ success: true })
}

async function summarizeNote(req, res) {
  const { topic, userId } = req.body
  const systemPrompt = `You are an expert study notes generator. Create comprehensive, well-structured study notes.`
  const prompt = `Generate detailed study notes on: "${topic}"\n\nFormat with clear headings, bullet points, key formulas, and examples.`
  try {
    const content = await callClaude([{ role: 'user', content: prompt }], systemPrompt, 1500)
    const note = { _id: String(nextId++), userId, title: topic, content, topic: 'Other', aiGenerated: true, createdAt: new Date(), updatedAt: new Date() }
    notes.push(note)
    res.json(note)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote, summarizeNote }
