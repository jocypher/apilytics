import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
dotenv.config({path:'.env'})
const isProduction = process.env.NODE_ENV == 'production'

const appDataSource = new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  synchronize: true,
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
  logging: ['query', 'error', 'info'],
  maxQueryExecutionTime: 100,
  entities: ['src/models/**/*.{js,ts}'],
})

export default appDataSource
