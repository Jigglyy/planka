/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

/**
 * @swagger
 * /board-templates/{id}:
 *   delete:
 *     summary: Delete a board template
 *     description: Deletes one of the current user's own templates. Built-in templates cannot be deleted.
 *     tags:
 *       - Board Templates
 *     operationId: deleteBoardTemplate
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully
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
  },

  exits: {
    boardTemplateNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    // Owner-scoped delete: deleteOne with the userId in the criteria so a
    // user can never delete another user's template by guessing its id.
    const boardTemplate = await BoardTemplate.qm.deleteOne({
      id: inputs.id,
      userId: currentUser.id,
    });

    if (!boardTemplate) {
      throw Errors.BOARD_TEMPLATE_NOT_FOUND;
    }

    return {
      item: {
        id: boardTemplate.id,
        name: boardTemplate.name,
        isBuiltIn: false,
      },
    };
  },
};
