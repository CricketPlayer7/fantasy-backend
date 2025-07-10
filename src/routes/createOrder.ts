import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { CreateOrderController } from '../controllers/createOrderController'

const router = express.Router()
const createOrderController = new CreateOrderController()

router.post(
  '/',
  authMiddleware,
  createOrderController.createOrder.bind(createOrderController)
)

export default router