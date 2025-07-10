import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { ReferralController } from '../controllers/referralController'

const router = express.Router()
const referralController = new ReferralController()

router.post(
  '/generate-link',
  authMiddleware,
  referralController.generateLink.bind(referralController)
)

router.get(
  '/my-referrals',
  authMiddleware,
  referralController.getMyReferrals.bind(referralController)
)

router.post(
  '/redeem',
  authMiddleware,
  referralController.redeemReferral.bind(referralController)
)

export default router
