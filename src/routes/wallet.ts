import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { WalletController } from '../controllers/walletController'

const router = express.Router()
const walletController = new WalletController()

router.post(
  '/in-game-transaction',
  authMiddleware,
  walletController.getInGameTransactions.bind(walletController)
)

router.post(
  '/transaction',
  authMiddleware,
  walletController.getTransactions.bind(walletController)
)

router.post(
  '/tds',
  authMiddleware,
  walletController.getTds.bind(walletController)
)

export default router
