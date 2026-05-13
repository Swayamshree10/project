// routes/upload.js
const { Router } = require('express')
const { upload, uploadFile } = require('../controllers/uploadController')
const router = Router()

router.post('/', upload.single('file'), uploadFile)

module.exports = router
