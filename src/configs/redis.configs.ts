import { createClient } from 'redis'

const client = createClient({
  socket: {
    host: 'localhost', // for docker use host: redis
    port: 6379
  },
})

client.on('error', (err) => console.log('Redis Client Error', err))

export default client
