import Joi from "joi"


export const userBaseSchema = {
  username: Joi.string().alphanum().min(4).max(20).required(),
  email: Joi.string().email().required(),
}


const registerBaseSchema = Joi.object({
    ...userBaseSchema,
    password: Joi.string().required(),
})

const loginBaseSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})


const validateData = {
  username: 'Jojoemeka',
  email: 'arthurwilchield@gmail.com',
  password: 'StrongPassword123.isTrue',
}

