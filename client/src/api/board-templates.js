/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

import socket from './socket';

/* Actions */

const getBoardTemplates = (headers) => socket.get('/board-templates', undefined, headers);

const createBoardTemplate = (data, headers) => socket.post('/board-templates', data, headers);

const updateBoardTemplate = (id, data, headers) =>
  socket.patch(`/board-templates/${id}`, data, headers);

const deleteBoardTemplate = (id, headers) =>
  socket.delete(`/board-templates/${id}`, undefined, headers);

export default {
  getBoardTemplates,
  createBoardTemplate,
  updateBoardTemplate,
  deleteBoardTemplate,
};
