import 'reflect-metadata'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { inject, injectable } from 'tsyringe'
import { EnvConfig } from '@/configs/env.config'

@injectable()
export class FastifyConfig {
    constructor(@inject('EnvConfig') private readonly env: EnvConfig) {
        this.env = env
    }

    public app() {
        const app = Fastify()

        app.register(cors, {
            origin: this.env.CORS_ORIGIN,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
        
        return app
    }
}
