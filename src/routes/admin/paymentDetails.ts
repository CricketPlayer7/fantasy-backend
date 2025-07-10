import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminPaymentDetailsController } from '../../controllers/admin/paymentDetailsController'

const router = express.Router()
const controller = new AdminPaymentDetailsController()

router.get(
	'/',
	adminAuthMiddleware,
	controller.getPaymentDetails.bind(controller)
)

export default router
