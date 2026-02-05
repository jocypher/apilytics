import { validationResult, FieldValidationError} from "express-validator"

export const validate = (req:any, res:any, next:any)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        const formattedErrors:any = {}
        
        errors.array().forEach(error=>{
            if(error.type === "field"){

            if(!formattedErrors[error.path]){
                formattedErrors[error.path] = []
            }
            formattedErrors[error.path].push(error.msg)}

        })
        return res.status(400).json({
            success:false,
            message:"Validatio failed",
            errors: formattedErrors
        })
    }
    next()
}