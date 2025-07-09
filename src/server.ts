import { config } from './config'
import createApp from './app'

const app = createApp()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`)
  console.log(`📍 Environment: ${config.nodeEnv}`)
  console.log(`🏥 Health check: http://localhost:${config.port}/health`)
})

export default app
