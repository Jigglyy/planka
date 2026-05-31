/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

const defaultFind = (criteria) => BoardTemplate.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => BoardTemplate.create({ ...values }).fetch();

const getByUserId = (userId) =>
  defaultFind({
    userId,
  });

const getOneById = (id, { userId } = {}) => {
  const criteria = {
    id,
  };

  if (userId) {
    criteria.userId = userId;
  }

  return BoardTemplate.findOne(criteria);
};

const updateOne = (criteria, values) => BoardTemplate.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => BoardTemplate.destroy(criteria).fetch();

const deleteOne = (criteria) => BoardTemplate.destroyOne(criteria);

module.exports = {
  createOne,
  getByUserId,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
