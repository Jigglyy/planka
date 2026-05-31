/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.jsonb('default_label_ids').notNullable().defaultTo('[]');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.dropColumn('default_label_ids');
  });
