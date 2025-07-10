import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { CricketAnswersController } from '../controllers/cricket/answersController'
import { CricketLeaderboardController } from '../controllers/cricket/leaderboardController'
import { CricketLeagueController } from '../controllers/cricket/leagueController'

const router = express.Router()
const answersController = new CricketAnswersController()
const leaderboardController = new CricketLeaderboardController()
const leagueController = new CricketLeagueController()

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

// League routes
router.get(
  '/league',
  leagueController.getLeagues.bind(leagueController)
)

router.post(
  '/league',
  leagueController.getLeagueById.bind(leagueController)
)

router.get(
  '/league/get-participants-count',
  leagueController.getParticipantsCount.bind(leagueController)
)

// Add other cricket routes here...

export default router