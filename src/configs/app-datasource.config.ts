import { DataSource } from 'typeorm'

const isProduction = process.env.NODE_ENV == 'production'

const appDataSource = new DataSource({
  type: 'postgres',
  // url: process.env.DB_URL,
  username: 'jonathan',
  password: process.env.PASSWORD,
  host: 'localhost',
  port: 5050,
  database: 'web_api_db',
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
  logging: false,
  entities: [__dirname + '/../models/**/*.entity.{js,ts}'],
})

export default appDataSource
