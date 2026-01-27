const errorHandler = (err:any, req:any, res:any, next:any)=>{

console.error(err.stack)

return res.status(500).json({message: "Internal Server Error"})



}



export default errorHandler 