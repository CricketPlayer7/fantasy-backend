import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { UserController } from '../controllers/userController'

const router = express.Router()
const userController = new UserController()

router.put(
  '/',
  authMiddleware,
  userController.updateUserMeta.bind(userController)
)

export default router
