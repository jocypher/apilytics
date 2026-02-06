import crypto from 'crypto'
import { OrganizationUser } from '../models/organization-user.entity'

const generateApiKey = (options: {
  organizationName: string
  serviceName: string
}) => {
  const prefix = `${sensitiveName(options.organizationName)}_${sensitiveName(options.serviceName)}_`
  const apiKey = prefix + crypto.randomBytes(32).toString('hex')
  return apiKey
}

const isOrgAdminOrOwner = (membership: OrganizationUser | null): boolean => {
  return !!membership && ['owner', 'admin'].includes(membership.role)
}

const hashApiKey = async (key: string) => {
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
  return hashedKey
}

const sensitiveName = (s: string) => s.replace(/\s+/g, '-').toLowerCase()

export default { generateApiKey, isOrgAdminOrOwner, hashApiKey }
