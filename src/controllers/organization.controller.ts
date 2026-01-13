
// Kwame has created an account and he is now eligible to create an organization
// questions to keep in mind
// what request is the user making, 
// is he already signed in
// what happens after he makes the request
// 1. he should be assigned an admin automatically to that organization
// 2. his invitation status should be accept

import AppDataSource from "../configs/appdatasource.config"
import { Organization } from "../models/Organization.entity"
import { User } from "../models/User.entity"
import { OrganizationUser } from "../models/OrganizationUser.entity"
import organizationService from "../services/organization.service"
import client from "../configs/redis.configs"
import bcrypt from "bcryptjs"

const userRepo = AppDataSource.getRepository(User)
const orgRepo = AppDataSource.getRepository(Organization)
const orgUserRepo = AppDataSource.getRepository(OrganizationUser)

// creating organization
const createOrganization = async(req:any, res:any)=>{
    
    // to create an organization , we first need to 
    // get what details will be needed from the creator
    const {org_name} = req.body
    const id = req.id
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
        created_by: user
    })

    // save the organization to the db 
    await orgRepo.save(organizationCreated)
    
    let organizationUser = orgUserRepo.create({
        display_name: user.username,
        user: user,
        organization: organizationCreated,
        role: "owner",
        invite_status:"accepted",
        
       
    })
 
    // save the org user in the system
    await orgUserRepo.save(organizationUser)

    let orgResult = {
        "organization_name":org_name,
        "created_by":user.username,
        "org_role":organizationUser.role,
        "created_at":organizationCreated.created_at,
        "invited_by":null,
        "invite_status": organizationUser.invite_status
    }

    return res.status(201).json({message: "organization created", org:orgResult})
    }catch(err){
        return res.status(500).json({message: err})
    }
    


}


// get all organizations created by user 
const getAllOrganization = async(req:any,res:any)=>{
    const id = req.id
    try{
        const user = await userRepo.findOne({
            where:{
                id:id,
                
            }
        })
        if(!user) return res.status(403).json({message:"user not found"})
        const orgs = await orgRepo.find({
    where   :{
        created_by_id: user.id,
        
    },
    relations:["created_by"]
})
    console.log(orgs)
    return res.status(200).json(orgs)
    }catch(
        err:any
    ){
        console.error(err)
        return res.status(500).json({message:err})
    }

}


// DELETE ORGANIZATION 
const deleteOrganization = async(req:any, res:any) =>{
    const id = req.id
    const orgId = req.params.id
    try{
        const orgUser = await orgUserRepo.findOne({
            where:{
                user: {id: id},
                organization:{id: orgId },
                role:"owner"
            },
            relations: ["user", "organization"]
        })
        console.log(orgUser)
    if (!orgUser || !["admin", "owner"].includes(orgUser.role)) {
      return res.status(403).json({
        message: "You are not allowed to delete this organization"
      });
    }

    // delete children FIRST (safe even with cascade)
    await orgUserRepo.delete({
      organization: { id: orgId }
    });

    await orgRepo.delete({ id: orgId });
        

        return res.status(200).json({message: `organization with id ${orgId} deleted successfully`})
        

    }catch(err){
        console.error("The errors involved in the system are", err)
    }

}


// update organization name
const updateOrganization = async(req:any, res:any) =>{
    const orgId = req.params.id
    const {name} = req.body
    const id = req.id

    if(!orgId) return res.status(400).json({message:"Invalid id"})
    if(!name) return res.status(400).json({message:"Bad request"})
    // first we need to verify the user who wants to make the update on the organization
try{
 const org = await orgRepo.findOne({
        where:{
            id:orgId,
            created_by: {id: id}
        },
        relations:["user"]
    })
    if(!org) return res.status(400).json({message:"Organization not found"})

    const orgUser = await orgUserRepo.findOne({
        where:{
            organization: {organization_name : org.organization_name}
        },
        relations:["user", "organization"]
    })

    if(!organizationService.isOrgAdminOrOwner(orgUser)) return res.status(401).json({message:"User not authorized to update organization name"})

    if(name) org.organization_name = name

    return res.status(200).json({message:"update successful"})
}catch(err){
    console.log(err)
    return res.status(500).json({message:`The error is ${err}`})
}
   
}


// get organization by id
const getOrganizationById = async(req:any, res:any)=>{
    const orgId = req.params.id
    const userId = req.id
    // to get organization by id , 
    // check if the org exist and also check the membership of the user 
    if(!orgId) return res.status(404).json({message:`organization with id: ${orgId} not found`})
        try{
            const membership = await orgUserRepo.findOne({
                where:{
                    organization:{id:orgId},
                    user:{id:userId}
                },
                relations:["organization", "user"]
            })

            if(!membership) return res.status(401).json({message:"user is not a member of the the organization"})
            
            const organization = await orgRepo.findOne({
                where:{
                    id: orgId
                }
            })
            if(!organization) return res.status(404).json({message:"Organization doesn't exist"})
            
            return res.status(200).json({organization:organization})
            
        }
        catch(err){
            console.error(`The error involved is ${err}`)
            return res.status(500).json({message:`Server error is ${err}`})
        }
}


