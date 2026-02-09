import BaseJoi, { Root } from 'joi'

const passwordComplexity = (joi: Root) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'password.complexity':
      '{{#label}} must contain uppercase, lowercase, number and special character',
  },
  validate(value: string, helpers: BaseJoi.CustomHelpers) {
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasDigit = /[0-9]/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
      return { value, errors: helpers.error('password.complexity') }
    }

    return { value }
  },
})

const Joi = BaseJoi.extend(passwordComplexity)

export default Joi
