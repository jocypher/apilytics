import logger from "./logger.middlewares"

const errorLogger = (err:any,req:any,res:any, next:any)=>{
    logger(`${err.name}\t${err.message}`,"errorLog.txt")
    return res.status(500).json({message:err.message||"Internal Server Error"})
}
export default errorLogger