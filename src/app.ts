import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimitMiddleware } from './middleware/rateLimit'
import { config } from './config'
import routes from './routes'

const createApp = () => {
  const app = express()

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }))

  // Rate limiting
  app.use(rateLimitMiddleware)

  // CORS
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }))

  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  })

  // API routes
  app.use('/api', routes)

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({ 
      error: config.nodeEnv === 'production' ? 'Internal server error' : err.message 
    })
  })

  return app
}

export default createApp
