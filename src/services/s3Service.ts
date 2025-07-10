import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

// File type configurations
export const PROFILE_IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
} as const

export const DOCUMENT_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
} as const

export type ProfileImageMimeTypes = keyof typeof PROFILE_IMAGE_TYPES
export type DocumentMimeTypes = keyof typeof DOCUMENT_TYPES

export interface UploadResult {
  fileId: string
  key: string
  url: string
  publicUrl?: string
}

export interface UploadOptions {
  folder?: string
  isPublic?: boolean
  expiresIn?: number
}

export class S3Service {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region!,
      credentials: {
        accessKeyId: config.aws.accessKeyId!,
        secretAccessKey: config.aws.secretAccessKey!,
      },
    })
  }

  // Generate a presigned URL for accessing the file
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const maxExpiresIn = 7 * 24 * 3600 // 7 days in seconds
      const validExpiresIn = Math.min(expiresIn, maxExpiresIn)

      return getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: config.aws.bucketName!,
          Key: key,
        }),
        { expiresIn: validExpiresIn }
      )
    } catch (error) {
      logger.error('Error generating presigned URL:', error)
      throw new AppError('Failed to generate presigned URL', 500)
    }
  }

  // Upload a file to S3
  async uploadToS3(
    file: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'uploads',
        isPublic = false,
        expiresIn: requestedExpiresIn = isPublic ? 7 * 24 * 3600 : 3600, // Default: 7 days for public, 1 hour for private
      } = options

      // AWS has a limit of 7 days for presigned URLs
      const maxExpiresIn = 7 * 24 * 3600 // 7 days in seconds
      const expiresIn = Math.min(requestedExpiresIn, maxExpiresIn)

      // Generate a unique file ID
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      
      // Get file extension based on MIME type
      const extension =
        PROFILE_IMAGE_TYPES[mimeType as ProfileImageMimeTypes] ||
        DOCUMENT_TYPES[mimeType as DocumentMimeTypes]

      if (!extension) {
        throw new AppError(`Unsupported MIME type: ${mimeType}`, 400)
      }
      
      const key = `${folder}/${fileId}.${extension}`

      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: config.aws.bucketName!,
          Key: key,
          Body: file,
          ContentType: mimeType,
        })
      )

      // Generate signed URL
      const signedUrl = await this.generatePresignedUrl(key, expiresIn)

      const result: UploadResult = {
        fileId,
        key,
        url: signedUrl,
      }

      // Add public URL if the file is public
      if (isPublic) {
        result.publicUrl = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`
      }

      logger.info('File uploaded successfully to S3', {
        fileId,
        key,
        isPublic,
      })

      return result
    } catch (error) {
      logger.error('S3 upload error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to upload file to S3', 500)
    }
  }
}