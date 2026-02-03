import crypto from "crypto"
import { OrganizationUser } from "../models/organization-user.entity"
import bcrypt from "bcryptjs"

const generateApiKey = (options:{username: string, organizationName: string, serviceName: string}) =>{

    const prefix = `${options.username}_${options.organizationName}_${options.serviceName}_`
    const apiKey =  prefix + crypto.randomBytes(32).toString('hex')
    return apiKey

}

const isOrgAdminOrOwner = (membership: OrganizationUser | null): boolean => {
  return !!membership && ['owner', 'admin'].includes(membership.role)
}

const hashApiKey = async(key: string)=>{
      const hashedKey = crypto.createHash('SHA256').update(key).digest('hex')
    return hashedKey
}


export default {generateApiKey, isOrgAdminOrOwner, hashApiKey}