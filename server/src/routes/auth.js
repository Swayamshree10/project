// routes/auth.js
const { Router } = require('express')
const { register, login, saveProfile } = require('../controllers/authController')
const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/profile', saveProfile)

module.exports = router
