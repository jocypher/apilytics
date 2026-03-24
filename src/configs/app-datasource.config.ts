import { DataSource } from 'typeorm'
import { User } from '../models/user-model.entity'
import { Log } from '../models/log-item.entity'
import { LogTag } from '../models/log-tag.entity'
import { Organization } from '../models/organization-model.entity'
import { OrganizationUser } from '../models/organization-user.entity'
import { ApiKey } from '../models/api-key.entity'
import { SubComponent } from '../models/organization-service.entity'
import { SubComponentUser } from '../models/org-service-user.entity'

const isProduction = process.env.NODE_ENV == 'production'

const appDataSource = new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.HOST,
  port: Number(process.env.DB_PORT)||5432,
  database: process.env.DB_NAME,
  synchronize: false,
  extra: {
    max: 5,
    connectionTimeoutMillis: 10000,
  },
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
  migrations: ['src/migrations/*.{js,ts}'],
  logging: false,
  entities: [
    User,
    Log,
    LogTag,
    Organization,
    OrganizationUser,
    ApiKey,
    SubComponent,
    SubComponentUser,
  ],
})

export default appDataSource
