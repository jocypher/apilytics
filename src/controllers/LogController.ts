import {User} from "../models/user-model.entity"
import AppDataSource from "../configs/app-datasource.config"
import { SubComponent } from "../models/organization-service.entity"
import {Log} from "../models/log-item.entity"
import organizationService from "../services/organization.service"
import { OrganizationUser } from "../models/organization-user.entity"
const userRepo = AppDataSource.getRepository(User)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const orgServiceRepo = AppDataSource.getRepository(SubComponent)
const logRepo = AppDataSource.getRepository(Log)
// in the logs controller, we will display the logs 
// within the service so the question is how should the logs be like 
// I know the frontend is expected to do that but the question is how should it be displayed .
// Now let us think and figure out how it will be 
const createManualLogs = async(req:any,res:any)=>{
const userId = req.id
const {orgId,serviceId} = req.params
const {logMessage, logStatus, logTag} = req.body

if(!logMessage || !logStatus || !logTag){
    return res.status(400).json({message: "Required field parameters"})
}
 try{
   const orgUser = await orgUserRepo.findOne({
    where:{
      id: userId
    }
   })
   if(!orgUser || !organizationService.isOrgAdminOrOwner(orgUser)){
    return res.status(404).json({message:"User Not found"})
   }

   const orgService = await orgServiceRepo.findOne({
    where:{
      id: serviceId,
      organization: {id: orgId}
    }
   })

   if(!orgService) return res.status(401).json({message: "The organization with the service isn't available"})


    const createManualLogs = logRepo.create({
      message: logMessage,
      logLevel: logStatus,
      tags: logTag,
      created_by: orgUser.user,
      sub_component: orgService,

    })

    const logs =  await logRepo.save(createManualLogs)

    return res.status(200).json({message: `Logs created `})
   

 }catch(err:any){
    console.log(err)
    return res.status(500).json({message:`Internal Server error ${err.message}`})
 }
}


const generateManualLogs = async(req:any,res:any)=>{

}