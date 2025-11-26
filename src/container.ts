import 'reflect-metadata'
import { container } from 'tsyringe'
import { EnvConfig, FastifyConfig } from '@/configs'
import { Router } from '@/routes/route'

container.registerSingleton<EnvConfig>('EnvConfig', EnvConfig)
container.registerSingleton<FastifyConfig>('FastifyConfig', FastifyConfig)
container.registerSingleton<Router>('Router', Router)
