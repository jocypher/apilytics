import bcrypt from 'bcryptjs'
import AppDataSource from '../configs/app-datasource.config'
import { User } from '../models/user-model.entity'
import authService from '../services/auth.service'
import client from '../configs/redis.configs'
import jwt from 'jsonwebtoken'
import normalizeEmail from 'normalize-email'
import { Request, Response, NextFunction } from 'express'

let userRepo = AppDataSource.getRepository(User)

const handleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body

  try {
    let validEmail = normalizeEmail(email)

    const foundUser = await userRepo.findOne({
      where: [{ email: validEmail }, { username: username }],
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (foundUser) {
      return res.status(400).json({ message: 'user already exist' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let user = userRepo.create({
      username: username,
      email: validEmail,
      password_hash: hashedPassword,
    })

    await userRepo.save(user)
    return res
      .status(201)
      .json({ message: 'user account created', email: validEmail, id: user.id })
  } catch (err: any) {
    next(err)
  }
}

const handleSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { email, password } = req.body
  const normalizedEmail = normalizeEmail(email)
  try {
    let user = await userRepo.findOne({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        password_hash: true,
      },
    })

    if (!user) {
      return res.status(401).json({ message: 'Bad credentials' })
    }

    let isPasswordAccurate: boolean = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!isPasswordAccurate) {
      return res.status(401).json({ 'Credential Error': 'Invalid credentials' })
    }

    const token: string = jwt.sign(
      {
        id: user.id,
        email: normalizedEmail,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: Number(process.env.TOKEN_EXP) }
    )

    await client.set(`auth:${user.id}`, token, {
      EX: Number(process.env.TOKEN_EXP),
    })

    return res.status(200).json({
      id: user.id,
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
    // const rateLimitKey: string = `rate:forgot:${email}`
    // let attempts: string | null = await client.get(rateLimitKey)

    // if (attempts && isNaN(Number(attempts))) {
    //   await client.del(rateLimitKey)
    //   attempts = null
    // }

    // if (attempts && Number(attempts) >= 3) {
    //   return res.status(429).json({
    //     message: 'Too many requests',
    //     retryAfter: '1 hour',
    //   })
    // }

    let user: User | null = await userRepo.findOne({
      where: {
        email: email,
      },
    })
    if (!user) {
      return res.status(404).json({ message: 'user not found' })
    }

    // TODO: move to email service
    const otp: string = authService.generateOTPCode()

    const hashedOtp: string = await authService.storeHashedOtpCode(otp)

    await client.set(`otp:${email}`, hashedOtp, {
      EX: Number(process.env.OTP_EXP),
    })

    // if (attempts) {
    //   await client.incr(rateLimitKey)
    // } else {
    //   await client.set(rateLimitKey, '1', {
    //     EX: 3600,
    //   })
    // }

    // TODO: MOVE THIS TO `email service`
    await authService.sendForgotEmail(email, otp, user.username)

    return res.status(200).json({
      message: 'OTP code successfully sent',
      expiresIn: 'expires in 2 minutes',
    })
  } catch (err: any) {
    next(err)
  }
}

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { otp, email } = req.body
  try {
    const storeHashedOtpCode: string | null = await client.get(`otp:${email}`)

    if (!storeHashedOtpCode) {
      return res.status(401).send('OTP expired')
    }

    const isValid: boolean = await bcrypt.compare(otp, storeHashedOtpCode)

    if (!isValid) {
      return res.status(401).send('Invalid otp')
    }

    await client.del(`otp:${email}`)

    await client.set(`reset:password:${email}`, 'yes', {
      EX: 300,
    })
    return res.status(200).json({ message: 'otp verified' })
  } catch (err: any) {
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
    const storeResetPasswordToken: string | null = await client.get(
      `reset:password:${email}`
    )

    if (!storeResetPasswordToken) {
      return res.status(400).json({ message: 'Reset token expired' })
    }

    const user = await userRepo.findOne({
      where: {
        email: email,
      },
      select: {
        id: true,
        password_hash: true,
      },
    })

    if (!user?.id) {
      return res
        .status(401)
        .json({ message: `user with email: ${email} not found` })
    }

    const hashedPassword: string = await bcrypt.hash(newPassword, 10)

    await userRepo.update(user.id, { password_hash: hashedPassword })
    await client.del(`reset:password:${email}`)

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
    let user = await userRepo.findOne({
      where: {
        username: username,
      },
      select: {
        id: true
      },
    })

    if (user && user.id == userId) {
      return res.status(409).json({
        message: 'Username already exists',
      })
    }

    await userRepo.update(userId, { username: username })
    return res.status(200).json({ message: 'update made successfully' })
  } catch (err: any) {
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
    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
      select: {
        password_hash: true,
      },
    })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    )

    if (!isValidPassword) {
      return res.status(401).json({ message: 'invalid' })
    }

    if (currentPassword == newPassword) {
      return res.status(400).json({ message: 'New password must differ' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json({ message: 'password do not match' })
    }
    const hashNewPassword = await bcrypt.hash(newPassword, 10)

    await userRepo.update(userId, { password_hash: hashNewPassword })
    return res.sendStatus(204)
  } catch (err) {
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
    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'Unauthorized' })
    }
    let token = await client.get(`auth:${user.id}`)
    if (!token) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await client.del(`auth:${userId}`)

    return res.status(200).json({ message: 'Logout Successful' })
  } catch (err: any) {
    console.log(err)
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
    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    })
    if (!user) {
      return res.status(404).json({ message: 'user not found' })
    }
    let userResult: Partial<User> = {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
    }
    return res.status(200).json(userResult)
  } catch (err: any) {
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
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    let token = await client.get(`auth:${userId}`)
    if (!token) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await client.del(`auth:${userId}`)
    await userRepo.delete({
      id: userId,
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
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
}
