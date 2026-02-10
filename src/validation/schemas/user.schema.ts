import Joi from 'joi'


export const userBaseSchema = {
  username: Joi.string().alphanum().min(4).max(20).required(),
  email: Joi.string().email().required(),
}

export const registerSchema = Joi.object({
  ...userBaseSchema,
  password: Joi.string().passwordComplexity().required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().passwordComplexity().required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().passwordComplexity().required()
})

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().required(),
  email: Joi.string().email().required()
})

export const resetPasswordSchema  = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().passwordComplexity().required()
})


export const updateUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().passwordComplexity().required(),
  username: Joi.string().required()
})

export const logoutSchema = Joi.object({
  id: Joi.string().required().message("User id is required")
})

export const getProfileSchema = Joi.object({
  id: Joi.string().required().message('User id is required')
})

export const deleteProfileSchema = Joi.object({
  id: Joi.string().required().message('User id is required'),
})
