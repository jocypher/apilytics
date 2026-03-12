import appDataSource from '../configs/app-datasource.config'
import { ApiKey } from '../models/api-key.entity'
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { Organization } from '../models/organization-model.entity'
import { SubComponent } from '../models/organization-service.entity'

const apiKeyRepo = appDataSource.getRepository(ApiKey)

export interface ApiRequest extends Request {
  apiKey: ApiKey
  subComponent: SubComponent
  organization: Organization
  subcomponentName: string
  organizationName: string
}

export const verifyApiKey = async (req: ApiRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization 

  if (!authHeader) return res.status(401).json({ message: 'Missing Api Keys' })

  try {
    const rawKey = authHeader.replace('Bearer ', '').trim()
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex')

    const apiKey = await apiKeyRepo.findOne({
      where: {
        key_hash: hashedKey,
        is_active: true,
      },
      relations: ['subcomponent', 'subcomponent.organization'],
    })

    if (!apiKey) return res.status(401).json({ messag: 'No api key found' })

    if (apiKey.expires_at && apiKey.expires_at < new Date())
      return res.status(401).json({ message: 'Invalid Api Key' })

    req.apiKey = apiKey
    req.subcomponentName = apiKey.subcomponent.name
    req.organizationName = apiKey.subcomponent.organization.organization_name
    req.subComponent = apiKey.subcomponent
    req.organization = apiKey.subcomponent.organization

    next()
  } catch (err) {
    next(err)
  }
}
