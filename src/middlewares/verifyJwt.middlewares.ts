import jwt, { JwtPayload } from 'jsonwebtoken'
import client from '../configs/redis.configs'
import {  NextFunction } from 'express'

interface MyJwtPayload extends JwtPayload {
  id: string
  email: string
}

const verifyJwt = async (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'User is unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    const accessToken = process.env.ACCESS_TOKEN
    if (!accessToken) {
      throw new Error('Secret key is not defined in the environment variable')
    }
    const decoded = jwt.verify(token, accessToken) as MyJwtPayload

    const storedToken = await client.get(`auth:${decoded.id}`)

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({
        message: 'Session expired or invalidated',
      })
    }

    req .id = decoded.id
    req.email = decoded.email
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' })
    }

    return res.status(401).json({ message: 'Token is Unauthorized'})
  }
}

export default { verifyJwt }
