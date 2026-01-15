import axios from 'axios'
import bcrypt from 'bcryptjs'
import { OrganizationUser } from '../models/organization-user.entity'

const sendInvite = async (
  email: string,
  message: string,
  organization: string
) => {
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
              },
            ],
            Subject: 'Your Password Reset Request',
            TextPart: `Hello,\n\nInvite has been sent for you to join this Org ${organization}.\n\nTo complete the process, please click the link below to accept the invitation:\n\n${message}.\nThis link is active for a limited time 1 hour and can only be used once.\n\nThank you,
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
  } catch (err: any) {
    console.error('error from MailJet', err.message)
    throw err
  }
}

const generateInviteToken = (): string => {
  const token = crypto.randomUUID()
  return token
}

const hashInviteToken = async (token: string): Promise<string> => {
  const hashedToken = await bcrypt.hash(token, 10)
  return hashedToken
}

const isOrgAdminOrOwner = (membership: OrganizationUser | null): boolean => {
  return !!membership && ['owner', 'admin'].includes(membership.role)
}

export default {
  sendInvite,
  generateInviteToken,
  hashInviteToken,
  isOrgAdminOrOwner,
}
