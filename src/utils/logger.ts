import winston from 'winston'
import { config } from '../config'

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.json()
)

const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.colorize(),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		let msg = `${timestamp} [${level}]: ${message}`
		if (Object.keys(meta).length > 0) {
			msg += ` ${JSON.stringify(meta)}`
		}
		return msg
	})
)

export const logger = winston.createLogger({
	level: config.nodeEnv === 'production' ? 'info' : 'debug',
	format: logFormat,
	defaultMeta: { service: 'fantasy-backend' },
	transports: [
		new winston.transports.Console({
			format: consoleFormat,
		}),
	],
})

// Add file logging in production
if (config.nodeEnv === 'production') {
	logger.add(
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
			maxsize: 10 * 1024 * 1024, // 10MB
			maxFiles: 5,
		})
	)

	logger.add(
		new winston.transports.File({
			filename: 'logs/combined.log',
			maxsize: 10 * 1024 * 1024, // 10MB
			maxFiles: 5,
		})
	)
}

export default logger
