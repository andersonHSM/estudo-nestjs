import { Config } from 'knex';

const environment: Config = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: (process.env.DB_PORT as any) as number,
    database: process.env.DB_DATABASE,
  },
};

export default environment;
