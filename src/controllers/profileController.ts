import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { ProfileService } from '../services/profileService'

export class ProfileController {
  private profileService = new ProfileService()

  getGenders = asyncHandler(async (req: Request, res: Response) => {
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    const genders = await this.profileService.getGenders(supabase)

    return res.json(genders)
  })
}
