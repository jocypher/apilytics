import AppDataSource from '../configs/app-datasource.config'
import { Organization } from '../models/organization-model.entity'
import { User } from '../models/user-model.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import organizationService from '../services/organization.service'
import client from '../configs/redis.configs'
import bcrypt from 'bcryptjs'
import sharedUtils from '../validation/utils/shared.utils'
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../validation/utils/errors/errors'
import emailService from '../services/email.service'
import { Request, Response, NextFunction } from 'express'
import { FindOptionsWhere, Not } from 'typeorm'

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

const getMembersInOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.id
  const { orgId } = req.params

  try {
    let result = await organizationService.getMembersInOrganization(
      userId,
      orgId as string
    )
    return res.status(200).json(result)
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const acceptOrganizationInvite = async (req: any, res: any, next: any) => {
  const { token, orgId } = req.query
  try {
    await organizationService.acceptOrganizationInvite(token, orgId)
    return res.status(200).json({ message: 'User accepted to organization' })
  } catch (err: any) {
    next(err)
  }
}

const updateUserRole = async (req: any, res: any, next: any) => {
  const { targetUserId, orgId } = req.params
  const reqUserId = req.id

  try {
    await organizationService.updateUserRole(targetUserId, orgId, reqUserId)
    return res.status(200).json({ message: 'role updated successfully' })
  } catch (err: any) {
    console.error(err)
    next(err)
  }
}
const getUsersOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
  let orgs = await organizationService.getUsersOrganizations(req.id)
  return res.status(200).json({orgs})
  }catch(err){
    next(err)
  }
}

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
  getUsersOrganizations,
}
