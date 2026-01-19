import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'
import { injectable } from 'tsyringe'

if (process.env.NODE_ENV === 'test') {
    config({ path: resolve(process.cwd(), '.env.test') })
} else {
    config({ path: resolve(process.cwd(), '.env') })
}

@injectable()
export class EnvConfig {
    public readonly NODE_ENV: string
    public readonly API_PORT: number
    public readonly DEV_PORT: number
    public readonly CORS_ORIGIN: string
    public readonly DATABASE_CLIENT: string
    public readonly DATABASE_HOST: string
    public readonly DATABASE_URL: string

    constructor() {
        const configSchema = z.object({
            NODE_ENV: z
                .enum(['development', 'test', 'production'])
                .default('production'),
            API_PORT: z.coerce.number().default(3333),
            DEV_PORT: z.coerce.number().default(3004),
            CORS_ORIGIN: z.string().default('*'),
            DATABASE_CLIENT: z.string().default('pg'),
            DATABASE_HOST: z.string().default('localhost'),
            DATABASE_URL: z.string().default(''),
        })

        const envVars = configSchema.safeParse(process.env)

        if (!envVars.success) {
            console.error(
                'Erro ao validar variáveis de ambiente:',
                envVars.error.format(),
            )
            throw new Error('Falha ao carregar as variáveis de ambiente.')
        }

        this.NODE_ENV = envVars.data.NODE_ENV
        this.API_PORT = envVars.data.API_PORT
        this.DEV_PORT = envVars.data.DEV_PORT
        this.CORS_ORIGIN = envVars.data.CORS_ORIGIN
        this.DATABASE_CLIENT = envVars.data.DATABASE_CLIENT
        this.DATABASE_HOST = envVars.data.DATABASE_HOST
        this.DATABASE_URL = envVars.data.DATABASE_URL
    }
}
