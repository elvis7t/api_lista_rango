import { injectable, inject } from 'tsyringe'
import knex, { Knex } from 'knex'
import { resolve } from 'path'
import { EnvConfig } from '@/configs'

@injectable()
export class DatabaseConfig {
    private knexInstance: Knex

    constructor(@inject('EnvConfig') private readonly env: EnvConfig) {
        this.knexInstance = knex({
            client: this.env.DATABASE_CLIENT,
            connection: {
                filename: this.env.DATABASE_URL,
            },
            useNullAsDefault: true,
            migrations: {
                extension: 'ts',
                directory: resolve(process.cwd(), 'db', 'migrations'),
            },
        })
    }

    public getConnection(): Knex {
        return this.knexInstance
    }
}