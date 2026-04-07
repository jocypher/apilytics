import Joi from "../utils/extendedJoi"

console.log(`The result is ${typeof Joi.string().passwordComplexity}`)

export const userIdSchema = Joi.object({
  userId: Joi.string()
    .messages({
      'string.empty': 'User id required',
    })
    .required(),
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
  email: Joi.string()
    .email()
    .messages({
      'string.empty': 'Display mail cannot be empty',
    })
    .required(),
}

export const registerSchema = Joi.object({
  ...userBaseSchema,
  password: Joi.string().passwordComplexity().min(8).required(),
})

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.empty': 'Email cannot be empty',
    })
    .required(),
  password: Joi.string().passwordComplexity().min(8).required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.empty': 'Email cannot be empty',
    })
    .required(),
})

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().required().max(4),
  email: Joi.string()
    .email()
    .label('must be a valid email address')
    .required(),
})

export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .label('must be a valid email address')
    .required(),
  newPassword: Joi.string().passwordComplexity().min(8).required(),
})

export const updateEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .label('must be a valid email address')
    .required(),
  newEmail: Joi.string()
    .email()
    .label('must be a valid email address')
    .required(),
})

export const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().passwordComplexity().min(8).required(),
  newPassword: Joi.string().passwordComplexity().min(8).required(),
  confirmNewPassword: Joi.string().passwordComplexity().min(8).required(),
})

export const updateUsernameSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(4)
    .max(20)
    .messages({
      'string.empty': 'Display name cannot be empty',
      'string.min': 'Min 6 characters',
    })
    .required(),
})

export const logoutSchema = Joi.object({
  id: Joi.string()
    .messages({ 'any.only': 'User id is required' })
    .required(),
})

export const getProfileSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({ 'any.only': 'User id is required' })
    .required(),
})

export const deleteProfileSchema = Joi.object({
  id: Joi.string().messages({ 'any.only': 'User id is required' }),
})


export const refreshTokenValidation = Joi.object({
  token: Joi.string().label('token').required(),
})
