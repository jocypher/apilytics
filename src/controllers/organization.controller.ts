
// Kwame has created an account and he is now eligible to create an organization
// questions to keep in mind
// what request is the user making, 
// is he already signed in
// what happens after he makes the request
// 1. he should be assigned an admin automatically to that organization
// 2. his invitation status should be accept

import AppDataSource from "../configs/appdatasource.config"
import { User } from "../models/User.entity"


// creating organization

const createOrganization = async(req:any, res:any)=>{
    const userRepo = AppDataSource.getRepository(User)
    // to create an organization , we first need to 
    // get what details will be needed from the creator
    const {org_name} = req.body
    const {id} = req.params.id

    const user = userRepo.findOne({
        where :{
            id: id
        }
    })
    if(!user){
        return res.status(401)
    }
    

}