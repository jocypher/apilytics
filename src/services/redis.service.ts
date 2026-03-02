// all redis services will go here

import client from '../configs/redis.configs'

const setAuthId = async (id: string, token: string) => {
  await client.set(`auth:${id}`, token, {
    EX: Number(process.env.TOKEN_EXP),
  })
}

const getAuthId = async (id: string) => {
  return await client.get(`auth:${id}`)
}

const deleteAuthId = async (id: string) => {
  await client.del(`auth:${id}`)
}
const setEmailOtp = async (email: string, hashedOtp: string) => {
  await client.set(`otp:${email}`, hashedOtp, {
    EX: Number(process.env.OTP_EXP),
  })
}

const getEmailOtp = async (email: string) => {
  return await client.get(`otp:${email}`)
}

const deleteEmailOtp = async (email: string) => {
   await client.del(`otp:${email}`)
}

const setResetPasswordToken = async (email: string) => {
  await client.set(`reset:password:${email}`, 'yes', {
    EX: 300,
  })
}

const getResetPasswordToken = async (email: string) => {
 return await client.get(`reset:password:${email}`)
}

const deleteResetPasswordToken = async (email: string) => {
  await client.del(`reset:password:${email}`)
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