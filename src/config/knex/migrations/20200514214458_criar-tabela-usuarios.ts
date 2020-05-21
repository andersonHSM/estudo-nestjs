import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable('usuarios', table => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('sobrenome', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable('usuarios');
}
