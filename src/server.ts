import { config } from './config'
import { logger } from './utils/logger'
import createApp from './app'

const app = createApp()

// Graceful shutdown
process.on('SIGTERM', () => {
	logger.info('SIGTERM received, shutting down gracefully')
	process.exit(0)
})

process.on('SIGINT', () => {
	logger.info('SIGINT received, shutting down gracefully')
	process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
	logger.error('Uncaught Exception:', err)
	process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	logger.error('Unhandled Rejection:', err)
	process.exit(1)
})

app.listen(config.port, () => {
	logger.info(`🚀 Server running on port ${config.port}`)
	logger.info(`📍 Environment: ${config.nodeEnv}`)
	logger.info(`🏥 Health check: http://localhost:${config.port}/health`)
})

export default app
