import AppDataSource from '../configs/app-datasource.config'
import { OrganizationUser } from '../models/organization-user.entity'
import { SubComponent } from '../models/organization-service.entity'
import { SubComponentUser } from '../models/org-service-user.entity'
import sharedUtils from '../validation/utils/shared.utils'
import { User } from '../models/user-model.entity'
import { ApiKey } from '../models/api-key.entity'
import organizationServiceService from '../services/organization-service.service'
import { Request} from 'express'

const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const serviceRepo = AppDataSource.getRepository(SubComponent)
const serviceUserRepo = AppDataSource.getRepository(SubComponentUser)
const userRepo = AppDataSource.getRepository(User)
const apiKeyRepo = AppDataSource.getRepository(ApiKey)

const createService = async (req: Request, res: any, next: any) => {
  const userId = req.id
  const orgId  = sharedUtils.validatedParam(req.params.orgId)
  const {name} = req.body

  try {
   const result = await organizationServiceService.createService(userId, orgId, name)
    return res.status(201).json({ message: result})
  } catch (err: unknown) {
    next(err)
  }
}

const assignUserToService = async (req: any, res: any, next: any) => {
  const userId = req.id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const serviceId = Number(req.params.serviceId)
  const  roleToChangeId =sharedUtils.validatedParam(req.params.roleToChangeId)

  try {
  const result = await organizationServiceService.assignUserToService(userId, orgId, serviceId, roleToChangeId)

    return res.status(201).json({ message: result })
  } catch (err: any) {
    next(err)
  }
}


const deleteService = async (req: any, res: any, next: any) => {
  const userId = req.id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const  serviceId  =Number(req.params.svcId)
  try {
    const orgMember = await orgUserRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      relations: ['user', 'organization'],
    })
    if (!orgMember) {
      return res.status(403).json({ message: 'Not a member' })
    }
    if (!sharedUtils.isOrgAdminOrOwner(orgMember))
      return res.status(401).json({ message: 'Unauthorized' })

    const foundService = await serviceRepo.findOne({
      where: { id: serviceId, organization: { id: orgId } },
      relations: ['organization'],
    })

    if (!foundService)
      return res.status(404).json({ message: 'Service not found' })

    await serviceUserRepo.delete({
      sub_component: { id: serviceId },
    })

    await serviceRepo.delete({ id: serviceId })

    return res.status(200).json({ message: 'Service deleted successfully' })
  } catch (err) {
    console.error(err)
    next(err)
    return res.status(500).json({ message: `Server error: ${err}` })
  }
}

const getServiceById = async (req: any, res: any, next: any) => {
  const requesterId = req.id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const serviceId = Number(req.params.svcId)
  try {
    const membership = await orgUserRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: requesterId },
      },
      relations: ['organization', 'user'],
    })

    if (!membership)
      return res.status(404).json({ message: 'user not a member' })
    const foundService = await serviceRepo.findOne({
      where: {
        id: serviceId,
        organization: { id: orgId },
      },
      relations: ['organization'],
    })
    if (!foundService) {
      return res
        .status(404)
        .json({ message: 'service not found not available' })
    }

    return res.status(200).json({ message: foundService })
  } catch (err: any) {
    console.error(err)
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const getAssignedUserForService = async (req: any, res: any, next: any) => {
  const userId = req.id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const serviceId = Number(req.params.svcId)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    const orgMember = await orgUserRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
      },
      relations: ['organization', 'user'],
    })
    if (!orgMember) {
      return res.status(403).json({ message: 'Not a member' })
    }

    const foundService = await serviceRepo.findOne({
      where: {
        id: serviceId,
        organization: { id: orgId },
      },
      relations: ['organization'],
    })

    if (!foundService) {
      return res.status(404).json({ message: 'Service not found' })
    }
    if (!sharedUtils.isOrgAdminOrOwner(orgMember)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const [assignments, total] = await serviceUserRepo.findAndCount({
      where: {
        sub_component: { id: serviceId },
      },
      relations: ['user'],
      skip,
      take: limit,
    })
    if (assignments.length === 0){
      return res.status(404).json({ message: 'No assigned users' })
    }
      
    const users = assignments.map((a: SubComponentUser) => a.user)
    return res.status(200).json({
      page,
      limit,
      total,
      users,
    })
  } catch (err) {
    console.log(err)
    next(err)
    return res.status(500).json({ message: 'Server error' })
  }
}


const generateApiKey = async (req: any, res: any, next: any) => {
  const userId = req.id
      const orgId = sharedUtils.validatedParam(req.params.orgId)
      const serviceId = Number(req.params.svcId)

  try {
    const foundUser = await userRepo.findOne({
      where: {
        id: userId,
      },
    })
    if (!foundUser) return res.status(404).json({ message: 'user not found' })
    const orgUser = await orgUserRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
      },
      relations: ['user', 'organization'],
    })
    if (!orgUser)
      return res.status(404).json({ message: 'User with org not found' })
    const service = await serviceRepo.findOne({
      where: {
        id: serviceId,
      },
    })
    if (!service) return res.status(404).json({ message: 'service not found' })
    if (!sharedUtils.isOrgAdminOrOwner(orgUser))
      return res.status(401).json({ message: 'Unauthorized' })
    const option = {
      username: foundUser.username,
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

    await apiKeyRepo.save(createApiKey)
    return res.status(200).json({ message: apiKey })
  } catch (err) {
    next(err)
  }
}

export default {
  createService,
  assignUserToService,
  deleteService,
  getServiceById,
  getAssignedUserForService,
  generateApiKey,
}
