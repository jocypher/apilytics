// all redis services will go here

import client from '../configs/redis.configs'
import { redisKey } from '../validation/constants/redis_keys'

const setAccessToken = async (id: string, token: string) => {
  await client.set(redisKey.auth(id), token, {
    EX: 60 * 60,
  })
}
const setRefreshToken = async(id:string, refreshToken:string)=>{
  await client.set(redisKey.refreshKey(id), refreshToken, {
    EX: 604800
  })
}

const getAccessToken = async (id: string) => {
  return await client.get(redisKey.auth(id))
}

const getRefreshToken = async(id:string)=>{
  return await client.get(redisKey.refreshKey(id))
}

const deleteAccessToken = async (id: string) => {
  await client.del(redisKey.auth(id))
}
const setEmailOtp = async (email: string, hashedOtp: string) => {
  await client.set(redisKey.otp(email), hashedOtp, {
    EX: 60 * 10,
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

const setInviteToken = async (
  hashToken: string,
  email: string,
  orgId: string,
  id:string
) => {
  await client.set(
    redisKey.invite(hashToken),
    JSON.stringify({
      email,
      organizationId: orgId,
      invitedBy: id,
    }),
    { EX: 60 * 60 * 24 }
  )
}


const storeApiKey = async(
  hashed_apiKey: string,
  api_key: string
)=>{
  await client.set(redisKey.apiKey(api_key), hashed_apiKey, {
    EX: 60 * 60 * 24,
  })
}
export default {
  setAccessToken,
  setEmailOtp,
  setResetPasswordToken,
  setRefreshToken,
  getAccessToken,
  getEmailOtp,
  getResetPasswordToken,
  getRefreshToken,
  deleteAccessToken,
  deleteEmailOtp,
  deleteResetPasswordToken,
  setInviteToken,
  storeApiKey
}
