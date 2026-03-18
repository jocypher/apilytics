import AppDataSource from '../configs/app-datasource.config'
import { ApiKey } from '../models/api-key.entity'
import { SubComponentUser } from '../models/org-service-user.entity'
import { SubComponent } from '../models/organization-service.entity'
import { OrganizationUser } from '../models/organization-user.entity'

import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import sharedUtils from '../validation/utils/shared.utils'
import redisService from './redis.service'

const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const serviceRepo = AppDataSource.getRepository(SubComponent)
const serviceUserRepo = AppDataSource.getRepository(SubComponentUser)
const apiKeyRepo = AppDataSource.getRepository(ApiKey)
const createService = async (userId: string, orgId: string, name: string) => {
  const organizationMember = await orgUserRepo.findOne({
    where: {
      organization: { id: orgId },
      user: { id: userId },
    },
    relations: ['organization', 'user'],
  })
  if (!organizationMember) {
    throw new ForbiddenError('Not a member of the organization')
  }
  if (!sharedUtils.isOrgAdminOrOwner(organizationMember)) {
    throw new UnauthorizedError('User not authorized to create a service')
  }
  const newService = serviceRepo.create({
    name: name,
    created_by: organizationMember.user,
    organization: organizationMember.organization,
  })

  const savedNewService = await serviceRepo.save(newService)

  return savedNewService
}

const assignUserToService = async (
  userId: string,
  orgId: string,
  serviceId: number,
  roleToChangeId: string
) => {
  const requesterMembership = await orgUserRepo.findOne({
    where: {
      organization: { id: orgId },
      user: { id: userId },
    },
    relations: ['organization', 'user'],
  })
  if (!requesterMembership) {
    throw new ForbiddenError('Not a member')
  }
  if (!sharedUtils.isOrgAdminOrOwner(requesterMembership)) {
    throw new UnauthorizedError('Unauthorized user')
  }

  const targetMembership = await orgUserRepo.findOne({
    where: {
      organization: { id: orgId },
      user: { id: roleToChangeId },
    },
    relations: ['organization', 'user'],
  })

  if (!targetMembership) {
    throw new UnauthorizedError('User not part of the organization')
  }

  const service = await serviceRepo.findOne({
    where: {
      id: serviceId,
      organization: { id: orgId },
    },
    relations: ['organization'],
  })

  if (!service) {
    throw new NotFoundError('service not found')
  }

  const existingAssignment = await serviceUserRepo.findOne({
    where: {
      user: { id: targetMembership.user.id },

      sub_component: { id: service.id },
    },
    relations: ['user'],
  })

  if (existingAssignment) {
    throw new UnauthorizedError('user already assigned to service')
  }
  const serviceUser = serviceUserRepo.create({
    user: targetMembership.user,
    sub_component: service,
    assigned_by: requesterMembership?.user,
  })

  const result = await serviceUserRepo.save(serviceUser)

  return result
}

const deleteService = async (
  userId: string,
  orgId: string,
  serviceId: number
) => {
  const orgMember = await orgUserRepo.findOne({
    where: {
      user: { id: userId },
      organization: { id: orgId },
    },
    relations: ['user', 'organization'],
  })

  if (!orgMember) {
    throw new UnauthorizedError('Unauthorized Error')
  }

  if (!sharedUtils.isOrgAdminOrOwner(orgMember)) {
    throw new UnauthorizedError('Unauthorized Error')
  }

  const foundService = await serviceRepo.findOne({
    where: { id: serviceId, organization: { id: orgId } },
    relations: ['organization'],
  })

  if (!foundService) {
    throw new NotFoundError('Service cannot be found')
  }

  await serviceUserRepo.delete({
    sub_component: { id: serviceId },
  })

  await serviceRepo.delete({ id: serviceId })
}

const getServiceById = async(requesterId: string, orgId: string,serviceId: number ) => {
  const membership = await orgUserRepo.findOne({
    where:{
      organization:{id: orgId},
      user:{id: requesterId}
    },
    relations: ['organization','user']
  })

  if(!membership){
    throw new UnauthorizedError('Unauthorized')
  }
  const foundService = await serviceRepo.findOne({
    where:{
      id: serviceId,
      organization:{id: orgId}
    },
     relations: ['organization']
  })
  if(!foundService){
    throw new UnauthorizedError('Unauthorized Error')
  }
  return foundService
}



const getAssignedUserForService = async(userId: string, orgId: string, serviceId: number, page:number, limit:number, skip:number) =>{
  const orgMember = await orgUserRepo.findOne({
    where:{
      organization:{id:orgId},
      user:{id: userId}
    },
    select:{
      id: true
    },
    relations:['organization', 'user']
  })
  if(!orgMember){
    throw new UnauthorizedError()
  }
  const foundService = await serviceRepo.findOne({
    where:{
      id: serviceId,
      organization:{id:orgId}
    },
    relations: ['organization']
  })
  if(!foundService){
    throw new UnauthorizedError()
  }
  if(!sharedUtils.isOrgAdminOrOwner(orgMember)){
    throw new ForbiddenError()
  }
  const [assignments, total] = await serviceUserRepo.findAndCount({
    where:{
      sub_component:{id: serviceId}
    },
    relations: ['user'],
    skip,
    take: limit
  })
  if(assignments.length ===0){
    throw new UnauthorizedError('Unauthorized')
  }

  const users = assignments.map((a:SubComponentUser)=>a.user)

  return {page, limit, total, users}
  
}

const generateApiKey = async(userId: string, orgId:string, serviceId: number)=>{
  const foundUser = await orgUserRepo.findOne({
    where:{
      id: userId
    },
    select:{
      id: true,
      user:{username: true}
    }
  })
  if(foundUser?.id === null){
    throw new UnauthorizedError('Unauthorized')
  }

  const orgUser = await orgUserRepo.findOne({
    where:{
      organization:{id:orgId},
      user:{id: userId}
    },
    select:{id:true},
    relations: ['user', 'organization']
  })

  if(!orgUser ||orgUser?.id === null){
    throw new UnauthorizedError()
  }
  const service = await serviceRepo.findOne({
    where:{
      id: serviceId
    },
    select:{
      id: true,
      name: true
    }
  })
  if(service?.id == null || service?.name){
    throw new UnauthorizedError()
  }
  if(!sharedUtils.isOrgAdminOrOwner(orgUser)){
    throw new UnauthorizedError()
  }
 const option = {
       username: foundUser?.user.username,
       organizationName: orgUser.organization.organization_name,
       serviceName: service.name,
     }
     const apiKey = sharedUtils.generateApiKey(option)
     const hashApiKey = await sharedUtils.hashApiKey(apiKey)
     const createApiKey = apiKeyRepo.create({
       key_hash: hashApiKey,
       key_prefix: apiKey.slice(0, 6),
       subcomponent: service,
       is_active: true,
       created_by_user: orgUser.user,
       expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
     })

     await redisService.storeApiKey(hashApiKey,apiKey)
 
     await apiKeyRepo.save(createApiKey)

}

export default {
  createService,
  assignUserToService,
  deleteService,
  getServiceById,
  getAssignedUserForService,
  generateApiKey
}