// send invitation to user
const sendInvitation = async(req:any, res:any)=>{
    // to invite users , we need the link to the org, 
    // get the user we want to send to then we send right
    //get the email of the user we want to send the invite to .
    // const {email, organizationName} = req.body
    

    // if(!email||!organizationName) return res.status(401).json({message:"email field required "})
    
    // const response = organizationService.sendInvite(
    //     email,
    //     "",
    //     organizationName
    // )

    // return res.status(200).json({message:"Invite sent successfully"})

    const {email} = req.body
    const userId = req.id

    if(!userId) return res.status(401).json({message:"user not found"})
    try{

    const organization = await orgRepo.findOne({
        where:{
            created_by_id: userId
        }
    })
    if(!organization)return res.status(404).json({message:"organization not found"})

     const orgUser = await orgUserRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: organization.id },
      },
      relations: ["user", "org"],
    });
       

        if(!organizationService.isOrgAdminOrOwner(orgUser)) return res.status(400).json({message:"you don't have access to send invitation link"})

    //     // get the user organization
    // const organization = await orgUserRepo.findOne({
    //     where:{
    //         organization:user.organization
    //     }
    // })
 
    
    
    const rawToken =  organizationService.generateInviteToken()
    const hashedToken = await organizationService.hashInviteToken(rawToken)

     // frontend invite link
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${rawToken}&orgId=${organization.id}`;

    // store invite in redis (24 hours)
    await client.set(
      `org_invite:${hashedToken}`,
      JSON.stringify({
        email,
        organizationId: organization.id,
        invitedBy: userId,
      }),
      { EX: 60 * 60 * 24 }
    );

 


       const response = organizationService.sendInvite(
        email,
        inviteLink.toString(),
        organization.organization_name
    )

    return res.status(200).json({message:"Invite sent successfully", data: response})

    
}catch(err:any){
    return res.status(500).json({error:err.message})
}
 

}

const getMembersInOrganization = async(req:any, res:any)=>{
    const userId = req.id
    const orgId = req.params.id

    if (!userId || !orgId) {
    return res.status(401).json({ message: "Unauthorized" });
    }

    try{
        const org_members = orgUserRepo.find({
            where:{
                user:{id:userId},
                organization:{id: orgId}
            },
            relations:["user", "organization"]
        })

    if (!org_members) {
      return res.status(403).json({ message: "Not a member of this organization" });
    }

    const members = await orgUserRepo.find({
        where:{
            organization:{id:orgId}
        },
        relations:["user"]
    })

        console.log (members)
        return res.status(200).json(members)
}catch(err:any){
    return res.status(500).json({message:err.message})
}
}


// accept organization invite
const acceptOrganizationInvite = async(req:any, res:any)=>{
   const {token, orgId} = req.params
   const userId = req.id

   if(!userId) return res.status(400).json({message: "id not found"})

   if(!token || !orgId) return res.status(400).json({message:"token and org id invalid"})

    try{
        const user = await userRepo.findOne({
        where:{
            id:userId
        }
    })
    if(!user) return res.status(404).json({message:"user does not exist"})

    // get token from the redis client
    // compare to see if there's match
    const keys = await client.keys(`org_invite:*`)

    let inviteData:any = null
    for(const key of keys){
        const data = await client.get(key)
        if(data){
            const parsed = JSON.parse(data)
            const match = await bcrypt.compare(token, key.replace("org_invite:", ""));
            if(match && parsed.organizationId == orgId && parsed.email == user.email){
                inviteData = parsed
                break;
            }
        }

    }
    let organization = await orgRepo.findOne({
        where:{
            id:orgId
        }
    })
    if(!organization) return res.status(500).json({message:"no org available"})

    // check the existing membership 
    const existingMembership = await orgUserRepo.findOne({
        where:{
            user :{id: userId},
            organization: {id: orgId}
        },
        relations:["user", "organization"]
    })
    if(existingMembership) return res.status(400).json({message:"User already a member of the organization"})
    // create the user 
    const orgUser = orgUserRepo.create({
        display_name: user.username,
        user: user,
        organization: organization,
        role: "member",
        invite_status:"accepted",
    })

    await orgUserRepo.save(orgUser)

    }catch(err:any){
        return res.status(500).json({message:err.message})
    }
    
} 


const updateUserRole = async(req:any, res:any)=>{
    const {targetUserId, orgId} = req.params
    const reqUserId = req.id

    if(!targetUserId || !orgId) return res.status(400).json({message:"Missing required parameters"})
    try{
        let existingMembership = await orgUserRepo.findOne({
            where:{
                user:{id:targetUserId},
                organization:{id:orgId},

            },
            relations:["organization", "user"]
        })
        if(!existingMembership) return res.status(404).json({message:"user does not exist in the organization"})
        
        if(!organizationService.isOrgAdminOrOwner(reqUserId)){
            return res.status(403).json({message:"Forbidden"})
        }

        existingMembership.role = "admin"

        await orgUserRepo.save(existingMembership)

        return res.status(200).json({message:"updated role successfully"})
        
    }catch(err:any){
        console.error(err)
        return res.status(500).json({message:`Server error ${err}`})
    }

}

export default {createOrganization,sendInvitation,getAllOrganization, deleteOrganization, updateOrganization, getMembersInOrganization, acceptOrganizationInvite, getOrganizationById, updateUserRole}