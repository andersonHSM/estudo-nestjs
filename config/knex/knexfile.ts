// Update with your config settings.
import { enviroments } from './knex-enviroments';

const { development, production } = enviroments;

module.exports = {
  development,
  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production,
};
