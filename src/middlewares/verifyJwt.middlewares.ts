import jwt from "jsonwebtoken"

const verifyJwt = (req:any, res:any, next:any)=>{
    let authHeader = req.headers.authorization || req.headers['Authorizationn']
    if(!authHeader || !authHeader?.startsWith("Bearer ")) return res.status(400).json({message:"User is unauthorized"})

   const token = authHeader.split(' ')[1]

   const secret_key = process.env.JWT_SECRET_KEY
   if(!secret_key) {
    throw new Error("Secret key is not defined in the environment variable")
   }
   jwt.verify(
    token,
    secret_key,
    (err:Error|null, decode:any)=>{
        if(err) return res.status(403).json({message:"Forbidden"})
        req.id = decode.id
        req.email = decode.email
        next()       
    }
   )

}

export default {verifyJwt}