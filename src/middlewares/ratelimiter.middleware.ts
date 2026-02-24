import client from '../configs/redis.configs'

const rateLimiters = async (req: any, res: any, next: any) => {
  const ip = req.ip
  const currentTime = Date.now()
  const rateLimitKey = `rate-limit:${ip}`

  const limit = 20
  const windowTime = 15 * 60

  const requests = await client.incr(rateLimitKey)

  if (requests === 1) {
    await client.expire(rateLimitKey, windowTime)
  }

  if (requests > limit) {
    return res
      .status(429)
      .json({ message: 'Too many requests, try again later.' })
  }
  next()
}

const rateLimiter = (
  limit: number,
  windowTime: number,
  keyGenerator: (req: any) => string
) => {
  return async (req: any, res: any, next: any) => {
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
