import 'reflect-metadata'
import { main } from '@/app'

const startApp = async () => {
  try {
    const { app, env } = await main()
    console.log("🚀 ~ env:", env)

    const address = await app.listen({
      port: env.NODE_ENV === 'development' ? env.DEV_PORT : env.API_PORT,
      host: '0.0.0.0',
    })
    
    console.info(`🎉 API is running on port: ${address}`)
    console.info(`📚 Swagger documentation: http://localhost:${env.NODE_ENV === 'development' ? env.DEV_PORT : env.API_PORT}/docs`)
  } catch (error: unknown) {
    console.error('❌ Error on starting application:', error instanceof Error ? error.stack : String(error))
    process.exit(1)
  }
}

startApp()