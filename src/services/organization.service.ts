import bcrypt from 'bcryptjs'
import AppDataSource from '../configs/appDatasource.config'
import { UserModel } from '../models/UserModel.entity'
import { Organization } from '../models/Organization.entity'
import { Membership } from '../models/Membership.entity'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import sharedUtils from '../validation/utils/shared.utils'
import redisService from './redis.service'
import emailService from './email.service'
import client from '../configs/redis.configs'
import { MembershipRole } from '../enums/membershipRole.enum'
import { InviteStatus } from '../enums/inviteStatus.enum'
const userRepo = AppDataSource.getRepository(UserModel)
const orgRepo = AppDataSource.getRepository(Organization)
const membershipRepo = AppDataSource.getRepository(Membership)

const createOrganization = async (organizationName: string, id: string) => {
  const user = await userRepo.findOne({
    where: {
      userId: id,
    },
  })
  if (user?.userId == null) {
    return new UnauthorizedError()
  }
  const orgName = await orgRepo.findOne({
    where: {
      organizationName: organizationName,
    },
    select: {
      organizationName: true,
    },
  })
  if (orgName) {
    throw new ConflictError(`Organization with name ${orgName} already exist`)
  }

  const organization = orgRepo.create({
    organizationName: organizationName,
    createdBy: user,
  })
  await orgRepo.save(organization)
  

  const member = membershipRepo.create({
    username: user.username,
    user: user,
    organization: organization,
    role: MembershipRole.OWNER,
    inviteStatus: InviteStatus.ACCEPT,
    invitedBy: user.userId
  })

  await  membershipRepo.save(member)

  const orgResult = {
    organizationId: organization.organizationId,
    organizationName: organizationName,
    createdBy: user.username,
    organizationRole: member.role,
    createdDate: organization.createdDate,
    invitedBy: null,
    inviteStatus: member.inviteStatus,
  }
  return orgResult
}

const getAllOrganization = async (id: string) => {
  const user = await userRepo.findOne({
    where: {
      userId: id,
    },
    select: {
      userId: true,
    },
  })
  if (user?.userId == null) {
    throw new UnauthorizedError()
  }
  const foundOrganization = await orgRepo.find({
    where: {
      createdBy: { userId: user.userId },
    }
  })
  const result = foundOrganization.map((org) => ({
    id: org.organizationId,
    createdBy: org.createdBy.username,
    name: org.organizationName,
    apps: org.apps ?? [],
    members: org.members ?? [],
  }))
  return result
}

const deleteOrganization = async (id: string, orgId: string) => {
  const member = await membershipRepo.findOne({
    where: {
      user: { userId: id },
      organization: { organizationId: orgId },
    },
    select:{
      role: true
    },
    relations: ['user', 'organization'],
  })
  console.log(member)
  if (!member || !['admin', 'owner'].includes(member.role)) {
    throw new UnauthorizedError()
  }

  await Promise.all([
    membershipRepo.delete({
      organization: { organizationId: orgId },
    }),

    orgRepo.delete({ organizationId: orgId }),
  ])
}

const updateOrganizationName = async (
  id: string,
  orgId: string,
  orgName: string
) => {
  const org = await orgRepo.findOne({
    where: {
      organizationId: orgId,
      createdBy: { userId: id },
    },
    select:{
      organizationName: true,
      organizationId: true
    }
  })
  if (!org) {
    throw new UnauthorizedError()
  }

  const member = await membershipRepo.findOne({
    where: {
      organization: { organizationName: org.organizationName },
    },
    relations: ['user', 'organization'],
  })

  if (!sharedUtils.isOrgAdminOrOwner(member!)) throw new UnauthorizedError()

  if (orgName) {
    org.organizationName = orgName
  }

  await orgRepo.save(org)
  return org
}

const getOrganizationById = async (orgId: string, id: string) => {
  const member = await membershipRepo.findOne({
    where: {
      organization: { organizationId: orgId },
      user: { userId: id },
    },
    relations: ['organization', 'user'],
  })

  if (!member) {
    throw new UnauthorizedError()
  }

  const organization = await orgRepo.findOne({
    where: {
      organizationId: orgId,
    },
    select: {
      organizationId: true,
    },
  })
  if (organization?.organizationId == null) {
    throw new UnauthorizedError()
  }

  return organization
}
const sendOrganizationInvite = async (
  orgId: string,
  id: string,
  email: string
) => {
  const organization = await orgRepo.findOne({
    where: {
      organizationId: orgId,
    },
  })
  if (!organization) {
    throw new UnauthorizedError()
  }

  const requester = await membershipRepo.findOne({
    where: {
      user: { userId: id },
      organization: { organizationId: organization.organizationId },
    },
    relations: ['user', 'organization'],
  })

  if (!sharedUtils.isOrgAdminOrOwner(requester!)) {
    throw new UnauthorizedError()
  }

  const rawToken = generateInviteToken()
  console.log(rawToken)
  const hashedToken = await hashInviteToken(rawToken)
  const inviteLink = `${process.env.FRONTEND_URL}/acceptInvite?token=${rawToken}&orgId=${organization.organizationId}`

  await redisService.setInviteToken(hashedToken, email, orgId, id)

  await emailService.sendInvite(
    email,
    inviteLink,
    organization.organizationName
  )
}

