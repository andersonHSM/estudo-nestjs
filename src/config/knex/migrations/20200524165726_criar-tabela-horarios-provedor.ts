import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('horarios_provedor', table => {
    table.increments().primary();
    table
      .integer('provedor_id')
      .references('id')
      .inTable('usuarios');
    table.dateTime('horario');
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('horarios_provedor');
}
