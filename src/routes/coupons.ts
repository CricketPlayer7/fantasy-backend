import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { CouponsController } from '../controllers/couponsController'

const router = express.Router()
const couponsController = new CouponsController()

router.post(
  '/apply',
  authMiddleware,
  couponsController.applyCoupon.bind(couponsController)
)

router.get(
  '/user/available',
  authMiddleware,
  couponsController.getUserAvailableCoupons.bind(couponsController)
)

export default router