import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { UserController } from '../controllers/userController'

const router = express.Router()
const userController = new UserController()

router.post(
  '/track-activity',
  authMiddleware,
  userController.trackActivity.bind(userController)
)

export default router
