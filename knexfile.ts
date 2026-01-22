import 'reflect-metadata'
import { container } from 'tsyringe'
import { EnvConfig, DatabaseConfig } from '@/configs'

container.register('EnvConfig', {
  useClass: EnvConfig,
})

const databaseConfig = container.resolve<DatabaseConfig>(DatabaseConfig)

export default {
  development: databaseConfig.getConnection().client.config,
  test: databaseConfig.getConnection().client.config,
}
