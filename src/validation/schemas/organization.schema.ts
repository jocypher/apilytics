import Joi from 'joi'

export const createOrgSchema = Joi.object({
  org_name: Joi.string().required().messages({
    'string.empty': 'Organization name is required',
  }),
})

export const deleteOrganizationSchema = Joi.object({
  orgId: Joi.string().required().messages({
    'string.empty': 'Organization id is required',
  }),
})

export const updateOrgSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Organization name is required',
  }),
})

export const organizationIdSchema = Joi.object({
  orgId: Joi.string().required().messages({
    'string.empty': 'Organization id is required',
  }),
})

export const sendInvitationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
  }),
})

export const acceptOrganizationTokenSchema = Joi.object({
    token: Joi.string().required().messages({
        'string.empty':'Token is required'
    })
})

export const updateUserRoleSchema = Joi.object({
    targetUserId: Joi.string().required().messages({
        'string.empty':'User id is required'
    })
})
