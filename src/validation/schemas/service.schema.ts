import Joi from "joi";



export const createServiceSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty':'Service name can\'t be empty'
    })
})

export const serviceIdSchema = Joi.object({
    serviceId: Joi.number().integer().required().messages({
    })
})

