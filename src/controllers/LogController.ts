import User from "../models/user-model.entity"
const userRepo = AppDataSource.getRepository(User)
const orgServiceRepo = AppDatasource.getRepository(SubComponent)
// in the logs controller, we will display the logs 
// within the service so the question is how should the logs be like 
// I know the frontend is expected to do that but the question is how should it be displayed .
// Now let us think and figure out how it will be 
const createManualLogs = async(req:any,res:any)=>{
const userId = req.id
const {orgId,serviceId} = req.params
const {logMessage, logStatus, logTag} = req.body

if(!logMessage || !logStatus | !logTag){
    return res.status(400).json({message: "Required field parameters"})
}
 try{
   const user = await userRepo.findOne({
    wher:{
      id: userId
    }
   })
   if(!user){
    return res.status(404).json({message:"User Not found"})
   }

   const orgService = orgServiceRepo.findOne({
    where:{
      id: serviceId,
      organization: {id: orgId}
    }
   })
   

 }catch(err:any){
    console.log(err)
    return res.status(500).json({message:`Internal Server error ${err.message}`})
 }
}


const generateManualLogs = async(req:any,res:any)=>{

}