const acceptOrganizationInvite = async (token: string, orgId: string) => {
  const data = await client.get(`org_invite:${token}`)

  if (!data) {
    throw new NotFoundError('Invite not found or expired')
  }

  const inviteData = JSON.parse(data)
  if (inviteData.organizationId != orgId) {
    throw new ForbiddenError('Invalid invite')
  }

  let user = await userRepo.findOne({
    where: { email: inviteData.email },
  })

  if (!user) {
    user = userRepo.create({
      email: inviteData.email,
      username: inviteData.email.split('@')[0],
    })

    await userRepo.save(user)
  }

  const organization = await orgRepo.findOne({
    where: {
      
      organizationId: orgId,
    },
  })
  if (!organization) {
    throw new NotFoundError('Organization does not exist')
  }

  const existingMembership = await membershipRepo.findOne({
    where: {
      user: { userId: user.userId },
      organization: { organizationId: orgId },
    },
    relations: ['user', 'organization'],
  })
  if (existingMembership) {
    throw new ForbiddenError('User already a member of the organization')
  }

 const member = membershipRepo.create({
   username: user.username,
   user: user,
   organization: organization,
   role: MembershipRole.MEMBER,
   inviteStatus: InviteStatus.ACCEPT,
   invitedBy:inviteData.invitedBy
 })

  await membershipRepo.save(member)
  await client.del(`org_invite:${token}`)
}

const getMembersInOrganization = async (id: string, orgId: string) => {
  const requester = await membershipRepo.findOne({
    where: {
      user: { userId: id },
      organization: { organizationId: orgId },
    },
    relations: ['user', 'organization'],
  })

  if (!sharedUtils.isOrgAdminOrOwner(requester!)) {
    throw new UnauthorizedError()
  }

  const members = await membershipRepo.find({
    where: {
      organization: { organizationId: orgId },
    },
    relations: ['user'],
  })
  const result = members.map((member) => {
    return {
      name: member.username,
      role: member.role,
      email: member.user.email,
      inviteStatus: member.inviteStatus,
      joinedDate: member.joinedDate,
    }
  })
  return result
}

const updateUserRole = async (
  targetUserId: string,
  orgId: string,
  reqUserId: string

) => {
  if (!sharedUtils.isOrgAdminOrOwner(reqUserId)) {
    throw new ForbiddenError('Forbidden')
  }
  const existingMembership = await membershipRepo.findOne({
    where: {
      user: { userId: targetUserId },
      organization: { organizationId: orgId },
    },
    relations: ['organization', 'user'],
  })
  if (!existingMembership) {
    throw new ForbiddenError('user is not a member of this organization')
  }

  if (
    existingMembership.role === MembershipRole.ADMIN ||
    existingMembership.role === MembershipRole.OWNER
  ){
    throw new UnauthorizedError("user already has authorization")
  }
    existingMembership.role = MembershipRole.ADMIN

  await membershipRepo.save(existingMembership)
}

const getOrganizationsForUser = async (userId: string) => {
  const organizationsForUsers = await membershipRepo.find({
    where: {
      user: { userId: userId },
    },
    select: {
      organization: true,
    },
  })

  for (const orgs in organizationsForUsers) {
    console.log(orgs)
  }
  return organizationsForUsers
}

const addUserToOrganization = async(userId: string, username: string, email:string,organizationId: string)=> {


  const admin = await membershipRepo.findOne({
    where:{
      organization:{organizationId: organizationId},
      user:{ userId: userId}
    }, 
    select:{
      role:true,
      membershipId:true

    },
    relations:{
        user:true,
        organization:true
    }
  })

  if(!admin){
    throw new UnauthorizedError('user not authorized')
  }

  const userExist = await userRepo.findOne({
    where:{
      username: username, 
      email: email
    }

  })

  if(!userExist){
    throw new ForbiddenError()
  }

  const addMember = membershipRepo.create({
    user: userExist,
    username: userExist.username,
    inviteStatus:InviteStatus.ACCEPT,
    invitedBy: userId,
    organization: admin.organization
  })

  await membershipRepo.save(addMember)

  return addMember


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
  acceptOrganizationInvite,
  getOrganizationsForUser,
  addUserToOrganization,
  updateUserRole,
  generateInviteToken,
  hashInviteToken,
}
