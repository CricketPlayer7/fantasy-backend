import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { CricketAnswersController } from '../controllers/cricket/answersController'
import { CricketLeaderboardController } from '../controllers/cricket/leaderboardController'
import { CricketLeagueController } from '../controllers/cricket/leagueController'
import { CricketMatchesController } from '../controllers/cricket/matchesController'
import { CricketMatchController } from '../controllers/cricket/matchController'

const router = express.Router()
const answersController = new CricketAnswersController()
const leaderboardController = new CricketLeaderboardController()
const leagueController = new CricketLeagueController()
const matchesController = new CricketMatchesController()
const matchController = new CricketMatchController()

// Answers route
router.get(
  '/answers',
  authMiddleware,
  answersController.getAnswers.bind(answersController)
)

// Leaderboard route
router.get(
  '/leaderboard',
  authMiddleware,
  leaderboardController.getLeaderboard.bind(leaderboardController)
)

// League routes
router.get(
  '/league',
  authMiddleware,
  leagueController.getLeagues.bind(leagueController)
)

router.post(
  '/league',
  authMiddleware,
  leagueController.getLeagueById.bind(leagueController)
)

router.get(
  '/league/get-participants-count',
  authMiddleware,
  leagueController.getParticipantsCount.bind(leagueController)
)

// Matches routes
router.post(
  '/matches/list',
  authMiddleware,
  matchesController.getMatchesList.bind(matchesController)
)

// Match routes
router.post(
  '/match/get-match',
  authMiddleware,
  matchController.getMatch.bind(matchController)
)

router.post(
  '/match/scorecard',
  authMiddleware,
  matchController.getScorecard.bind(matchController)
)

// Add other cricket routes here...

export default router