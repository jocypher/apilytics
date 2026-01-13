import AppDataSource from "../configs/appdatasource.config"
import { OrganizationUser } from "../models/OrganizationUser.entity"
import { SubComponent } from "../models/SubComponent.entity"
import { SubComponentUser } from "../models/SubComponentUser.entity"
import organizationService from "../services/organization.service"

const orgUserRepo = AppDataSource.getRepository(OrganizationUser)
const serviceRepo = AppDataSource.getRepository(SubComponent)
const serviceUserRepo = AppDataSource.getRepository(SubComponentUser)

// We need to work on the controller of the sub component
const createService = async(req:any, res:any) =>{
    const userId = req.id
    const orgId = req.params.id
    const {name} = req.body

    if(!orgId) return res.status(404).json({message:"Invalid ID"})
    
    try{
        const membership = await orgUserRepo.findOne({
            where:{
                organization:{id:orgId},
                user:{id:userId},
                
            },
            relations:["organization", "user"]
        })

        if(!!organizationService.isOrgAdminOrOwner(membership)){
            return res.status(401).json({message:"User is unauthorized"})
        }
        const newService = serviceRepo.create({
            name: name,
            created_by: membership?.user,
            organization: membership?.organization

        })
        const savedService = await serviceRepo.save(newService)
        return res.status(201).json({message:savedService})
          
    }catch(err:any){
        console.error(err)
        return res.status(500).json({message:err.message})
    }
}



const assignUserToService = async(req:any, res:any) =>{
    const userId = req.id
    const {orgId, serviceId,roleToChangeId} = req.params
    
    if (!orgId || !serviceId || !roleToChangeId) {
    return res.status(400).json({ message: "Missing required parameters" })
  }
  
    try{
        const requesterMembership = await orgUserRepo.findOne({
            where:{
                organization:{id:orgId},
                user:{id:userId},
                
            },
            relations:["organization", "user"]
        })

        if(!organizationService.isOrgAdminOrOwner(requesterMembership)){
            return res.status(401).json({message:"User is unauthorized"})
        }

        const targetMembership = await orgUserRepo.findOne({
            where:{
                organization:{id:orgId},
                user:{id:roleToChangeId},
                
            },
            relations:["organization", "user"]
        })

        if(!!organizationService.isOrgAdminOrOwner(requesterMembership)){
            return res.status(401).json({message:"User is unauthorized"})
        }

        if(!targetMembership){
            return res.status(401).json({message:"user isnt part of the organization"})
        }

        let service = await serviceRepo.findOne({
            where:{
                id:serviceId
            }
        })
        if(!service) return res.status(404).json({message:"Not found"})

        const existingAssignment = await serviceUserRepo.findOne({
         where: {
        user: { id: targetMembership.user.id },
        sub_component: { id: service.id }
      }
    })

    if (existingAssignment) {
      return res.status(409).json({ message: "User already assigned to service" })
    }

        let serviceUser = serviceUserRepo.create({
            user: targetMembership.user,
            sub_component: service,
            assigned_by: requesterMembership?.user

        })

       let result =  await serviceUserRepo.save(serviceUser)

       return res.status(201).json({message:result})

    }catch(err:any){
        console.error(err)
        return res.status(500).json({message:`Server error ${err}`})
    }
}



export default {createService, assignUserToService}