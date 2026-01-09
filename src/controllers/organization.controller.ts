
// Kwame has created an account and he is now eligible to create an organization
// questions to keep in mind
// what request is the user making, 
// is he already signed in
// what happens after he makes the request
// 1. he should be assigned an admin automatically to that organization
// 2. his invitation status should be accept

import { Or } from "typeorm"
import AppDataSource from "../configs/appdatasource.config"
import { Organization } from "../models/Organization.entity"
import { User } from "../models/User.entity"
import { OrganizationUser } from "../models/OrganizationUser.entity"

const userRepo = AppDataSource.getRepository(User)
const orgRepo = AppDataSource.getRepository(Organization)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)

// creating organization

const createOrganization = async(req:any, res:any)=>{
    
    // to create an organization , we first need to 
    // get what details will be needed from the creator
    const {org_name} = req.body
    const {id} = req.params
    try{
        const user = await userRepo.findOne({
        where :{
            id: id
        }
    })
    if(!user){
        return res.status(401).json({message: "user not found"})
    }
    // let the admin creat the organization
    let organizationCreated = orgRepo.create({
        organization_name: org_name,
        created_by_id: user.id,
    })

    // save the organization to the db 
    await orgRepo.save(organizationCreated)
    
    let organizationUser = orgUserRepo.create({
        display_name: user.username,
        organization: organizationCreated,
        role: "owner",
        invite_status:"accepted",
       
    })
 

    await orgUserRepo.save(organizationUser)

    let orgResult = {
        "organization_name":org_name,
        "created_by":user.username,
        "org_role":organizationUser.role,
        "created_at":organizationCreated.created_at,
        "invited_by":null
    }

    return res.status(201).json({message: "organization created", org:orgResult})
    }catch(err){
        return res.status(500).json({message: err})
    }
    


}