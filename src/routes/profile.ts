import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { ProfileController } from '../controllers/profileController'

const router = express.Router()
const profileController = new ProfileController()

router.post(
  '/get-gender',
  authMiddleware,
  profileController.getGenders.bind(profileController)
)

export default router
