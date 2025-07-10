import express from 'express'
import { StartupController } from '../controllers/startupController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const startupController = new StartupController()

// POST /api/startup - Start notification listener (requires auth for system operations)
router.post('/', authMiddleware, startupController.start)

export default router
