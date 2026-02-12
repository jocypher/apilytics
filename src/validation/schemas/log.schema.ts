import Joi from "joi";


export const createManualLogsSchema = Joi.object({
   logMessage: Joi.string().required().messages({
    'string.empty': 'Log message required'
   }),
   logStatus: Joi.string().required().messages({
    'string.empty':'Log status required'
   }),
   LogTagName: Joi.string().required().messages({
    'string.empty':'LogTag name is required'
   })
})

export const ingestLogsSchema = Joi.object({
  message: Joi.string().required().messages({
    'string.empty': 'Log message required',
  }),
  
  level: Joi.string().required().messages({
    'string.empty': 'Log message required',
  }),
})