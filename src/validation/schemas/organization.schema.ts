import Joi from 'joi'

export const createOrgSchema = Joi.object({
  org_name: Joi.string().required().messages({
    'string.empty': 'Name of organization is required',
  }),
})

export const deleteOrganizationSchema = Joi.object({
    orgId: Joi.string().required().messages({
        'string.empty':'Organization id is required'
    })
})

export const updateOrgSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name of organization is required',
  }),
})

export const organizationIdSchema = Joi.object({
    orgId: Joi.string().required().messages({
    'string.empty':"Organization id is required"
    })
})



