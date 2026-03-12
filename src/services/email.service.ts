import axios from "axios"

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
  } catch (error: unknown) {
    throw new Error("Something went wrong", {cause:error})
  }
}


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
            Subject: 'ORGANIZATION INVITE',
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
  } catch (error: unknown) {
        throw new Error('Something went wrong', { cause: error })
  }
}

export default { sendForgotEmail, sendInvite }