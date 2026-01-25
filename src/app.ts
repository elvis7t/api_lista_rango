import 'reflect-metadata'
import { container } from 'tsyringe'
import './container'
import { EnvConfig, FastifyConfig, SwaggerConfig } from '@/configs'
import { Router } from '@/infrastructure/http/routes/index'

export const main = async () => {
    const app = container.resolve(FastifyConfig).app()
    const env = container.resolve(EnvConfig)
    const swaggerConfig = container.resolve(SwaggerConfig)
    const router = container.resolve(Router)

    // Registrar Swagger
    await swaggerConfig.register(app)

    // Registrar rotas
    router.registerRoutes(app)

    return { app, env }
}
