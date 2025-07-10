import { Redis } from 'ioredis'
import { config } from '../config'
import { logger } from './logger'

let redisInstance: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: config.redis.host || 'localhost',
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })

    redisInstance.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redisInstance.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redisInstance
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient()
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCache(
  key: string,
  data: any,
  ttlSeconds = 300
): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
  } catch (error) {
    console.error('Redis set error:', error)
  }
}
