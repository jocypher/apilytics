import organizationService from '../services/organization.service'

import { Request, Response, NextFunction } from 'express'
import sharedUtils from '../validation/utils/shared.utils'

const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { org_name } = req.body
  const id = req.id
  try {
    const orgResult = await organizationService.createOrganization(org_name, id)
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
    const organizations = await organizationService.getAllOrganization(id)
    console.log(organizations)
    return res.status(200).json(organizations)
  } catch (err: unknown) {
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
  const orgId = sharedUtils.validatedParam(req.params.id)
  try {
    await organizationService.deleteOrganization(id, orgId)

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
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const { name } = req.body
  const id = req.id
  try {
    const org = await organizationService.updateOrganizationName(
      id,
      orgId,
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
  const orgId = sharedUtils.validatedParam(req.params.id)
  const userId = req.id

  try {
    const organization = await organizationService.getOrganizationById(
      orgId,
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
  const orgId = sharedUtils.validatedParam(req.params.id)
  const userId = req.id

  try {
    await organizationService.sendOrganizationInvite(
      orgId,
      userId,
      email
    )
    return res.status(200).json({ message: 'Invite sent successfully' })
  } catch (err: unknown) {
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
  const orgId  = sharedUtils.validatedParam(req.params.orgId)

  try {
    const result = await organizationService.getMembersInOrganization(
      userId,
      orgId
    )
    return res.status(200).json(result)
  } catch (err: unknown) {
    next(err)
  }
}

const acceptOrganizationInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, orgId } = req.query
  try {
    await organizationService.acceptOrganizationInvite(
      token as string,
      orgId as string
    )
    return res.status(200).json({ message: 'User accepted to organization' })
  } catch (err: unknown) {
    next(err)
  }
}

const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orgId =sharedUtils.validatedParam(req.params.orgId)
  const targetUserId = sharedUtils.validatedParam(req.params.targetUserId)
  const reqUserId = req.id

  try {
    await organizationService.updateUserRole(
      targetUserId ,
      orgId ,
      reqUserId 
    )
    return res.status(200).json({ message: 'role updated successfully' })
  } catch (err: unknown) {
    console.error(err)
    next(err)
  }
}
const getUsersOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgs = await organizationService.getUsersOrganizations(req.id)
    return res.status(200).json({ orgs })
  } catch (err) {
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
