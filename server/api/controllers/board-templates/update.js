/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

/**
 * @swagger
 * /board-templates/{id}:
 *   patch:
 *     summary: Rename a board template
 *     description: Renames one of the current user's own templates. Built-in templates cannot be modified.
 *     tags:
 *       - Board Templates
 *     operationId: updateBoardTemplate
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_TEMPLATE_NOT_FOUND: {
    boardTemplateNotFound: 'Board template not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      required: true,
    },
  },

  exits: {
    boardTemplateNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    // Owner-scoped lookup: a user can only ever see/modify their own
    // templates (built-in ids are non-numeric and never match here).
    const boardTemplate = await BoardTemplate.qm.getOneById(inputs.id, {
      userId: currentUser.id,
    });

    if (!boardTemplate) {
      throw Errors.BOARD_TEMPLATE_NOT_FOUND;
    }

    const nextBoardTemplate = await BoardTemplate.qm.updateOne(
      { id: boardTemplate.id, userId: currentUser.id },
      { name: inputs.name.trim() },
    );

    if (!nextBoardTemplate) {
      throw Errors.BOARD_TEMPLATE_NOT_FOUND;
    }

    return {
      item: {
        id: nextBoardTemplate.id,
        name: nextBoardTemplate.name,
        isBuiltIn: false,
      },
    };
  },
};
