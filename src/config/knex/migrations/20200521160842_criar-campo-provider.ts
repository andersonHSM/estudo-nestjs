import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.alterTable('usuarios', table => {
    table.renameColumn('provider', 'is_provider');
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.alterTable('usuarios', table => {
    table.renameColumn('is_provider', 'provider');
  });
}
