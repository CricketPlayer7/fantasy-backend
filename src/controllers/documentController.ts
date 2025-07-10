import { Request, Response } from 'express'
import { S3Service, PROFILE_IMAGE_TYPES, DOCUMENT_TYPES } from '../services/s3Service'
import { asyncHandler, AppError } from '../utils/errorHandler'

export class DocumentController {
  private s3Service = new S3Service()

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    // In multer 2.x, we need to check req.file differently
    if (!req.file) {
      throw new AppError('No file provided', 400)
    }

    // Get upload options from form data
    const folder = (req.body.folder as string) || 'uploads'
    const isPublic = req.body.isPublic === 'true'
    const expiresIn = parseInt(req.body.expiresIn || '3600', 10)

    // Validate file type
    const validTypes = { ...PROFILE_IMAGE_TYPES, ...DOCUMENT_TYPES }
    const mimetype = req.file.mimetype
    
    if (!Object.keys(validTypes).includes(mimetype)) {
      throw new AppError(
        `Invalid file type. Allowed types: ${Object.keys(validTypes).join(', ')}`,
        400
      )
    }

    // Upload to S3
    const result = await this.s3Service.uploadToS3(
      req.file.buffer,
      req.file.originalname,
      mimetype,
      {
        folder,
        isPublic,
        expiresIn,
      }
    )

    return res.json(result)
  })
}