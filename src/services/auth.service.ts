import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import normalizeEmail from 'normalize-email'
import AppDataSource from '../configs/app-datasource.config'
import { User } from '../models/user-model.entity'
import jwt from 'jsonwebtoken'
import redisService from './redis.service'
import emailService from './email.service'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'

const userRepo = AppDataSource.getRepository(User)

const signup = async (username: string, email: string, password: string) => {
  console.log(normalizedEmail(email))
  const userExist = await userRepo.findOne({
    where: [{ email: normalizedEmail(email) }, { username: username }],
    select: {
      id: true,
      username: true,
      email: true,
    },
  })
  if (userExist) {
    throw new ConflictError('user already exist')
  }
  const saltRounds = Number(process.env.GEN_SALT) || 10
  const hashPassword = await bcrypt.hash(password, saltRounds)
  const user = userRepo.create({
    username: username,
    email: normalizedEmail(email),
    password_hash: hashPassword,
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
      id: true,
      password_hash: true,
    },
  })

  if (!user) {
    throw new BadRequestError('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    throw new BadRequestError('Invalid credentials')
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: normalizedEmail(email),
    },
    process.env.JWT_SECRET_KEY!,
    { expiresIn: '1h' }
  )

  await redisService.setAuthId(user.id, token)

  return { id: user.id, token }
}

const forgotPassword = async (email: string) => {
  const user = await userRepo.findOne({
    where: {
      email: email,
    },
    select: {
      id: true,
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
    redisService.setEmailOtp(email, hashOtp),
    emailService.sendForgotEmail(email, otp, user.username),
  ])
}

const verifyOtp = async (otp: string, email: string) => {
  const getHashedOtpCode = await redisService.getEmailOtp(email)

  if (!getHashedOtpCode) {
    throw new ForbiddenError('Otp expired or not found')
  }

  const isOtpValid = await bcrypt.compare(otp, getHashedOtpCode)

  if (!isOtpValid) {
    throw new UnauthorizedError('Invalid otp')
  }

  await Promise.all([
    redisService.deleteEmailOtp(email),
    redisService.setResetPasswordToken(email),
  ])
}

const resetPassword = async (email: string, newPassword: string) => {
  const getResetPasswordToken = await redisService.getResetPasswordToken(email)

  if (!getResetPasswordToken) {
    throw new UnauthorizedError('Reset token expired')
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
    throw new UnauthorizedError()
  }
  const saltRounds = Number(process.env.GEN_SALT) || 10
  const hashPassword = await bcrypt.hash(newPassword, saltRounds)

  await userRepo.update(user.id, { password_hash: hashPassword })

  await redisService.deleteResetPasswordToken(email)
  await redisService.deleteAuthId(user.id)
}

const updateUsername = async (username: string, userId: string) => {
  const user = await userRepo.findOne({
    where: {
      username: username,
    },
    select: {
      id: true,
    },
  })

  if (user && user.id !== userId) {
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
      id: userId,
    },
    select: {
      password_hash: true,
    },
  })
  if (!user) {
    throw new UnauthorizedError()
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash)

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
  await userRepo.update(userId, { password_hash: hashNewPassword })
}

const handleLogout = async (userId: string) => {
  const user = await userRepo.findOne({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  })

  if (!user) {
    throw new UnauthorizedError()
  }

  const token = await redisService.getAuthId(userId)
  if (!token) {
    throw new ForbiddenError()
  }

  await redisService.deleteAuthId(userId)
}

const getCurrentUser = async (userId: string) => {
  const user = await userRepo.findOne({
    where: {
      id: userId,
    },
  })
  if (!user) {
    throw new UnauthorizedError()
  }
  const userResult: Partial<User> = {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  }

  return userResult
}

const deleteAccount = async (userId: string) => {
  const user = await userRepo.findOne({ where: { id: userId } })
  if (!user) {
    throw new UnauthorizedError()
  }
  const token = await redisService.getAuthId(userId)
  if (!token) {
    throw new UnauthorizedError()
  }

  await Promise.all([
    redisService.deleteAuthId(userId),
    userRepo.delete({
      id: userId,
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

const sum = (a:number , b:number) =>{
    return a + b 
}

const handleGoogleService = async(profile:any)=>{
  const email = profile.emails[0].value

  let user = await userRepo.findOne({
    where :{
      email:email
    }
  })
  if(!user){
   user =  userRepo.create({
      username: profile.displayName,
      email: email,
      password_hash: ''
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
  handleGoogleService
}
