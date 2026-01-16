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

    constructor() {
        const configSchema = z.object({
            NODE_ENV: z
                .enum(['development', 'test', 'production'])
                .default('production'),
            API_PORT: z.coerce.number().default(3333),
            DEV_PORT: z.coerce.number().default(3004),
            CORS_ORIGIN: z.string().default('*'),
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
    }
}
