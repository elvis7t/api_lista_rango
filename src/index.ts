import 'reflect-metadata'
import { main } from '@/app'

const { app, env } = main()
console.log("🚀 ~ env:", env)

app
  .listen({
    port: env.NODE_ENV === 'development' ? env.DEV_PORT : env.API_PORT,
    host: '0.0.0.0',
  })
  .then((address) => {
    console.info(`🎉 API is running on port: ${address}`)
  })
  .catch((error) => {
    console.error('❌ Error on starting application:', error.stack)
    process.exit(1)
  })