/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

// Serializes an existing board into a template `data` blob: its kanban
// lists (active/closed only — archive/trash are system lists recreated
// automatically), its labels and a few board settings. The result is
// run through BoardTemplate.sanitizeData so only valid enums/colors are
// ever stored.
module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { board } = inputs;

    const lists = await List.qm.getByBoardId(board.id, {
      typeOrTypes: List.KANBAN_TYPES,
    });

    const labels = await Label.qm.getByBoardId(board.id);

    return BoardTemplate.sanitizeData({
      board: {
        defaultView: board.defaultView,
        defaultCardType: board.defaultCardType,
        limitCardTypesToDefaultOne: board.limitCardTypesToDefaultOne,
        alwaysDisplayCardCreator: board.alwaysDisplayCardCreator,
        displayCardAges: board.displayCardAges,
        expandTaskListsByDefault: board.expandTaskListsByDefault,
      },
      lists: lists.map((list) => ({
        name: list.name,
        type: list.type,
        color: list.color,
      })),
      labels: labels.map((label) => ({
        name: label.name,
        color: label.color,
      })),
    });
  },
};
