import express from 'express'
import sentimentRouter from './sentiment'
import authRouter from './auth'
import couponsRouter from './coupons'
import devicesRouter from './devices'
import documentRouter from './document'
import createOrderRouter from './createOrder'
import cricketRouter from './cricket'
import profileRouter from './profile'
import userRouter from './user'
import userMetaRouter from './user-meta'

const router = express.Router()

router.use('/analytics/sentiment', sentimentRouter)
router.use('/auth', authRouter)
router.use('/coupons', couponsRouter)
router.use('/devices', devicesRouter)
router.use('/document', documentRouter)
router.use('/create-order', createOrderRouter)
router.use('/cricket', cricketRouter)
router.use('/profile', profileRouter)
router.use('/user', userRouter)
router.use('/user-meta', userMetaRouter)

export default router
