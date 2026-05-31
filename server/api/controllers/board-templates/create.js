/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

/**
 * @swagger
 * /board-templates:
 *   post:
 *     summary: Save a board as a template
 *     description: Captures an existing board's lists, labels and settings into a new template owned by the current user. Requires membership of the source board.
 *     tags:
 *       - Board Templates
 *     operationId: createBoardTemplate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - boardId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 128
 *               boardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      required: true,
    },
    boardId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const data = await sails.helpers.boardTemplates.buildFromBoard.with({ board });

    const boardTemplate = await BoardTemplate.qm.createOne({
      name: inputs.name.trim(),
      data,
      userId: currentUser.id,
    });

    return {
      item: {
        id: boardTemplate.id,
        name: boardTemplate.name,
        isBuiltIn: false,
      },
    };
  },
};
