import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('horarios_provedor', table => {
    table.increments().primary();
    table
      .integer('provedor_id')
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    table
      .string('horario_inicio')
      .notNullable()
      .defaultTo('08:00:00');
    table
      .string('horario_fim')
      .notNullable()
      .defaultTo('18:00:00');
    table
      .string('inicio_intervalo')
      .notNullable()
      .defaultTo('12:00:00');
    table
      .string('fim_intervalo')
      .notNullable()
      .defaultTo('14:00:00');

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('horarios_provedor');
}
