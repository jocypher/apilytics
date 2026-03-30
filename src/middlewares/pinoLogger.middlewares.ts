import pino from "pino"

const isDev = process.env.NODE_ENV !== 'production'


const baseLogger = pino({
    name: "apilytics",
    level: process.env.LOG_LEVEL || "info",
    ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),

})


export default baseLogger