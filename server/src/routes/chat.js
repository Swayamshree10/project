// routes/chat.js — chat routes for AI conversation
const { Router } = require('express')
const { sendMessage } = require('../controllers/chatController')

const router = Router()
router.post('/', sendMessage)
module.exports = router
