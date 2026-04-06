import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import AppDataSource from './configs/app-datasource.config'
import auth from './routes/auth.routes'
import client from './configs/redis.configs'
import org from './routes/organization.routes'
import service from './routes/organization-service.routes'
import logs from './routes/logs.routes'
import reqLogger from './middlewares/reqlogger.middleware'
import errorLogger from './middlewares/errorlog.middleware'
import errorHandler from './middlewares/errorhandler.middlewares'
import helmet from 'helmet'
import cors from 'cors'
import passport from './configs/passport'
import session from 'express-session'
import {requestLogger} from './middlewares/requestLogger.middlewares'
const app = express()

const PORT = process.env.SERVER_PORT
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(cors())
app.use(requestLogger)
app.use(reqLogger)
app.use(session({
  secret:'secretKey',
  resave:false,
  saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())


AppDataSource.initialize()
  .then(() => {
    console.log('Database has been initialized')
    client.connect()
    app.get("/api/v1/", (req:any, res:any)=>{
      res.send("<h2>Hello world</h2>")
    })
    app.use('/api/v1/auth', auth)
    app.use('/api/v1/organization', org)
    app.use('/api/v1/service', service)
    app.use('/api/v1/logs', logs)

    app.use(errorLogger)
    app.use(errorHandler)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })

  .catch((err: any) => {
    console.error(err)
  })
