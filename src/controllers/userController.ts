import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { UserService } from '../services/userService'
import { userActivitySchema, userMetaUpdateSchema } from '../validations'

export class UserController {
  private userService = new UserService()

  updateUserMeta = asyncHandler(async (req: Request, res: Response) => {
    let body = { ...req.body }

    // Remove username if passed (not allowed to update via this API)
    if (body.username) {
      delete body.username
    }

    // Remove user_id if passed (we get it from auth)
    if (body.user_id) {
      delete body.user_id
    }

    const validation = userMetaUpdateSchema.safeParse(body)
    if (!validation.success) {
      throw new AppError('Invalid user meta data', 400)
    }

    const userData = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const data = await this.userService.updateUserMeta(supabase, user.id, userData)

    return res.json({
      data,
      message: 'User meta data updated successfully',
    })
  })

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
