import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateRequest = (schema: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body)
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query)
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params)
      }
      
      next()
    } catch (error) {
      next(error)
    }
  }
}
