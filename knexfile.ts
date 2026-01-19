import 'reflect-metadata'
import { container } from 'tsyringe'
import { EnvConfig, DatabaseConfig } from '@/configs'

container.register('EnvConfig', {
  useClass: EnvConfig,
})

const dbConfig = container.resolve(DatabaseConfig)

export default {
  development: dbConfig.getConnection().client.config,
  test: dbConfig.getConnection().client.config,
}
