import axios from 'axios'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import client from '../configs/redis.configs'

const generateOTPCode = (): string => {
  const min = 1000
  const max = 9999
  const otpcode = crypto.randomInt(min, max + 1)
  return otpcode.toString()
}


const sendForgotEmail = async (email: string, message: string, username: string) => {
  try {
    const response = await axios.post(
      'https://api.mailjet.com/v3.1/send',
      {
        Messages: [
          {
            From: {
              Email: 'arthurwilchield@gmail.com',
              Name: 'Jonathan Arthur',
            },
            To: [
              {
                Email: email,
                Name: username,
              },
            ],
            Subject: 'Your Password Reset Request',
            TextPart: `Hello,\n\nWe received a request to reset your password for your account with Apilytics.\n\nTo complete the process, please click the link below to set a new password:\n\n${message}.\nThis link is active for a limited time (e.g., 1 hour) and can only be used once. If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.\n\nThank you,
            \nThe Apilytics Team`,
          },
        ],
      },
      {
        auth: {
          username: process.env.API_KEY!,
          password: process.env.SECRET_KEY!,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Mailjet error:', error.response?.data || error.message)
    throw error // rethrow any error
  }
}

const storeHashedOtpCode = async (otp: string): Promise<string> => {
  const hashedCode = await bcrypt.hash(otp, 10)
  return hashedCode
}

export default { generateOTPCode, sendForgotEmail, storeHashedOtpCode }
