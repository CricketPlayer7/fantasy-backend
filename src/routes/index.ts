import express from 'express'
import sentimentRouter from './sentiment'
import authRouter from './auth'

const router = express.Router()

router.use('/analytics/sentiment', sentimentRouter)
router.use('/auth', authRouter)

export default router
