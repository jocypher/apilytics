import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import normalizeEmail from 'normalize-email'
import AppDataSource from '../configs/app-datasource.config'
import { User } from '../models/user-model.entity'
import jwt from 'jsonwebtoken'
import redisService from './redis.service'
import emailService from './email.service'

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

const forgotPassword = async (email: string) => {
  let user = await userRepo.findOne({
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
    throw new Error('Unauthorized')
  }
  const otp = generateOTPCode()
  const hashOtp = await storeHashedOtpCode(otp)

  redisService.setEmailOtp(email, hashOtp)

  await emailService.sendForgotEmail(email, otp, user.username)
}

const verifyOtp = async (otp: string, email: string) => {
  const getHashedOtpCode = await redisService.getEmailOtp(email)

  if (!getHashedOtpCode) {
    throw new Error('Otp expired or not found')
  }

  const isOtpValid = await bcrypt.compare(otp, getHashedOtpCode)

  if (!isOtpValid) {
    throw Error('Invalid otp')
  }

  await Promise.all([
    redisService.deleteEmailOtp,
    redisService.setResetPasswordToken,
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

const resetPassword = async(email:string, newPassword:string) =>{

  const getResetPasswordToken = await redisService.getResetPasswordToken(email)
  
  if(!getResetPasswordToken){
    throw Error('Reset token expired')
  }
  const user = await userRepo.findOne({
    where:{
      email: email
    },
    select:{
      id: true,
      password_hash:true
    }
  })
  if(!user?.id){
    throw Error ('Unauthorized')
  }

  const hashPassword = await bcrypt.hash(newPassword, Number(process.env.GEN_SALT))

  await userRepo.update(user.id, {password_hash: hashPassword})

  redisService.deleteResetPasswordToken(email)
}

const updateUsername = async(username: string, userId: string)=>{
      let user = await userRepo.findOne({
        where: {
          username: username,
        },
        select: {
          id: true,
        },
      })
  
      if (user && user.id !== userId) {
        throw Error('Unauthorized')
      }
  
      await userRepo.update(userId, { username: username })
}


const updateUserPassword = async(oldPassword: string, newPassword:string, confirmPassword: string, userId: string)=>{
  const user = await userRepo.findOne({
    where:{
      id:userId
    },
    select:{
      password_hash: true
    }
  })
  if (!user) {
    throw Error('Unauthorized')
  }

  const isValidPassword = await bcrypt.compare(
    oldPassword, 
    user.password_hash
  )

  if(!isValidPassword){
    throw Error('Invalid Password')
  }

   if (oldPassword == newPassword) {
     throw Error('Invalid Password')
   }

   if (newPassword !== confirmPassword) {
     throw Error('passwords don\'t match')
   }

   const hashNewPassword = await bcrypt.hash(newPassword, Number(process.env.GEN_SALT))
  await userRepo.update(userId, { password_hash: hashNewPassword })

}

const handleLogout = async(userId: string) =>{
   const user = await userRepo.findOne({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      })
  
      if (!user) {
        throw Error('Unauthorized')
      }
  
      let token = redisService.getAuthId(userId)
      if (!token) {
        throw Error('Forbidden')
      }
  
    await redisService.deleteAuthId(userId)
}

const getCurrentUser = async(userId: string)=>{
  const user = await userRepo.findOne({
        where: {
          id: userId,
        },
      })
      if (!user) {
        throw Error('Unauthorized')
      }
      let userResult: Partial<User> = {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      }

      return userResult
}

const deleteAccount = async(userId: string)=>{
   const user = await userRepo.findOne({ where: { id: userId } })
   if (!user) {
     throw Error('Unauthorized')
   }
   let token = redisService.getAuthId(userId)
   if (!token) {
     throw Error('Unauthorized')
   }

   redisService.deleteAuthId(userId)
   await userRepo.delete({
     id: userId,
   })
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
  deleteAccount
}
