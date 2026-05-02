import 'reflect-metadata'
import { container } from 'tsyringe'
import { EnvConfig, FastifyConfig, DatabaseConfig, SwaggerConfig } from '@/configs'
import { Router } from '@/infrastructure/http/routes/router'
import { ConseptionController } from '@/infrastructure/http/controllers/conseption/conseption.controller'
import { ConseptionRouter } from '@/infrastructure/http/routes/conseption.router'
import { Conseption } from '@/domain/conseption/application/use-cases/conseption'

container.registerSingleton('EnvConfig', EnvConfig)
container.registerSingleton('FastifyConfig', FastifyConfig)
container.registerSingleton('DatabaseConfig', DatabaseConfig)
container.registerSingleton('SwaggerConfig', SwaggerConfig)
container.registerSingleton('Router', Router)
container.registerSingleton(ConseptionController)
container.registerSingleton(ConseptionRouter)
container.registerSingleton(Conseption)