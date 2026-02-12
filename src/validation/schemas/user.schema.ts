import Joi from 'joi'

export const userIdSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty':'User id required'
  })
})
export const userBaseSchema = {
  username: Joi.string()
    .alphanum()
    .min(4)
    .max(20)
    .messages({
      'string.empty': 'Display name cannot be empty',
      'string.min': 'Min 6 characters',
    })
    .required(),
  email: Joi.string().email().required().messages({
      'string.empty': 'Display mail cannot be empty'
    }),
}

export const registerSchema = Joi.object({
  ...userBaseSchema,
  password: Joi.string().required(),
  
})

export const loginSchema = Joi.object({
   email: Joi.string().email().required().messages({
      'string.empty': 'Email cannot be empty',
    }),
  password: Joi.string().required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email().required()
    .messages({
      'string.empty': 'Email cannot be empty',
    })
})

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().required(),
  email: Joi.string()
    .email()
    .message('must be a valid email address')
    .required(),
})

export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .message('must be a valid email address')
    .required(),
  newPassword: Joi.string().required(),
})


export const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .message('must be a valid email address')
    .required(),
  password: Joi.string().required(),
  username: Joi.string().required(),
})

export const logoutSchema = Joi.object({
  id: Joi.string().required().messages({"any.only":"User id is required"})
})

export const getProfileSchema = Joi.object({
  id: Joi.string().required().messages({ 'any.only': 'User id is required' }),
})

export const deleteProfileSchema = Joi.object({
  id: Joi.string().required().messages({ 'any.only': 'User id is required' }),
})
