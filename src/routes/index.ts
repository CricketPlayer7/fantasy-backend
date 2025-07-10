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
import kycRouter from './admin/kyc'
import gstRouter from './admin/gst'
import leagueRouter from './admin/league'
import answersRouter from './admin/answers'
import financeRouter from './admin/finance'
import matchesRouter from './admin/matches'
import paymentDetailsRouter from './admin/paymentDetails'
import questionsRouter from './admin/questions'
import withdrawalsRouter from './admin/withdrawals'

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
router.use('/admin/kyc', kycRouter)
router.use('/admin/gst', gstRouter)
router.use('/admin/league', leagueRouter)
router.use('/admin/answers', answersRouter)
router.use('/admin/finance', financeRouter)
router.use('/admin/matches', matchesRouter)
router.use('/admin/payment-details', paymentDetailsRouter)
router.use('/admin/questions', questionsRouter)
router.use('/admin/withdrawals', withdrawalsRouter)

export default router
