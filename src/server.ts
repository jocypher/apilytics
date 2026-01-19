import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import AppDataSource from './configs/app-datasource.config'
import auth from './routes/auth/auth.routes'
import client from './configs/redis.configs'
import org from './routes/organization/organization.routes'
import service from './routes/subcomponent/organization-service.routes'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(reqLogger)
AppDataSource.initialize()
  .then(() => {
    console.log('Database has been initialized')
    client.connect()
    app.use('/api/v1/auth', auth)
    app.use('/api/v1/organization', org)
    app.use('/api/v1/service', service)
      app.use(errorLogger)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  
  .catch((err: any) => {
    console.error(err)
  })
