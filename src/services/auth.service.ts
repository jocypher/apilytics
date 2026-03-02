import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import normalizeEmail from 'normalize-email'
import AppDataSource from '../configs/app-datasource.config'
import { User } from '../models/user-model.entity'
import jwt from 'jsonwebtoken'
import redisService from './redis.service'

let userRepo = AppDataSource.getRepository(User)

const signup = async (username: string, email: string, password: string) => {
  const userExist = await userRepo.findOne({
    where: [{ email: normalizedEmail(email) }, { username: username }],
    select: {
      id: true,
      username: true,
      email: true,
    },
  })
  if (userExist) {
    throw new Error('user already exist')
  }
  const genSalt = process.env.GEN_SALT
  const hashPassword = await bcrypt.hash(password, Number(genSalt))
  let user = userRepo.create({
    username: username,
    email: normalizedEmail(email),
    password_hash: hashPassword,
  })

  await userRepo.save(user)
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.created_at,
  }
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
    throw new Error('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: normalizedEmail,
    },
    process.env.JWT_SECRET_KEY!,
    { expiresIn: Number(process.env.TOKEN_EXP) }
  )

  redisService.setAuthId(user.id, token)

  return { id: user.id, token }
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

export default { generateOTPCode, storeHashedOtpCode }
