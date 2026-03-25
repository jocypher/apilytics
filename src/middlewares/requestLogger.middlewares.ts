import { NextFunction } from "express";
import { Request, Response } from "express";
import baseLogger from "./pinoLogger.middlewares";

export const requestLogger = (req:Request, res:Response, next:NextFunction)=>{
    const start = Date.now()

    res.on('finish', ()=>{
        baseLogger.info({
            method: req.method,
            url: req.url,
            status:res.status,
            duration: Date.now() - start 
        }, 'Request completed')
    }),

    next()
}