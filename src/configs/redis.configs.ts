import { createClient } from 'redis'

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT) || 6739
  },
})

client.on('error', (err) => console.log('Redis Client Error', err))

export default client
