import sharedUtils from '../validation/utils/shared.utils'
import organizationServiceService from '../services/organization-service.service'
import { NextFunction, Request,Response} from 'express'



const createService = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId  = sharedUtils.validatedParam(req.params.orgId)
  const {name} = req.body

  try {
   const result = await organizationServiceService.createService(userId, orgId, name)
    return res.status(201).json({ message: result})
  } catch (err: unknown) {
    next(err)
  }
}

const assignUserToService = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const serviceId = Number(req.params.serviceId)
  const  roleToChangeId = sharedUtils.validatedParam(req.params.roleToChangeId)

  try {
  const result = await organizationServiceService.assignUserToService(userId, orgId, serviceId, roleToChangeId)

    return res.status(201).json({ message: result })
  } catch (err: any) {
    next(err)
  }
}


const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const  serviceId  =Number(req.params.svcId)
  try {
    await organizationServiceService.deleteService(userId, orgId, serviceId)

    return res.status(200).json({ message: 'Service deleted successfully' })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  const requesterId = (req as any).id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const serviceId = Number(req.params.svcId)
  try {
    const foundService = await organizationServiceService.getServiceById(requesterId,orgId,serviceId)
    return res.status(200).json({ message: foundService })
  } catch (err: any) {
    console.error(err)
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const getAssignedUserForService = async (req: any, res: any, next: any) => {
  const userId = (req as any).id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const serviceId = Number(req.params.svcId)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    const result = await organizationServiceService.getAssignedUserForService(userId,orgId, serviceId, page,limit,skip)
    return res.status(200).json(
      result
    )
  } catch (err) {
    console.log(err)
    next(err)
    return res.status(500).json({ message: 'Server error' })
  }
}


const generateApiKey = async (req: any, res: any, next: any) => {
  const userId = (req as any).id
      const orgId = sharedUtils.validatedParam(req.params.orgId)
      const serviceId = Number(req.params.svcId)

  try {
    const apiKey = await organizationServiceService.generateApiKey(userId,orgId, serviceId)
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
