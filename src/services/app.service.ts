import AppDataSource from '../configs/appDatasource.config'
import { ApiKey } from '../models/ApiKey.entity'
import { AppUser } from '../models/AppUser.entity'
import { App } from '../models/App.entity'
import { Membership } from '../models/Membership.entity'

import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import sharedUtils from '../validation/utils/shared.utils'
import redisService from './redis.service'

const membershipRepo = AppDataSource.getRepository(Membership)
const appRepo = AppDataSource.getRepository(App)
const appUserRepo = AppDataSource.getRepository(AppUser)
const apiKeyRepo = AppDataSource.getRepository(ApiKey)

const createApp = async (userId: string, orgId: string, name: string) => {
  const member = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: userId },
    },
    relations: ['organization', 'user'],
  })
  if (!member) {
    throw new ForbiddenError('Not a member of the organization')
  }
  if (!sharedUtils.isOrgAdminOrOwner(member)) {
    throw new UnauthorizedError('User not authorized to create a service')
  }
  const app = appRepo.create({
    name: name,
    createdBy: member.user,
    organization: member.organization,
  })

  const savedApp = await appRepo.save(app)

  return savedApp
}

const assignUserToApp = async (
  userId: string,
  orgId: string,
  appId: string,
  targetUserId: string
) => {
  const requesterMembership = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: userId },
    },
    relations: ['organization', 'user'],
  })
  if (!requesterMembership) {
    throw new ForbiddenError('Not a member')
  }
  if (!sharedUtils.isOrgAdminOrOwner(requesterMembership)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const targetMembership = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: targetUserId },
    },
    relations: ['organization', 'usermodel'],
  })

  if (!targetMembership) {
    throw new UnauthorizedError('User not part of the organization')
  }

  const app = await appRepo.findOne({
    where: {
      appId: appId,
      organization: { organizationId: orgId },
    },
    relations: ['organization'],
  })

  if (!app) {
    throw new NotFoundError('service not found')
  }

  const existingUserAssignment = await appUserRepo.findOne({
    where: {
      assignedTo: { userId: targetMembership.user.userId },

      app: { appId: app.appId },
    },
    relations: ['user'],
  })

  if (existingUserAssignment) {
    throw new UnauthorizedError('user already assigned to service')
  }
  const appUser = appUserRepo.create({
    assignedTo: targetMembership.user,
    app: app,
    assignedBy: requesterMembership?.user,
  })

  const result = await appUserRepo.save(appUser)

  return result
}

const deleteApp = async (userId: string, orgId: string, appId: string) => {
  const member = await membershipRepo.findOne({
    where: {
      user: { userId: userId },
      organization: { organizationId: orgId },
    },
    relations: ['user', 'organization'],
  })

  if (!member) {
    throw new UnauthorizedError('Unauthorized Error')
  }

  if (!sharedUtils.isOrgAdminOrOwner(member)) {
    throw new UnauthorizedError('Unauthorized Error')
  }

  const foundApp = await appRepo.findOne({
    where: { appId: appId, organization: { organizationId: orgId } },
    relations: ['organization'],
  })

  if (!foundApp) {
    throw new NotFoundError('Service cannot be found')
  }

  await Promise.all([
    appUserRepo.delete({
      app: { appId: appId },
    }),

    appRepo.delete({ appId: appId }),
  ])
}

const getAppById = async (
  requesterId: string,
  orgId: string,
  appId: string
) => {
  const membership = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: requesterId },
    },
    relations: ['organization', 'user'],
  })

  if (!membership) {
    throw new UnauthorizedError('Unauthorized')
  }
  const foundApp = await appRepo.findOne({
    where: {
      appId: appId,
      organization: { organizationId: orgId },
    },
    relations: ['organization'],
  })
  if (!foundApp) {
    throw new UnauthorizedError('Unauthorized Error')
  }
  return foundApp
}

const getAssignedUsersForApp = async (
  userId: string,
  orgId: string,
  appId: string,
  page: number,
  limit: number,
  skip: number
) => {
  const member = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: userId },
    },
    select: {
      user: true,
    },
    relations: ['organization', 'user'],
  })
  if (!member) {
    throw new UnauthorizedError()
  }
  const foundApp = await appRepo.findOne({
    where: {
      appId: appId,
      organization: { organizationId: orgId },
    },
    relations: ['organization'],
  })
  if (!foundApp) {
    throw new UnauthorizedError()
  }
  // if(!sharedUtils.isOrgAdminOrOwner(orgMember)){
  //   throw new ForbiddenError()
  // }

  const [assignments, total] = await appUserRepo.findAndCount({
    where: {
      app: { appId: appId },
    },
    relations: ['user'],
    skip,
    take: limit,
  })

  const users = assignments.map((a: AppUser) => a.assignedTo.username)

  const result = { page, limit, total, users }
  return result
}

const generateApiKey = async (
  userId: string,
  orgId: string,
  appId: string
) => {

  const member = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: userId },
    },
    select: { membershipId: true },
    relations: ['user', 'organization'],
  })


  if (!member || member?.membershipId === null) {
    throw new ForbiddenError()
  }

   if (!sharedUtils.isOrgAdminOrOwner(member)) {
     throw new UnauthorizedError()
   }

  const app = await appRepo.findOne({
    where: {
      appId: appId,
    },
    select: {
      appId: true,
      name: true,
    },
  })
  if (app?.appId == null || app?.name) {
    throw new UnauthorizedError()
  }
 
  const option = {
    username: member?.user.username,
    organizationName: member.organization.organizationName,
    serviceName: app.name,
  }
  const apiKey = sharedUtils.generateApiKey(option)
  const hashApiKey = await sharedUtils.hashApiKey(apiKey)
  const createApiKey = apiKeyRepo.create({
    keyHash: hashApiKey,
    keyPrefix: apiKey.slice(0, 6),
    apps: app,
    isActive: true,
    createdByAdmin: member.user,
    expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  await redisService.storeApiKey(hashApiKey, apiKey)

  await apiKeyRepo.save(createApiKey)
  return apiKey
}

export default {
  createApp,
  assignUserToApp,
  deleteApp,
  getAppById,
  getAssignedUsersForApp,
  generateApiKey,
}
