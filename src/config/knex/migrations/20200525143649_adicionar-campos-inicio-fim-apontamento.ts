import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.alterTable('apontamentos', table => {
    table.dropColumn('data');
    table.dateTime('data_inicio').notNullable();
    table.dateTime('data_fim').notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.alterTable('apontamentos', table => {
    table.dateTime('data').notNullable();
    table.dropColumn('data_inicio');
    table.dropColumn('data_fim');
  });
}
