import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('usuarios', table => {
    table
      .string('password_hash', 60)
      .notNullable()
      .defaultTo('');
    table
      .string('email', 60)
      .notNullable()
      .defaultTo('');
    table.timestamps(true, true);
    table.renameColumn('name', 'nome');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.table('usuarios', table => {
    table.dropColumn('password_hash');
    table.dropColumn('email');
    table.dropTimestamps();
  });
}
