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

// This controller will handle both the manual logs and the automated logs

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
      organization: {id: orgId},
      user: {id: userId},
      
    },
     relations: ["user", "organization"]
   })
   if(!orgUser){
    return res.status(404).json({message:"User Not found"})
   }

    if(!organizationService.isOrgAdminOrOwner(orgUser)){
      return res.status(401).json({message:"Forbidden"})
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


// get all manual logs

const getAllManualLogs = async(req:any,res:any)=>{
  const userId = req.id
  const {orgId, serviceId} = req.params

  try{
    const orgUser = await orgUserRepo.findOne({
      where:{
        user: {id: userId},
        organization:{id: orgId}
      },
      relations: ["user", "organization"]
    })

    if(!orgUser) return res.status(404).json({message: `Not a member of the organization`})
    
      // check the assigned User
      const assignedUser = await orgServiceRepo.findOne({
        where:{
          id: serviceId,
          users:{user: orgUser.user}, 
          
        },
        relations: ["user"]
      })
      if(!assignedUser) return res.status(401).json({message: "User not assigned to this service"})
      
      let logs = await logRepo.find({
        where:{
          sub_component: {id: serviceId}
        }
      })

      if(logs.length == 0 ){
        return res.status(200).json({message: "No manual logs created"})
      }

      return res.status(200).json({message: logs})
      

  }catch(err:any){
      console.log(err)
      return res.status(500).json({message: err.message})
  }
}

// pagination, skip, limit

const getAutomatedLogs = async(req:any, res:any)=>{

}

export default {createManualLogs, getAllManualLogs, getAutomatedLogs}

