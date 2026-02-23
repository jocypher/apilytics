import jwt from 'jsonwebtoken'
import client from '../configs/redis.configs'

const verifyJwt = async (req: any, res: any, next: any) => {
  try {
    let authHeader = req.headers.authorization || req.headers['Authorization']
    if (!authHeader || !authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'User is unauthorized' })

    const token = authHeader.split(' ')[1]

    const secretKey = process.env.JWT_SECRET_KEY
    if (!secretKey) {
      throw new Error('Secret key is not defined in the environment variable')
    }
    const decoded: any = jwt.verify(token, secretKey)

    const storedToken = await client.get(`auth:${decoded.id}`)

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({
        message: 'Session expired or invalidated',
      })
    }

    req.id = decoded.id
    req.email = decoded.email
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' })
    }

    return res.status(401).json({ message: 'Unauthorized' })
  }
}

export default { verifyJwt }
