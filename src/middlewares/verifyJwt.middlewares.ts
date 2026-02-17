import jwt from 'jsonwebtoken'

const verifyJwt = (req: any, res: any, next: any) => {
  let authHeader = req.headers.authorization || req.headers['Authorization']
  if (!authHeader || !authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'User is unauthorized' })

  const token = authHeader.split(' ')[1]

  const secretKey = process.env.JWT_SECRET_KEY
  if (!secretKey) {
    throw new Error('Secret key is not defined in the environment variable')
  }
  jwt.verify(token, secretKey, (err: any, decode: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Forbidden' })
      }
      return res.status(401).json({ message: 'Unauthorized' })}
      

    req.id = decode.id
    req.email = decode.email
     next()
  })
 
}

export default { verifyJwt }
