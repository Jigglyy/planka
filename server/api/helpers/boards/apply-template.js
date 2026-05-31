/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

const { POSITION_GAP } = require('../../../constants');

// Pre-populates a freshly created board from a (already sanitized)
// template blob. Mirrors boards/import-from-trello.js: creates labels and
// kanban lists directly with no socket broadcast — the board is brand new
// and the client loads everything when it navigates to it. Board-level
// settings are applied by boards/create.js when the board row is created,
// not here. Position is assigned by array order so templates stay tidy.
module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    data: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const { board, data } = inputs;

    const labels = _.isArray(data.labels) ? data.labels : [];
    const lists = _.isArray(data.lists) ? data.lists : [];

    await Promise.all(
      labels.map((label, index) =>
        Label.qm.createOne({
          boardId: board.id,
          position: POSITION_GAP * (index + 1),
          name: label.name || null,
          color: label.color,
        }),
      ),
    );

    await Promise.all(
      lists.map((list, index) =>
        List.qm.createOne({
          boardId: board.id,
          type: list.type,
          position: POSITION_GAP * (index + 1),
          name: list.name,
          color: list.color || null,
        }),
      ),
    );
  },
};
