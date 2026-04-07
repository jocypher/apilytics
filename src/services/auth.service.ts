import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import normalizeEmail from 'normalize-email'
import AppDataSource from '../configs/appDatasource.config'
import { UserModel } from '../models/UserModel.entity'
import jwt from 'jsonwebtoken'
import redisService from './redis.service'
import emailService from './email.service'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'

const userRepo = AppDataSource.getRepository(UserModel)

const signup = async (username: string, email: string, password: string) => {
  console.log(normalizedEmail(email))
  const userCount = await userRepo.count({
    where: [{ email: normalizedEmail(email) }],
  })
  console.log(userCount)
  if (userCount > 0) {
    throw new ConflictError('user already exist')
  }
  const saltRounds = Number(process.env.GEN_SALT) || 10
  const hashPassword = await bcrypt.hash(password, saltRounds)
  const user = userRepo.create({
    username: username,
    email: normalizedEmail(email),
    passwordHash: hashPassword,
  })

  await userRepo.save(user)
  return user
}

const login = async (email: string, password: string) => {
  const user = await userRepo.findOne({
    where: {
      email: normalizedEmail(email),
    },
    select: {
      userId: true,
      passwordHash: true,
    },
  })

  if (!user) {
    throw new BadRequestError('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)

  if (!isValid) {
    throw new BadRequestError('Invalid credentials')
  }

  const accessToken = jwt.sign(
    {
      id: user.userId,
      email: normalizedEmail(email),
    },
    process.env.ACCESS_TOKEN!,
    { expiresIn: '1h' }
  )

  const refreshToken = jwt.sign(
    {
      id: user.userId,
      email: normalizedEmail(email),
    },
    process.env.REFRESH_TOKEN!,
    { expiresIn: '7d' }
  )
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

  await Promise.all([
    userRepo.update(user.userId, { refreshToken: hashedRefreshToken }),
    redisService.setAccessToken(user.userId, accessToken),
  ])

  return {
    id: user.userId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  }
}

const forgotPassword = async (email: string) => {
  const user = await userRepo.findOne({
    where: {
      email: normalizedEmail(email),
    },
    select: {
      userId: true,
      email: true,
      username: true,
    },
  })

  if (!user) {
    throw new UnauthorizedError()
  }
  const otp = generateOTPCode()
  const hashOtp = await storeHashedOtpCode(otp)

  await Promise.all([
    redisService.setEmailOtp(normalizedEmail(email), hashOtp),
    emailService.sendForgotEmail(normalizedEmail(email), otp, user.username),
  ])
}

const verifyOtp = async (otp: string, email: string) => {
  const getHashedOtpCode = await redisService.getEmailOtp(
    normalizedEmail(email)
  )

  if (!getHashedOtpCode) {
    throw new ForbiddenError('Otp expired or not found')
  }

  const isOtpValid = await bcrypt.compare(otp, getHashedOtpCode)

  if (!isOtpValid) {
    throw new UnauthorizedError('Invalid otp')
  }

  await Promise.all([
    redisService.deleteEmailOtp(normalizedEmail(email)),
    redisService.setResetPasswordToken(normalizedEmail(email)),
  ])
}

const resetPassword = async (email: string, newPassword: string) => {
  const getResetPasswordToken = await redisService.getResetPasswordToken(email)

  if (!getResetPasswordToken) {
    throw new UnauthorizedError('Reset token expired')
  }
  const user = await userRepo.findOne({
    where: {
      email: normalizedEmail(email),
    },
    select: {
      userId: true,
      passwordHash: true,
    },
  })
  if (!user?.userId) {
    throw new UnauthorizedError()
  }
  const saltRounds = Number(process.env.GEN_SALT) || 10
  const hashPassword = await bcrypt.hash(newPassword, saltRounds)

  await userRepo.update(user.userId, { passwordHash: hashPassword })

  await redisService.deleteResetPasswordToken(normalizedEmail(email))
  await redisService.deleteAccessToken(user.userId)
}

const handleRefreshToken = async (token: string) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN!) as {
    id: string
    email: string
  }
  const user = await userRepo.findOne({
    where: { userId: decoded.id },
    select: { refreshToken: true },
  })

  if (!user || !user.refreshToken) {
    throw new UnauthorizedError('Invalid refresh token')
  }

  const isValid = await bcrypt.compare(token, user.refreshToken)

  if (!isValid) {
    throw new UnauthorizedError('Invalid refresh token')
  }

  const accessToken = jwt.sign(
    { id: decoded.id, email: decoded.email },
    process.env.ACCESS_TOKEN!,
    { expiresIn: '1h' }
  )

  const newRefreshToken = jwt.sign(
    { id: decoded.id, email: decoded.email },
    process.env.REFRESH_TOKEN!,
    { expiresIn: '7d' }
  )

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10)
  await userRepo.update(user.userId, { refreshToken: hashedRefreshToken })
  return { accessToken, refreshToken: newRefreshToken }
}

