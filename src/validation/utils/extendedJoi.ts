
import BaseJoi, { CustomHelpers } from 'joi'


const passwordComplexityExtension = {
  type: 'string',
  base: BaseJoi.string(),
  messages: {
    'password.complexity':
      '{{#label}} must contain uppercase, lowercase, number and special character',
  },
  rules: {
    passwordComplexity: {
      validate(value: string, helpers: CustomHelpers) {
        const hasUpper = /[A-Z]/.test(value)
        const hasLower = /[a-z]/.test(value)
        const hasDigit = /[0-9]/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

        if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
          return helpers.error('password.complexity')
        }
        return value 
      },
    },
  },
}


const Joi = BaseJoi.extend(passwordComplexityExtension)

export default Joi
