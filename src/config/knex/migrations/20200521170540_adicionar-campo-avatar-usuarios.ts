import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.alterTable('usuarios', table => {
    table
      .integer('avatar_id')
      .nullable()
      .defaultTo(null)
      .references('id')
      .inTable('arquivos');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('usuarios', table => {
    table.dropColumn('avatar_id');
  });
}
