import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminKycService } from '../../services/admin/kycService'
import { updateKycStatusSchema } from '../../validations'
import { KycRecord } from '../../types'
import { z } from 'zod'

type UpdateKycStatusInput = z.infer<typeof updateKycStatusSchema>

export class AdminKycController {
  private service = new AdminKycService()

  getAllSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const result: KycRecord[] = await this.service.fetchAllSubmissions(req.supabaseAdmin)
    res.json({ success: true, data: result })
  })

  updateSubmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { submissionId, status }: UpdateKycStatusInput = updateKycStatusSchema.parse(req.body)
    await this.service.updateSubmissionStatus(req.supabaseAdmin, submissionId, status)
    res.json({ success: true, message: 'KYC status updated successfully' })
  })
}
