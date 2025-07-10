import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { UserService } from '../services/userService'
import { userActivitySchema } from '../validations'

export class UserController {
  private userService = new UserService()

  trackActivity = asyncHandler(async (req: Request, res: Response) => {
    const validation = userActivitySchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid activity type', 400)
    }

    const { activity_type } = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const result = await this.userService.trackActivity(supabase, user.id, activity_type)

    return res.json(result)
  })
}
