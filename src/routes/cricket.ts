import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { CricketAnswersController } from '../controllers/cricket/answersController'
import { CricketLeaderboardController } from '../controllers/cricket/leaderboardController'

const router = express.Router()
const answersController = new CricketAnswersController()
const leaderboardController = new CricketLeaderboardController()

// Answers route
router.get(
  '/answers',
  authMiddleware,
  answersController.getAnswers.bind(answersController)
)

// Leaderboard route
router.get(
  '/leaderboard',
  leaderboardController.getLeaderboard.bind(leaderboardController)
)

// Add other cricket routes here...

export default router