import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { DevicesController } from '../controllers/devicesController'

const router = express.Router()
const devicesController = new DevicesController()

router.post(
  '/register',
  authMiddleware,
  devicesController.registerDevice.bind(devicesController)
)

export default router