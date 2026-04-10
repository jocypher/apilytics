import sharedUtils from '../validation/utils/shared.utils'
import appService from '../services/app.service'
import { NextFunction, Request,Response} from 'express'




const createApp = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId  = sharedUtils.validatedParam(req.params.orgId)
  const {name} = req.body

  try {
   const result = await appService.createApp(userId, orgId, name)
    return res.status(201).json({ message: result})
  } catch (err: unknown) {
    next(err)
  }
}

const assignUserToApp = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const appId = sharedUtils.validatedParam(req.params.appId)
  const targetId = sharedUtils.validatedParam(req.params.targetUserId)

  try {
  const result = await appService.assignUserToApp(userId, orgId, appId, targetId)

    return res.status(201).json({ message: result })
  } catch (err: any) {
    next(err)
  }
}


const deleteApp = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).id
  const orgId = sharedUtils.validatedParam(req.params.orgId)
  const appId = sharedUtils.validatedParam(req.params.appId)
  try {
    await appService.deleteApp(userId, orgId, appId)

    return res.status(200).json({ message: 'Service deleted successfully' })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

const getAppById = async (req: Request, res: Response, next: NextFunction) => {
  const requesterId = (req as any).id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const appId = sharedUtils.validatedParam(req.params.appId)
  try {
    const foundService = await appService.getAppById(requesterId,orgId,appId)
    return res.status(200).json({ message: foundService })
  } catch (err: any) {
    console.error(err)
    next(err)
    return res.status(500).json({ message: err.message })
  }
}

const getAssignedUsersForApp = async (req: any, res: any, next: any) => {
  const userId = (req as any).id
    const orgId = sharedUtils.validatedParam(req.params.orgId)
    const appId = sharedUtils.validatedParam(req.params.appId)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    const result = await appService.getAssignedUsersForApp(userId,orgId, appId, page,limit,skip)
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
      const appId = sharedUtils.validatedParam(req.params.appId)

  try {
    const apiKey = await appService.generateApiKey(userId,orgId, appId)
    return res.status(200).json({ message: apiKey })
  } catch (err) {
    next(err)
  }
}



export default {
  createApp,
  assignUserToApp,
  deleteApp,
  getAppById,
  getAssignedUsersForApp,
  
  generateApiKey,
}
