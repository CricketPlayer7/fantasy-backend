import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { SentimentController } from '../controllers/sentimentController'

const router = express.Router()
const sentimentController = new SentimentController()

router.get(
	'/',
	authMiddleware,
	sentimentController.getSentiment.bind(sentimentController)
)

export default router
