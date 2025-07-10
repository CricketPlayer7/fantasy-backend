import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimitMiddleware } from './middleware/rateLimit'
import { errorHandler } from './utils/errorHandler'
import { logger } from './utils/logger'
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

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
    next()
  })

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
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`)
    res.status(404).json({ error: 'Route not found' })
  })

  // Global error handler
  app.use(errorHandler)

  return app
}

export default createApp
