// routes/roadmap.js — roadmap and prerequisite graph routes
const { Router } = require('express')
const { getPrerequisiteGraph } = require('../controllers/roadmapController')

const router = Router()
router.post('/graph', getPrerequisiteGraph)
module.exports = router
