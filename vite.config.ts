import type { Environment } from 'vitest/environments';
import knex from 'knex';

const db = knex({
  client: 'pg', // ou mysql/sqlite
  connection: {
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'testdb',
  },
});

export default <Environment>{
  name: 'knex',
  async setup() {
    // aqui você pode rodar migrations ou seeds
    await db.migrate.latest();
    return {
      teardown() {
        return db.destroy();
      },
    };
  },
};