const updateUsername = async (username: string, userId: string) => {
  const user = await userRepo.findOne({
    where: {
      username: username,
    },
    select: {
      userId: true,
    },
  })

  if (user && user.userId !== userId) {
    throw new ConflictError('username already exist')
  }

  await userRepo.update(userId, { username: username })
}

const updateUserPassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
  userId: string
) => {
  const user = await userRepo.findOne({
    where: {
      userId: userId,
    },
    select: {
      passwordHash: true,
    },
  })
  if (!user) {
    throw new UnauthorizedError()
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash)

  if (!isValidPassword) {
    throw new BadRequestError('Invalid Password')
  }

  if (oldPassword == newPassword) {
    throw new BadRequestError('Invalid Password')
  }

  if (newPassword !== confirmPassword) {
    throw new BadRequestError("passwords don't match")
  }

  const saltRounds = Number(process.env.GEN_SALT) || 10
  const hashNewPassword = await bcrypt.hash(newPassword, saltRounds)
  await userRepo.update(userId, { passwordHash: hashNewPassword })
}

const handleLogout = async (userId: string) => {
  const user = await userRepo.findOne({
    where: {
      userId: userId,
    },
    select: {
      userId: true,
    },
  })

  if (!user) {
    throw new UnauthorizedError()
  }

  const token = await redisService.getAccessToken(userId)
  if (!token) {
    throw new ForbiddenError()
  }

  await Promise.all([
    redisService.deleteAccessToken(userId),
    userRepo.update(user.userId, { refreshToken: '' }),
  ])
}

const getCurrentUser = async (userId: string) => {
  const user = await userRepo.findOne({
    where: {
      userId: userId,
    },
  })

  if (!user) {
    throw new UnauthorizedError()
  }
  const userResult: Partial<UserModel> = {
    userId: user?.userId,
    email: normalizedEmail(user!.email),
    username: user!.username,
    createdDate: user!.createdDate,
  }

  return userResult
}

const deleteAccount = async (userId: string) => {
  const user = await userRepo.findOne({ where: { userId: userId } })
  if (!user) {
    throw new UnauthorizedError()
  }
  const token = await redisService.getAccessToken(userId)
  if (!token) {
    throw new UnauthorizedError()
  }

  await Promise.all([
    redisService.deleteAccessToken(userId),
    userRepo.delete({
      userId: userId,
    }),
  ])
}
const normalizedEmail = (email: string) => {
  return normalizeEmail(email)
}

const generateOTPCode = (): string => {
  const min = 1000
  const max = 9999
  const otpcode = crypto.randomInt(min, max + 1)
  return otpcode.toString()
}

const storeHashedOtpCode = async (otp: string): Promise<string> => {
  const hashedCode = await bcrypt.hash(otp, 10)
  return hashedCode
}

const sum = (a: number, b: number) => {
  return a + b
}

const handleGoogleService = async (profile: any) => {
  const email = profile.emails?.[0]?.value

  let user = await userRepo.findOne({
    where: {
      email: email,
    },
  })
  if (!user) {
    user = userRepo.create({
      username: profile.displayName,
      email: email,
      passwordHash: '',
    })
    await userRepo.save(user)
  }
  return user
}

export default {
  generateOTPCode,
  storeHashedOtpCode,
  login,
  signup,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateUsername,
  updateUserPassword,
  handleLogout,
  getCurrentUser,
  deleteAccount,
  sum,
  handleGoogleService,
  handleRefreshToken,
}
