// controllers/uploadController.js — handles file uploads, extracts text, stores in memory
const multer = require('multer')

// In-memory document store
const documentStore = []

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

async function extractPdfText(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return text
}

async function uploadFile(req, res) {
  try {
    const file = req.file
    const subject = req.query.subject || req.body.subject || 'general'
    if (!file) return res.status(400).json({ detail: 'No file provided.' })

    const ext = file.originalname.toLowerCase().split('.').pop()
    let text = ''

    if (ext === 'pdf') {
      text = await extractPdfText(file.buffer)
    } else if (ext === 'txt') {
      text = file.buffer.toString('utf-8')
    } else if (ext === 'docx') {
      text = file.buffer.toString('utf-8').replace(/<[^>]+>/g, ' ')
    } else {
      return res.status(400).json({ detail: `Unsupported file type: .${ext}` })
    }

    const words = text.split(/\s+/).filter(Boolean)
    const chunkSize = 500
    const chunks = []
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '))
    }

    documentStore.push({ filename: file.originalname, subject, chunks, text: text.slice(0, 50000) })
    console.log(`[Upload] ${file.originalname} → ${chunks.length} chunks`)
    res.json({ message: `'${file.originalname}' uploaded successfully.`, chunks: chunks.length, subject })
  } catch (err) {
    console.error('[Upload Error]', err.message)
    res.status(500).json({ detail: err.message || 'Upload failed' })
  }
}

function getDocumentContext(question) {
  if (documentStore.length === 0) return null
  const q = question.toLowerCase()
  const relevant = []
  for (const doc of documentStore) {
    for (const chunk of doc.chunks) {
      const score = q.split(' ').filter(w => w.length > 3 && chunk.toLowerCase().includes(w)).length
      if (score > 0) relevant.push({ chunk, score, filename: doc.filename })
    }
  }
  relevant.sort((a, b) => b.score - a.score)
  const top = relevant.slice(0, 4).map(r => `[${r.filename}]: ${r.chunk}`).join('\n\n')
  return top || documentStore.map(d => d.text.slice(0, 1000)).join('\n\n')
}

module.exports = { upload, uploadFile, getDocumentContext, documentStore }
