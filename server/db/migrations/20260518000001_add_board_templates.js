/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

module.exports.up = (knex) =>
  knex.schema.createTable('board_template', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('name').notNullable();
    table.jsonb('data').notNullable().defaultTo('{}');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('board_template');
