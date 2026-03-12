import {Request, Response, NextFunction } from 'express'
import client from '../configs/redis.configs'



const rateLimiter = (
  limit: number,
  windowTime: number,
  keyGenerator: (req: Request) => string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req)

      const requests = await client.incr(key)

      if (requests === 1) {
        await client.expire(key, windowTime)
      }
      if (requests > limit) {
        return res
          .status(429)
          .json({ message: 'Too many requests, try again later.' })
      }
      next()
    } catch (err) {
        next(err)
    }
  }
}

export default rateLimiter
