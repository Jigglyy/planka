/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

/**
 * @swagger
 * /board-templates:
 *   get:
 *     summary: List board templates
 *     description: Returns the code-defined built-in templates plus the current user's own saved templates.
 *     tags:
 *       - Board Templates
 *     operationId: indexBoardTemplates
 *     responses:
 *       200:
 *         description: Board templates returned successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

const presentOne = (id, name, isBuiltIn) => ({ id, name, isBuiltIn });

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const builtInItems = BoardTemplate.BUILT_IN_TEMPLATES.map((template) =>
      presentOne(template.id, template.name, true),
    );

    const userTemplates = await BoardTemplate.qm.getByUserId(currentUser.id);
    const userItems = userTemplates.map((template) =>
      presentOne(template.id, template.name, false),
    );

    return {
      items: [...builtInItems, ...userItems],
    };
  },
};
