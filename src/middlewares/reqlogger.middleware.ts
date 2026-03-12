import { Request, Response, NextFunction } from "express"
import logger from "./logger.middlewares"

const reqLogger = (req:Request,res:Response,next:NextFunction)=>{
    logger(`${req.method}\t${req.headers.origin}\t${req.url}`,"reqlog.txt")
    console.log(`${req.method}, ${req.path}`)
    next()
}


export default reqLogger