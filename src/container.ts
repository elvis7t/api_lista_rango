import 'reflect-metadata'
import { container } from 'tsyringe'
import { EnvConfig, FastifyConfig, DatabaseConfig, SwaggerConfig } from '@/configs'
import { Router } from '@/infrastructure/http/routes/router'

container.registerSingleton('EnvConfig', EnvConfig)
container.registerSingleton('FastifyConfig', FastifyConfig)
container.registerSingleton('DatabaseConfig', DatabaseConfig)
container.registerSingleton('SwaggerConfig', SwaggerConfig)
container.registerSingleton('Router', Router)
