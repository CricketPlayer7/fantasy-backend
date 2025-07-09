import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { AuthController } from '../controllers/authController'

const router = express.Router()
const authController = new AuthController()

router.get('/confirm', authController.confirmAuth.bind(authController))
router.post('/signout', authMiddleware, authController.signOut.bind(authController))

export default router
