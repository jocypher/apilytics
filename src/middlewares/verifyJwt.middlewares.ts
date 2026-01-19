import jwt from 'jsonwebtoken'

const verifyJwt = (err: any, req: any, res: any, next: any) => {
  let authHeader = req.headers.authorization || req.headers['Authorizationn']
  if (!authHeader || !authHeader?.startsWith('Bearer '))
    return res.status(400).json({ message: 'User is unauthorized' })

  const token = authHeader.split(' ')[1]

  const secretKey = process.env.JWT_SECRET_KEY
  if (!secretKey) {
    throw new Error('Secret key is not defined in the environment variable')
  }
  jwt.verify(token, secretKey, (err: Error | null, decode: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' })
    req.id = decode.id
    req.email = decode.email
    // next(err);
  })
  next(err)
}

export default { verifyJwt }
