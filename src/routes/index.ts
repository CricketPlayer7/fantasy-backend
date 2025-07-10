import express from 'express'
import sentimentRouter from './sentiment'
import authRouter from './auth'
import couponsRouter from './coupons'
import devicesRouter from './devices'
import documentRouter from './document'

const router = express.Router()

router.use('/analytics/sentiment', sentimentRouter)
router.use('/auth', authRouter)
router.use('/coupons', couponsRouter)
router.use('/devices', devicesRouter)
router.use('/document', documentRouter)

export default router
