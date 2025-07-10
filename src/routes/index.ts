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
import walletRouter from './wallet'
import gamificationRouter from './gamification'
import referralRouter from './referral'
import notificationsRouter from './notifications'
import startupRouter from './startup'
import dashboardRouter from './dashboard'
import getUsersRouter from './getUsers'
import kyc from './admin/kyc'
import gst from './admin/gst'
import league from './admin/league'
import answers from './admin/answers'

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
router.use('/wallet', walletRouter)
router.use('/gamification', gamificationRouter)
router.use('/referral', referralRouter)
router.use('/notifications', notificationsRouter)
router.use('/startup', startupRouter)
router.use('/dashboard', dashboardRouter)
router.use('/get-users', getUsersRouter)
router.use('/admin/kyc', kyc)
router.use('/admin/gst', gst)
router.use('/admin/league', league)
router.use('/admin/answers', answers)

export default router
