import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from './logger'

export class AppError extends Error {
	statusCode: number
	isOperational: boolean

	constructor(message: string, statusCode: number = 500) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = true

		Error.captureStackTrace(this, this.constructor)
	}
}

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	let error = { ...err }
	error.message = err.message

	// Log error
	logger.error('Error occurred:', {
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
	})

	// Zod validation errors
	if (err instanceof ZodError) {
		const message = err.errors
			.map((e) => `${e.path.join('.')}: ${e.message}`)
			.join(', ')
		res.status(400).json({
			success: false,
			error: 'Validation Error',
			message,
			details: err.errors,
		})
		return
	}

	// App errors
	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			success: false,
			error: err.message,
		})
		return
	}

	// Default error
	res.status(500).json({
		success: false,
		error: 'Internal Server Error',
		message:
			process.env.NODE_ENV === 'development'
				? err.message
				: 'Something went wrong',
	})
}

export const asyncHandler = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next)
	}
}
