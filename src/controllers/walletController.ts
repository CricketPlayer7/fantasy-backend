import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { WalletService } from '../services/walletService'
import { walletTransactionSchema, tdsSchema } from '../validations'

export class WalletController {
  private walletService = new WalletService()

  getInGameTransactions = asyncHandler(async (req: Request, res: Response) => {
    const validation = walletTransactionSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid request data', 400)
    }

    const filters = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    // Use authenticated user's ID instead of request user_id
    const result = await this.walletService.getInGameTransactions(supabase, user.id, filters)

    return res.json(result)
  })

  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const validation = walletTransactionSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid request data', 400)
    }

    const filters = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    // Use authenticated user's ID instead of request user_id
    const result = await this.walletService.getTransactions(supabase, user.id, filters)

    return res.json(result)
  })

  getTds = asyncHandler(async (req: Request, res: Response) => {
    const validation = tdsSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid request data', 400)
    }

    const filters = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    // Use authenticated user's ID instead of request user_id
    const result = await this.walletService.getTds(supabase, user.id, filters)

    return res.json(result)
  })
}
