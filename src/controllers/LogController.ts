import { User } from '../models/user-model.entity'
import AppDataSource from '../configs/app-datasource.config'
import { SubComponent } from '../models/organization-service.entity'
import { Log } from '../models/log-item.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import { LogTag } from '../models/log-tag.entity'
import sharedUtils from '../validation/utils/shared.utils'
import { NextFunction, Request, Response } from 'express'

const userRepo = AppDataSource.getRepository(User)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const orgServiceRepo = AppDataSource.getRepository(SubComponent)
const logRepo = AppDataSource.getRepository(Log)
const logTagRepo = AppDataSource.getRepository(LogTag)


const createManualLogs = async (req: Request, res: Response) => {
  const userId = req.id as string
  const orgId = req.params.orgId as string
  const serviceId = Number(req.params.serviceId)
  const { logMessage, logStatus, logTagName } = req.body

  try {
   

    const orgUser = await orgUserRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
      },
      relations: ['user', 'organization'],
    })
    if (!orgUser) {
      return res.status(404).json({ message: 'User Not found' })
    }

    if (!sharedUtils.isOrgAdminOrOwner(orgUser)) {
      return res.status(401).json({ message: 'Forbidden' })
    }

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    })
    if (!user) {
      return res.status(404).json({ message: 'User Not found' })
    }

    const orgService = await orgServiceRepo.findOne({
      where: {
        id: serviceId,
        organization: { id: orgId },
      },
      relations: ['organization'],
    })

    if (!orgService)
      return res
        .status(401)
        .json({ message: "The organization with the service isn't available" })

    let tag = await logTagRepo.findOne({
           where: {
             tag_name: logTagName,
             organization_id: orgId,
           },
         })

         if (!tag) {
           tag = logTagRepo.create({
             tag_name: logTagName,
             description: '',
             organization_id: orgId,
           })
           await logTagRepo.save(tag)
         }

    const createManualLogs = logRepo.create({
      message: logMessage,
      logLevel: logStatus,
      tags: [tag],
      created_by: orgUser.user,
      sub_component: orgService,
    })

    await logRepo.save(createManualLogs)

    return res.status(200).json({ message: `Logs created ` })
  } catch (err: unknown) {
    console.log(err)
  }
}

const getAllManualLogs = async (req: Request, res: Response, next:NextFunction) => {

  const userId = req.id as string
  const orgId = req.params.orgId as string
  const serviceId = Number(req.params.serviceId)

  try {
    const orgUser = await orgUserRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      relations: ['user', 'organization'],
    })

    if (!orgUser)
      return res
        .status(404)
        .json({ message: `Not a member of the organization` })

    const assignedUser = await orgServiceRepo.findOne({
      where: {
        id: serviceId,
        users: { user: orgUser.user },
      },
      relations: ['user'],
    })
    if (!assignedUser)
      return res
        .status(401)
        .json({ message: 'User not assigned to this service' })

    const logs = await logRepo.find({
      where: {
        sub_component: { id: serviceId },
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

export default { createManualLogs, getAllManualLogs, }
