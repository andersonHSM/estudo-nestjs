import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('arquivos', table => {
    table.increments().primary();

    table.string('name').notNullable();

    table.string('path').notNullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('arquivos');
}
