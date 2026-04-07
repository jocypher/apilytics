import AppDataSource from '../configs/appDatasource.config'
import { App } from '../models/App.entity'
import { Log } from '../models/Log.entity'
import { Membership } from '../models/Membership.entity'
import { NextFunction, Request, Response } from 'express'

const membershipRepo = AppDataSource.getRepository(Membership)
const appRepo = AppDataSource.getRepository(App)
const logRepo = AppDataSource.getRepository(Log)

// const createManualLogs = async (req: Request, res: Response) => {
//   const userId = req.id as string
//   const orgId = req.params.orgId as string
//   const serviceId = Number(req.params.serviceId)
//   const { logMessage, logStatus, logTagName } = req.body

//   try {

//     return res.status(200).json({ message: `Logs created ` })
//   } catch (err: unknown) {
//     console.log(err)
//   }
// }

const getAllManualLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).id
  const orgId = req.params.orgId as string
  const appId = req.params.appId as string

  try {
    const member = await membershipRepo.findOne({
      where: {
        user: { userId: userId },
        organization: { organizationId: orgId },
      },
      relations: ['user', 'organization'],
    })

    if (!member)
      return res
        .status(404)
        .json({ message: `Not a member of the organization` })

    const assignedUser = await appRepo.findOne({
      where: {
        appId: appId,
        users: {appUserId:member.user.userId}
      },
      relations: ['user'],
    })
    if (!assignedUser)
      return res
        .status(401)
        .json({ message: 'User not assigned to this service' })

    const logs = await logRepo.find({
      where: {
        apps: { appId: appId },
      },
    })

    if (logs.length == 0) {
      return res.status(200).json({ message: 'No manual logs created' })
    }

    return res.status(200).json({ message: logs })
  } catch (err: unknown) {
    next(err)
  }
}

// const ingestLogs = async (req: Request, res: Response, next: NextFunction) => {
//   const { message, level } = req.body

//   try{
//        logRepo.save({
//          message,
//          level,
//          api_key: req.apiKey,
//          sub_component: req.subComponent,
//          created_by_user: req.apiKey.created_by_user,
//        })

//        req.apiKey.last_used_at = new Date()
//        await apiKeyRepo.save(req.apiKey)
//        return res.status(201).json({ message: 'Logs ingested' })
//   }catch(err:unknown){
//     next(err)
//   }

// }

export default { getAllManualLogs }
