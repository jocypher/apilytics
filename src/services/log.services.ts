import { In } from 'typeorm'
import appDataSource from '../configs/appDatasource.config'
import { AppUser } from '../models/AppUser.entity'
import { Log } from '../models/Log.entity'
import { LogTag } from '../models/LogTag.entity'
import { ForbiddenError } from '../validation/utils/errors/errors'
import { LogLevel } from '../enums/logLevel.enum'

const logRepo = appDataSource.getRepository(Log)
const logTagRepo = appDataSource.getRepository(LogTag)
const appUserRepo = appDataSource.getRepository(AppUser)

const createManualLogs = async (
  userId: string,
  appId: string,
  message: string,
  loglevel: string,
  tags: string[]
) => {
  // check if user is in the app

  const appAndUserExist = await appUserRepo.findOne({
    where: {
      app: { appId: appId },
      assignedTo: {
        userId: userId,
      },
    },
    relations: {
      assignedTo: true,
    },
    select: {
      assignedTo: true,
      app: true,
    },
  })

  if (!appAndUserExist) {
    throw new ForbiddenError()
  }
  const existingTags = await logTagRepo.find({
    where: {
      tagName: In(tags),
    },
  })
  const existingTagName = existingTags.map((name) => name.tagName)
  const newTagNames = tags.filter((tag) => !existingTagName.includes(tag))

  const newTags =
    newTagNames.length > 0
      ? await logTagRepo.save(
          newTagNames.map((name) => logTagRepo.create({ tagName: name }))
        )
      : []

  const allTags = [...existingTags, ...newTags]

  const createLog = logRepo.create({
    logMessage: message,
    createdBy: appAndUserExist.assignedTo,
    apps: appAndUserExist.app,
    tags: allTags,
    logLevel: loglevel as LogLevel,
    isManual:true
  })

  return createLog
}



export default {createManualLogs}