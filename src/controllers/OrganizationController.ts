import AppDataSource from '../configs/app-datasource.config'
import { Organization } from '../models/organization-model.entity'
import { User } from '../models/user-model.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import organizationService from '../services/organization.service'
import client from '../configs/redis.configs'
import bcrypt from 'bcryptjs'
import sharedUtils from '../validation/utils/shared.utils'
import { UnauthorizedError } from '../validation/utils/errors/errors'
import emailService from '../services/email.service'
import { Request, Response, NextFunction } from 'express'
import { FindOptionsWhere } from 'typeorm'

const userRepo = AppDataSource.getRepository(User)
const orgRepo = AppDataSource.getRepository(Organization)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)

const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { org_name } = req.body
  const id = req.id
  try {
    let orgResult = await organizationService.createOrganization(org_name, id)
    return res
      .status(201)
      .json({ message: 'organization created', org: orgResult })
  } catch (err) {
    next(err)
  }
}

const getAllOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.id
  try {
    let organizations = await organizationService.getAllOrganization(id)
    console.log(organizations)
    return res.status(200).json(organizations)
  } catch (err: any) {
    console.error(err)
    next(err)
  }
}

const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.id
  const orgId = req.params.id
  try {
    await organizationService.deleteOrganization(id, orgId as string)

    return res
      .status(200)
      .json({ message: `organization with id ${orgId} deleted successfully` })
  } catch (err) {
    next(err)
    console.error('The errors involved in the system are', err)
  }
}

const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orgId = req.params.id
  const { name } = req.body
  const id = req.id
  try {
    let org = await organizationService.updateOrganizationName(
      id,
      orgId as string,
      name
    )
    return res
      .status(200)
      .json({ message: 'update successful', org_name: org.organization_name })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

const getOrganizationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orgId = req.params.id
  const userId = req.id

  try {
    let organization = await organizationService.getOrganizationById(
      orgId as string,
      userId
    )

    return res.status(200).json({ organization: organization })
  } catch (err) {
    console.error(`The error involved is ${err}`)
    next(err)
  }
}

const sendInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const { orgId } = req.params
  const userId = req.id

  try {
    await organizationService.sendOrganizationInvite(
      orgId as string,
      userId,
      email
    )

    return res.status(200).json({ message: 'Invite sent successfully' })
  } catch (err: any) {
    console.log(err)
    next(err)
  }
}

const getMembersInOrganization = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.id
  const { orgId } = req.params

  try {
    let result = await organizationService.getMembersInOrganization(userId, orgId as string)
    return res.status(200).json(result)
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const acceptOrganizationInvite = async (req: any, res: any, next: any) => {
  const { token, orgId } = req.query
  const { userId } = req.params
  const id = req.id

  try {
    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    })
    console.log(user)
    if (!user) return res.status(404).json({ message: 'user does not exist' })

    const keys = await client.keys(`org_invite:*`)

    let inviteData: any = null
    for (const key of keys) {
      const data = await client.get(key)
      if (data) {
        const parsedData = JSON.parse(data)
        const matchedData = await bcrypt.compare(
          token,
          key.replace('org_invite:', '')
        )
        if (
          matchedData &&
          parsedData.organizationId == orgId &&
          parsedData.email == user.email
        ) {
          inviteData = parsedData
          break
        }
      }
    }
    let organization = await orgRepo.findOne({
      where: {
        id: orgId,
      },
    })
    if (!organization)
      return res.status(500).json({ message: 'no org available' })

    const existingMembership = await orgUserRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      relations: ['user', 'organization'],
    })
    if (existingMembership != null)
      return res
        .status(401)
        .json({ message: 'User already a member of the organization' })

    const orgUser = orgUserRepo.create({
      display_name: user.username,
      user: user,
      organization: organization,
      role: 'member',
      invite_status: 'accepted',
      invited_by_user_id: id,
    })

    await orgUserRepo.save(orgUser)
    return res.status(200).json({ message: 'User accepted to organization' })
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const updateUserRole = async (req: any, res: any, next: any) => {
  const { targetUserId, orgId } = req.params
  const reqUserId = req.id

  try {
    let existingMembership = await orgUserRepo.findOne({
      where: {
        user: { id: targetUserId },
        organization: { id: orgId },
      },
      relations: ['organization', 'user'],
    })
    if (!existingMembership)
      return res
        .status(404)
        .json({ message: 'user does not exist in the organization' })

    if (!sharedUtils.isOrgAdminOrOwner(reqUserId)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    existingMembership.role = 'admin'

    await orgUserRepo.save(existingMembership)

    return res.status(200).json({ message: 'updated role successfully' })
  } catch (err: any) {
    console.error(err)
    next(err)
    
  }
}
const getUsersOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {}

export default {
  createOrganization,
  sendInvitation,
  getAllOrganization,
  deleteOrganization,
  updateOrganization,
  getMembersInOrganization,
  acceptOrganizationInvite,
  getOrganizationById,
  updateUserRole,
  getUsersOrganization,
}
