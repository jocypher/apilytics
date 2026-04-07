import appDataSource from '../configs/appDatasource.config'
import { ApiKey } from '../models/ApiKey.entity'
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { Organization } from '../models/Organization.entity'
import { App } from '../models/App.entity'

const apiKeyRepo = appDataSource.getRepository(ApiKey)

export interface ApiRequest extends Request {
  apiKey: ApiKey
  apps: App
  organization: Organization
  appName: string
  organizationName: string
}

export const verifyApiKey = async (
  req: ApiRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Api Keys' })
  }

  try {
    const rawKey = authHeader.replace('Bearer ', '').trim()
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex')

    const apiKey = await apiKeyRepo.findOne({
      where: {
        keyHash: hashedKey,
        isActive: true,
      },
      relations: ['apps', 'apps.organization'],
    })

    if (!apiKey) {
      return res.status(401).json({ messag: 'No api key found' })
    }

    if (apiKey.expiresDate && apiKey.expiresDate < new Date()) {
      return res.status(401).json({ message: 'Invalid Api Key' })
    }

    req.apiKey = apiKey
    req.appName = apiKey.apps.name
    req.organizationName = apiKey.apps.organization.organizationName
    req.apps = apiKey.apps
    req.organization = apiKey.apps.organization

    next()
  } catch (err) {
    next(err)
  }
}
