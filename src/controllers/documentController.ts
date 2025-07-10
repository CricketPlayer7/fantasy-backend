import { Request, Response } from 'express'
import { S3Service, PROFILE_IMAGE_TYPES, DOCUMENT_TYPES } from '../services/s3Service'
import { logger } from '../utils/logger'
import { asyncHandler } from '../utils/errorHandler'
import { AppError } from '../utils/errorHandler'

export class DocumentController {
  private s3Service = new S3Service()

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    try {
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
        return res.status(400).json({
          error: 'Invalid file type',
          allowedTypes: Object.keys(validTypes),
        })
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
    } catch (error: any) {
      logger.error('Error uploading document:', error)
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to upload file',
      })
    }
  })
}