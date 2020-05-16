import { Config } from 'knex';

const development: Config = {
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '123',
    port: 5432,
    database: 'estudo',
  },
};

const production: Config = {
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
};

export const environments = {
  development,
  production,
};
