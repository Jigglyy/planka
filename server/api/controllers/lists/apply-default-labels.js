/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /lists/{id}/apply-default-labels:
 *   post:
 *     summary: Apply default labels to all cards in list
 *     description: Adds the list's default labels to every card in the list (labels a card already has are skipped). Requires board editor permissions.
 *     tags:
 *       - Lists
 *     operationId: applyDefaultLabelsToList
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the list
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Default labels applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/List'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const cards = await Card.qm.getByListId(list.id);

    const defaultLabelIds = Array.isArray(list.defaultLabelIds) ? list.defaultLabelIds : [];

    if (defaultLabelIds.length === 0) {
      // No defaults configured: clear all labels from every card in the list.
      const cardById = _.keyBy(cards, 'id');
      const cardLabels = await CardLabel.qm.getByCardIds(sails.helpers.utils.mapRecords(cards));

      await Promise.all(
        cardLabels.map((cardLabel) =>
          sails.helpers.cardLabels.deleteOne.with({
            record: cardLabel,
            project,
            board,
            list,
            card: cardById[cardLabel.cardId],
            actorUser: currentUser,
          }),
        ),
      );
    } else {
      await Promise.all(
        cards.map((card) =>
          sails.helpers.lists.applyDefaultLabels.with({
            card,
            list,
            project,
            board,
            actorUser: currentUser,
          }),
        ),
      );
    }

    return {
      item: list,
    };
  },
};
