// all redis services will go here

import client from '../configs/redis.configs'
import { redisKey } from '../validation/constants/redis_keys'

const setAuthId = async (id: string, token: string) => {
  await client.set(redisKey.auth(id), token, {
    EX: Number(process.env.TOKEN_EXP),
  })
}

const getAuthId = async (id: string) => {
  return await client.get(redisKey.auth(id))
}

const deleteAuthId = async (id: string) => {
  await client.del(redisKey.auth(id))
}
const setEmailOtp = async (email: string, hashedOtp: string) => {
  await client.set(redisKey.otp(email), hashedOtp, {
    EX: Number(process.env.OTP_EXP),
  })
}

const getEmailOtp = async (email: string) => {
  return await client.get(redisKey.otp(email))
}

const deleteEmailOtp = async (email: string) => {
   await client.del(redisKey.otp(email))
}

const setResetPasswordToken = async (email: string) => {
  await client.set(redisKey.reset(email), 'yes', {
    EX: 300,
  })
}

const getResetPasswordToken = async (email: string) => {
 return await client.get(redisKey.reset(email))
}

const deleteResetPasswordToken = async (email: string) => {
  await client.del(redisKey.reset(email))
}


export default {
  setAuthId,
  setEmailOtp,
  setResetPasswordToken,
  getAuthId,
  getEmailOtp,
  getResetPasswordToken,
  deleteAuthId,
  deleteEmailOtp,
  deleteResetPasswordToken
}