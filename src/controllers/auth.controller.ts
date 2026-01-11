// Writing the authentication methods 
import bcrypt from "bcryptjs";
import AppDataSource from "../configs/appdatasource.config";
import { User } from "../models/User.entity";
import authService from "../services/auth.service"
import client from "../configs/redis.configs";



let userRepo = AppDataSource.getRepository(User)

const handleSignup = async(req:any, res:any)=>{
    const {username ,email, password} = req.body

    if(!username || !email || !password){
       return  res.status(400).json({message:"required"})
    }

    const hashedPassword = await bcrypt.hash(password, 10)
  
    let user =   userRepo.create({
        username: username,
        email: email,
        password_hash: hashedPassword
    })

    await userRepo.save(user)
    return res.status(201).json({message: "user account created", username: email})
    
}


const handleSignin = async(req:any, res:any)=>{
    let {email, password} = req.body

    if(!email || !password) {
        return res.status(400).json({message: "required"})
    }

    try{
        let user = await userRepo.findOne({
        where:{
            email:email
        }
    })
    if(!user) return res.status(404).json({message: "user not found"})

    let isPasswordAccurate: boolean = await bcrypt.compare(password, user.password_hash)
    console.log(isPasswordAccurate)
    if(!isPasswordAccurate) {
        return res.status(401).send("password is inaccurate")
    }
    
    return res.status(200).json({message: "Logged in successfully", email: user.email})

    }catch(err){
        res.send(err)
    }

    

}

// implementing forgot password 
// with this in place we are going to also implement a rate limit operations
// the purpose of the rate limit is to prevent too much request from brute force 
// Also bots can be used to test the system so its best not to do that 

const forgotPassword = async(req:any, res:any) =>{
    const {email} = req.body
    if(!email) return res.status(400).json({message: "email required"})
    try{
        const rateLimitKey = `rate:forgot:${email}`
        let attempts = await client.get(rateLimitKey)
        
       if (attempts && isNaN(Number(attempts))) {
      await client.del(rateLimitKey)
         attempts = null
    }

    if (attempts && Number(attempts) >= 3) {
      return res.status(429).json({
        message: "Too many requests",
        retryAfter: "1 hour",
      })
    }

        
let user = await userRepo.findOne({
where:{
    email:email
}})
    if(!user) return res.status(404).json({message: "user not found"})

    // get the generated otp
    const otp = authService.generateOTPCode()
    console.log(`The otp is called ${otp}`)
    // hash the generated otp
    const hashedOtp = await authService.storeHashedOtpCode(otp)
    console.log(`The otp is called ${hashedOtp}`)

    await client.set(`otp:${email}`, hashedOtp ,{
        EX: 120
    })

    if(attempts){
        console.log(`the current attempts are ${attempts}`)
        await client.incr(rateLimitKey)
    }else{
        await client.set(rateLimitKey, "1",{
            EX: 3600
        })
    }
    // send email for the otp generated
    await authService.sendEmail(email, otp,user.username)

    return res.status(200).json({message: "OTP code successfully sent", expiresIn:"expires in 2 minutes"})
}catch(err:any){
    return res.status(500).json({message:err.message})
}
    
    
}

const verifyOtp = async(req:any, res:any)=>{
    const {otp,email} = req.body
    if(!email||!otp) return res.status(400)
    try{

    //retreive the hashedotp code
    const storeHashedOtpCode = await client.get(`otp:${email}`)

    if(!storeHashedOtpCode) return res.status(400).send("OTP expired or not found")

    const isValid:boolean = await bcrypt.compare(otp,storeHashedOtpCode)

    if(!isValid) return res.status(401).send("Invalid otp")
    
// To ensure theres is security and stability we delete the stored values after use from the cache system
    await client.del(`otp:${email}`)

    await client.set(`reset:password:${email}`, "yes", {
        EX:300
    })
    return res.status(200).json({message:"otp verified"})
    }catch(err){
        return res.status(500).json({message:err})
    }
   

}





const resetPassword = async(req:any, res:any)=>{
    const {email, newPassword} = req.body

    if(!email ||!newPassword) return res.status(400).json({message:"required fields"})

        try{

              const storedResetPassToken = await client.get(`reset:password:${email}`)

    if(!storedResetPassToken) return res.status(400).json({message:"Reset tokenn expired"})

    const user = await userRepo.findOne({
        where:{
            email: email
        }  
    })


    if(!user) return res.status(400).json({message:`user with email: ${email} not found`})

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password_hash = hashedPassword
    await userRepo.save(user)
    await client.del(`reset:password:${email}`)

    return res.status(200).json({
        message: "reset password successful"
    })

        }catch(err){
            return res.status(500).json({message:err})
        }

  
    
    

}




export default  {handleSignup, handleSignin, forgotPassword, resetPassword, verifyOtp}