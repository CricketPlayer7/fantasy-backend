import express, { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth'
import { DocumentController } from '../controllers/documentController'
import { logger } from '../utils/logger'

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB max file size
	},
	// Multer 2.x introduces new error handling
	fileFilter: (_req, file, cb) => {
		// Accept all files, validation will be done in the controller
		cb(null, true)
	},
}).single('file')

const router = express.Router()
const documentController = new DocumentController()

// Handle multer errors separately
const handleMulterUpload = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	upload(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			logger.error('Multer error:', err)
			res.status(400).json({
				error: 'File upload error',
				details: err.message,
			})
			return
		} else if (err) {
			logger.error('Unknown upload error:', err)
			res.status(500).json({
				error: 'Failed to process upload',
				details: err.message,
			})
			return
		}
		// No errors, proceed to the next middleware
		next()
	})
}

router.post(
	'/upload',
	authMiddleware,
	handleMulterUpload,
	documentController.uploadDocument.bind(documentController)
)

export default router
