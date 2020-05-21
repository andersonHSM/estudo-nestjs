import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('apontamentos', table => {
    table
      .increments('id')
      .primary()
      .notNullable();

    table.dateTime('data').notNullable();

    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .integer('provedor_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamps();

    table
      .dateTime('canceled_at')
      .nullable()
      .defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('apontamentos');
}
