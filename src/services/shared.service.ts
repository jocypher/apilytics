import crypto from "crypto"


const generateApiKey = (options:{username: string, organizationName: string, serviceName: string}) =>{

    const prefix = `${options.username}_${options.organizationName}_${options.serviceName}_`

    const apiKey =  prefix + crypto.randomBytes(32).toString('hex')


    const hashedKey = crypto.createHash("SHA256").update(apiKey).digest("hex")

    return {
        apiKey, hashedKey
    }

}


export default generateApiKey