import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { GamificationController } from '../controllers/gamificationController'

const router = express.Router()
const gamificationController = new GamificationController()

router.get(
  '/',
  authMiddleware,
  gamificationController.getGamificationData.bind(gamificationController)
)

router.get(
  '/badges',
  authMiddleware,
  gamificationController.getBadges.bind(gamificationController)
)

router.get(
  '/prediction-results',
  authMiddleware,
  gamificationController.getPredictionResults.bind(gamificationController)
)

router.get(
  '/tiers',
  authMiddleware,
  gamificationController.getTiers.bind(gamificationController)
)

export default router
