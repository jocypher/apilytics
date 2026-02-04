import crypto from "crypto"
import { OrganizationUser } from "../models/organization-user.entity"


const generateApiKey = (options:{organizationName: string, serviceName: string}) =>{

    const prefix = `${options.organizationName}_${options.serviceName}_`
    const apiKey =  prefix + crypto.randomBytes(32).toString('hex')
    return apiKey

}

const isOrgAdminOrOwner = (membership: OrganizationUser | null): boolean => {
  return !!membership && ['owner', 'admin'].includes(membership.role)
}

const hashApiKey = async(key: string)=>{
      const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
    return hashedKey
}


export default {generateApiKey, isOrgAdminOrOwner, hashApiKey}