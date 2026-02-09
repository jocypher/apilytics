import AppDataSource from '../configs/app-datasource.config'
import { Organization } from '../models/organization-model.entity'
import { User } from '../models/user-model.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import organizationService from '../services/organization.service'
import client from '../configs/redis.configs'
import bcrypt from 'bcryptjs'
import { validate as isUUID } from 'uuid'
import sharedUtils from '../validation/utils/shared.utils'

const userRepo = AppDataSource.getRepository(User)
const orgRepo = AppDataSource.getRepository(Organization)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)

const createOrganization = async (req: any, res: any, next: any) => {
  const { org_name } = req.body
  const id = req.id
  try {
    const user = await userRepo.findOne({
      where: {
        id: id,
      },
    })
    if (!user) {
      return res.status(401).json({ message: 'user not found' })
    }

    let organizationCreated = orgRepo.create({
      organization_name: org_name,
      created_by_id: user.id,
      created_by: user,
    })

    // save the organization to the db
    await orgRepo.save(organizationCreated)

    let organizationUser = orgUserRepo.create({
      display_name: user.username,
      user: user,
      organization: organizationCreated,
      role: 'owner',
      invite_status: 'accepted',
    })
    await orgUserRepo.save(organizationUser)

    let orgResult = {
      organization_name: org_name,
      created_by: user.username,
      org_role: organizationUser.role,
      created_at: organizationCreated.created_at,
      invited_by: null,
      invite_status: organizationUser.invite_status,
    }

    return res
      .status(201)
      .json({ message: 'organization created', org: orgResult })
  } catch (err) {
    next(err)
    return res.status(500).json({ message: err })
  }
}

const getAllOrganization = async (req: any, res: any, next: any) => {
  const id = req.id
  try {
    const user = await userRepo.findOne({
      where: {
        id: id,
      },
    })
    if (!user) return res.status(403).json({ message: 'user not found' })
    const orgs = await orgRepo.find({
      where: {
        created_by_id: user.id,
      },
      relations: ['created_by'],
    })
    console.log(orgs)
    return res.status(200).json(orgs)
  } catch (err: any) {
    console.error(err)
    next(err)
    return res.status(500).json({ message: err })
  }
}

const deleteOrganization = async (req: any, res: any, next: any) => {
  const id = req.id
  const orgId = req.params.id
  try {
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
      return res.status(403).json({
        message: 'You are not allowed to delete this organization',
      })
    }

    await orgUserRepo.delete({
      organization: { id: orgId },
    })

    await orgRepo.delete({ id: orgId })

    return res
      .status(200)
      .json({ message: `organization with id ${orgId} deleted successfully` })
  } catch (err) {
    next(err)
    console.error('The errors involved in the system are', err)
  }
}

const updateOrganization = async (req: any, res: any, next: any) => {
  const orgId = req.params.id
  const { name } = req.body
  const id = req.id

  if (!orgId) return res.status(400).json({ message: 'Invalid id' })
  if (!name) return res.status(400).json({ message: 'Bad request' })

  try {
    const org = await orgRepo.findOne({
      where: {
        id: orgId,
        created_by: { id: id },
      },
      relations: ['created_by'],
    })
    if (!org) return res.status(400).json({ message: 'Organization not found' })

    const orgUser = await orgUserRepo.findOne({
      where: {
        organization: { organization_name: org.organization_name },
      },
      relations: ['user', 'organization'],
    })

    if (!sharedUtils.isOrgAdminOrOwner(orgUser))
      return res
        .status(401)
        .json({ message: 'User not authorized to update organization name' })

    if (name) org.organization_name = name

    await orgRepo.save(org)
    return res.status(200).json({ message: 'update successful', org: org })
  } catch (err) {
    console.log(err)
    next(err)
    return res.status(500).json({ message: `The error is ${err}` })
  }
}

const getOrganizationById = async (req: any, res: any, next: any) => {
  const orgId = req.params.id
  const userId = req.id

  if (!orgId)
    return res
      .status(404)
      .json({ message: `organization with id: ${orgId} not found` })
  try {
    const membership = await orgUserRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
      },
      relations: ['organization', 'user'],
    })

    if (!membership)
      return res
        .status(401)
        .json({ message: 'user is not a member of the the organization' })

    const organization = await orgRepo.findOne({
      where: {
        id: orgId,
      },
    })
    if (!organization)
      return res.status(404).json({ message: "Organization doesn't exist" })

    return res.status(200).json({ organization: organization })
  } catch (err) {
    console.error(`The error involved is ${err}`)
    next(err)
    return res.status(500).json({ message: `Server error is ${err}` })
  }
}

const sendInvitation = async (req: any, res: any, next: any) => {
  const { email } = req.body
  const { orgId } = req.params
  const userId = req.id

  if (!email) return res.status(401).json({ message: 'field required' })
  try {
    const organization = await orgRepo.findOne({
      where: {
        id: orgId,
      },
    })
    if (!organization)
      return res.status(404).json({ message: 'organization not found' })

    const requester = await orgUserRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: organization.id },
      },
      relations: ['user', 'organization'],
    })

    if (!sharedUtils.isOrgAdminOrOwner(requester))
      return res
        .status(400)
        .json({ message: "you don't have access to send invitation link" })

    const rawToken = organizationService.generateInviteToken()
    const hashedToken = await organizationService.hashInviteToken(rawToken)

    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${rawToken}&orgId=${organization.id}`

    await client.set(
      `org_invite:${hashedToken}`,
      JSON.stringify({
        email,
        organizationId: organization.id,
        invitedBy: userId,
      }),
      { EX: 60 * 60 * 24 }
    )

    await organizationService.sendInvite(
      email,
      inviteLink.toString(),
      organization.organization_name
    )

    return res.status(200).json({ message: 'Invite sent successfully' })
  } catch (err: any) {
    console.log(err)
    next(err)
    return res.status(500).json({ error: err.message })
  }
}

const getMembersInOrganization = async (req: any, res: any, next: any) => {
  const userId = req.id
  const { orgId } = req.params

  if (!orgId || !isUUID(orgId)) {
    return res.status(400).json({ message: 'Invalid organization ID' })
  }

  try {
    const orgMember = await orgUserRepo.find({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      relations: ['user', 'organization'],
    })

    if (!orgMember) {
      return res
        .status(403)
        .json({ message: 'Not a member of this organization' })
    }

    const members = await orgUserRepo.find({
      where: {
        organization: { id: orgId },
      },
      relations: ['user'],
    })

    console.log(members)
    return res.status(200).json(members)
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const acceptOrganizationInvite = async (req: any, res: any, next: any) => {
  const { token, orgId } = req.params
  const userId = req.id

  if (!userId) return res.status(400).json({ message: 'id not found' })

  if (!token || !orgId)
    return res.status(400).json({ message: 'token and org id invalid' })

  try {
    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    })
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
    if (existingMembership)
      return res
        .status(400)
        .json({ message: 'User already a member of the organization' })

    const orgUser = orgUserRepo.create({
      display_name: user.username,
      user: user,
      organization: organization,
      role: 'member',
      invite_status: 'accepted',
    })

    await orgUserRepo.save(orgUser)
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const updateUserRole = async (req: any, res: any, next: any) => {
  const { targetUserId, orgId } = req.params
  const reqUserId = req.id

  if (!targetUserId || !orgId)
    return res.status(400).json({ message: 'Missing required parameters' })
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
    return res.status(500).json({ message: `Server error ${err}` })
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
}
