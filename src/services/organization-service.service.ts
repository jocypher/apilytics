import AppDataSource from '../configs/app-datasource.config'
import { SubComponentUser } from '../models/org-service-user.entity'
import { SubComponent } from '../models/organization-service.entity'
import { OrganizationUser } from '../models/organization-user.entity'

import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import sharedUtils from '../validation/utils/shared.utils'

const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const serviceRepo = AppDataSource.getRepository(SubComponent)
const serviceUserRepo = AppDataSource.getRepository(SubComponentUser)


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
    relations: ['organization']
  })

  if(!service) {
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


const deleteService = async(userId: string, orgId:string) =>{
    const orgMember = await orgUserRepo.findOne({
        where:{
            user: {id: userId},
            organization: {id:orgId}
        },
        relations:['user', 'organization']
    })

    if(!orgMember){
        throw new UnauthorizedError('Unauthorized Error')
    }
    
}


export default {
  createService,
  assignUserToService,
  deleteService
}
