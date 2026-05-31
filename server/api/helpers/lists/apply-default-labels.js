/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const toArray = (value) => (Array.isArray(value) ? value : []);

module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    removeList: {
      type: 'ref',
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const addIds = toArray(inputs.list.defaultLabelIds);
    const removeIds = inputs.removeList ? toArray(inputs.removeList.defaultLabelIds) : [];

    if (addIds.length === 0 && removeIds.length === 0) {
      return;
    }

    const labels = await Label.qm.getByBoardId(inputs.board.id);
    const labelById = _.keyBy(labels, 'id');

    // Only operate on labels that still exist on the board.
    const effectiveAdd = addIds.filter((id) => labelById[id]);
    const effectiveRemove = removeIds.filter((id) => labelById[id] && !effectiveAdd.includes(id));

    const cardLabels = await CardLabel.qm.getByCardIds([inputs.card.id]);
    const cardLabelByLabelId = _.keyBy(cardLabels, 'labelId');

    const toAdd = effectiveAdd.filter((id) => !cardLabelByLabelId[id]);
    const toRemove = effectiveRemove.filter((id) => cardLabelByLabelId[id]);

    await Promise.all(
      toAdd.map((labelId) =>
        sails.helpers.cardLabels.createOne
          .with({
            values: {
              card: inputs.card,
              label: labelById[labelId],
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
            actorUser: inputs.actorUser,
          })
          .tolerate('labelAlreadyInCard'),
      ),
    );

    await Promise.all(
      toRemove.map((labelId) =>
        sails.helpers.cardLabels.deleteOne.with({
          record: cardLabelByLabelId[labelId],
          project: inputs.project,
          board: inputs.board,
          list: inputs.removeList || inputs.list,
          card: inputs.card,
          actorUser: inputs.actorUser,
        }),
      ),
    );
  },
};
