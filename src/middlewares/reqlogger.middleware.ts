import logger from "./logger.middlewares"

const reqLogger = (req:any,res:any,next:any)=>{
    logger(`${req.method}\t${req.headers.origin}\t${req.url}`,"reqlog.txt")
    console.log(`${req.method}, ${req.path}`)
    next()
}


export default reqLogger