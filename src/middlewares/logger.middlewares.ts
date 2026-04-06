// when we create a logger we first need to ensure
import { format } from "date-fns"
import  fsPromises from "fs/promises"
import path from "path"
import {v4 as uuidv4} from "uuid"
import fs from "fs"
const logger = async(message:string,logName:string)=>{
     const date = format(new Date(),"yyyyMMdd\tHH:mm:ss")
     const logger = `${date}\t${uuidv4()}\t${message}\n`
     try{
          if(!fs.existsSync(path.join(__dirname,"..","logs" ))){
               await fsPromises.mkdir(path.join(__dirname,"..","logs"))
          }
          await fsPromises.writeFile(path.join(__dirname,"..","logs",logName),logger,{
            flag:"a"   
          })
     }catch(err: unknown){
     throw new Error(`The error is ${err}`, {cause: err})
     }
}


export default logger