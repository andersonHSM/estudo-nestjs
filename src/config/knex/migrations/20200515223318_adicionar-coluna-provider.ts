import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('usuarios', table => {
    table
      .boolean('provider')
      .notNullable()
      .defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('usuarios', table => {
    table.dropColumn('provider');
  });
}
