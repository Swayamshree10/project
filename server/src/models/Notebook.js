// models/Notebook.js
const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: 'Untitled' },
  content: { type: String, default: '' },
  topic: { type: String, default: 'Other' },
  aiGenerated: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Note', noteSchema)
