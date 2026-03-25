import pino from "pino"




const baseLogger = pino({
    name: "apilytics",
    level: process.env.LOG_LEVEL || "info",
    transport: {
        target: "pino-pretty"},

})


export default baseLogger