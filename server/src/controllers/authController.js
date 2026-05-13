// controllers/authController.js — in-memory auth (no MongoDB required)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const SECRET = process.env.JWT_SECRET || 'mindtrail_secret'

// In-memory user store — persists as long as server is running
const users = []
let nextId = 1

function makeToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, onboarded: user.onboarded, branch: user.branch, subject: user.subject, level: user.level, interests: user.interests || [] }
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' })
    if (users.find(u => u.email === email)) return res.status(409).json({ message: 'Email already in use.' })
    const hashed = await bcrypt.hash(password, 10)
    const user = { id: nextId++, name, email, password: hashed, onboarded: false, branch: null, subject: null, level: null, interests: [] }
    users.push(user)
    res.status(201).json({ token: makeToken(user), user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'All fields required.' })
    const user = users.find(u => u.email === email)
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' })
    res.json({ token: makeToken(user), user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function saveProfile(req, res) {
  try {
    const { userId, branch, subject, level, interests } = req.body
    const user = users.find(u => u.id == userId)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    Object.assign(user, { branch, subject, level, interests, onboarded: true })
    res.json({ user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login, saveProfile }
