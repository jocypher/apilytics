import authService from '../services/auth.service'
import normalizeEmail from 'normalize-email'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const handleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body
  try {
    const user = await authService.signup(
      username,
      email,
      password
    )
    return res
      .status(201)
      .json({
        message: 'user account created',
        email: email,
        id: user.id,
        username: username,
        createdAt: user.created_at,
      })
  } catch (err: unknown) {
    next(err)
  }
}

const handleSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const normalizedEmail = normalizeEmail(email)
  try {
    const { id, token } = await authService.login(normalizedEmail, password)
    return res.status(200).json({
      id: id,
      jwt_token: token,
    })
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  try {
    await authService.forgotPassword(email)
    return res.status(200).json({
      message: 'OTP code successfully sent',
      expiresIn: 'expires in 2 minutes',
    })
  } catch (err: unknown) {
    next(err)
  }
}

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { otp, email } = req.body
  try {
    await authService.verifyOtp(otp, email)
    return res.status(200).json({ message: 'otp verified' })
  } catch (err: unknown) {
    next(err)
  }
}

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, newPassword } = req.body

  try {
    await authService.resetPassword(email, newPassword)
    return res.status(200).json({
      message: 'reset password successful',
    })
  } catch (err) {
    next(err)
  }
}

const updateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.body
  const userId = req.id

  try {
    await authService.updateUsername(username, userId)
    return res.status(200).json({ message: 'update made successfully' })
  } catch (err: unknown) {
    next(err)
  }
}

const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  const userId = req.id
  try {
    await authService.updateUserPassword(
      currentPassword,
      newPassword,
      confirmPassword,
      userId
    )
    return res.sendStatus(204)
  } catch (err:unknown) {
    next(err)
  }
}

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.id
  try {
    await authService.handleLogout(userId)
    return res.status(200).json({ message: 'Logout Successful' })
  } catch (err: unknown) {
    next(err)
  }
}

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.id
  try {
    const result = await authService.getCurrentUser(userId)
    return res.status(200).json(result)
  } catch (err: unknown) {
    next(err)
  }
}

const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.id
  try {
   await authService.deleteAccount(userId)
    return res.sendStatus(200)
  } catch (err:unknown) {
    next(err)
  }
}

const googleCallback = async(req:any, res:any)=>{
  const user = req.user

  const accessToken = jwt.sign({
    id:user.id,
    email: normalizeEmail(user.email)
  },
   process.env.JWT_SECRET_KEY!,
   {expiresIn: '1h' }
)

  return res.status(201).json({user, accessToken})
}

export default {
  handleSignup,
  handleSignin,
  forgotPassword,
  resetPassword,
  verifyOtp,
  updateUsername,
  updateUserPassword,
  handleLogout,
  getCurrentUser,
  deleteAccount,
  googleCallback
}
