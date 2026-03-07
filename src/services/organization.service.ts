import axios from 'axios'
import bcrypt from 'bcryptjs'
import AppDataSource from '../configs/app-datasource.config'
import { User } from '../models/user-model.entity'
import { Organization } from '../models/organization-model.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import sharedUtils from '../validation/utils/shared.utils'
import redisService from './redis.service'
import emailService from './email.service'
const userRepo = AppDataSource.getRepository(User)
const orgRepo = AppDataSource.getRepository(Organization)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)

const createOrganization = async (organizationName: string, id: string) => {
  const user = await userRepo.findOne({
    where: {
      id: id,
    },
  })
  if (user?.id == null) {
    return new UnauthorizedError()
  }
  const orgName = await orgRepo.findOne({
    where:{
      organization_name: organizationName
    }, 
    select:{
      organization_name: true
    }
  })
   if(orgName){
    throw new ConflictError(`Organization with name ${orgName} already exist`)
   }

  let organization = orgRepo.create({
    organization_name: organizationName,
    created_by_id: user.id,
    created_by: user,
  })

  await orgRepo.save(organization)

  let organizationUser = orgUserRepo.create({
    display_name: user.username,
    user: user,
    organization: organization,
    role: 'owner',
    invite_status: 'accepted',
  })
  await orgUserRepo.save(organizationUser)

  let orgResult = {
    organization_name: organizationName,
    created_by: user.username,
    org_role: organizationUser.role,
    created_at: organization.created_at,
    invited_by: null,
    invite_status: organizationUser.invite_status,
  }
  return orgResult
}

const getAllOrganization = async (id: string) => {
  const user = await userRepo.findOne({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  })
  if (user?.id == null) {
    throw new UnauthorizedError()
  }
  const foundOrganization = await orgRepo.find({
    where: {
      created_by_id: user.id,
    },
    relations: ['created_by'],
  })

  return foundOrganization
}

const deleteOrganization = async (id: string, orgId: string) => {
  const orgUser = await orgUserRepo.findOne({
    where: {
      user: { id: id },
      organization: { id: orgId },
      role: 'owner',
    },
    relations: ['user', 'organization'],
  })
  console.log(orgUser)
  if (!orgUser || !['admin', 'owner'].includes(orgUser.role)) {
    throw new ForbiddenError()
  }

  await Promise.all([
    orgUserRepo.delete({
      organization: { id: orgId },
    }),

    orgRepo.delete({ id: orgId }),
  ])
}

const updateOrganizationName = async(id:string, orgId:string, orgName: string)=>{
  const org = await orgRepo.findOne({
        where: {
          id: orgId,
          created_by: { id: id },
        },
        relations: ['created_by'],
      })
      if (!org) {
        throw new UnauthorizedError()
      }
  
      const orgUser = await orgUserRepo.findOne({
        where: {
          organization: { organization_name: org.organization_name },
        },
        relations: ['user', 'organization'],
      })
  
      if (!sharedUtils.isOrgAdminOrOwner(orgUser))
        throw new UnauthorizedError()
  
      if (orgName) {
        org.organization_name = orgName
      }
  
      await orgRepo.save(org)
      return org
}

const getOrganizationById = async(orgId: string, id: string)=>{

  const membership = await orgUserRepo.findOne({
    where: {
      organization: { id: orgId },
      user: { id: id },
    },
    relations: ['organization', 'user'],
  })

  if (!membership){
    throw new UnauthorizedError()
  }

  const organization = await orgRepo.findOne({
    where: {
      id: orgId,
    },
    select:{
      id: true
    }
  })
  if (organization?.id == null){
    throw new UnauthorizedError()
  }
  
  return organization

}
const sendOrganizationInvite = async(orgId: string, id:string, email:string)=>{

  const organization = await orgRepo.findOne({
    where: {
      id: orgId,
    },
  })
  if (!organization){
    throw new UnauthorizedError()
  }

  const requester = await orgUserRepo.findOne({
    where: {
      user: { id: id },
      organization: { id: organization.id },
    },
    relations: ['user', 'organization'],
  })

  if (!sharedUtils.isOrgAdminOrOwner(requester)){
    throw new UnauthorizedError()
  }
 

  const rawToken = generateInviteToken()
  console.log(rawToken)
  const hashedToken = await hashInviteToken(rawToken)
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${rawToken}&orgId=${organization.id}`

  await redisService.setInviteToken(hashedToken, email, orgId,id)

  await emailService.sendInvite(
    email,
    inviteLink.toString(),
    organization.organization_name
  )
}

const getMembersInOrganization = async(id:string, orgId:string)=>{
  const requester = await orgUserRepo.findOne({
        where: {
          user: { id: id },
          organization: { id: orgId },
        },
        relations: ['user', 'organization'],
      })
  
      if (!sharedUtils.isOrgAdminOrOwner(requester)) {
        throw new UnauthorizedError()
      }
  
      const members = await orgUserRepo.find({
        where: {
          organization: { id: orgId },
        },
        relations: ['user'],
      })
      let result = members.map((member) => {
        return {
          name: member.display_name,
          role: member.role,
          email: member.user.email,
          invite_status: member.invite_status,
          joined_at: member.joined_at,
        }
      })
      return result
}
const generateInviteToken = (): string => {
  const token = crypto.randomUUID()
  return token
}

const hashInviteToken = async (token: string): Promise<string> => {
  const hashedToken = await bcrypt.hash(token, 10)
  return hashedToken
}

export default {
  createOrganization,
  getAllOrganization,
  deleteOrganization,
  updateOrganizationName,
  getOrganizationById,
  sendOrganizationInvite,
  getMembersInOrganization,
  generateInviteToken,
  hashInviteToken,
}
