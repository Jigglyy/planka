/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import LabelsStep from '../../labels/LabelsStep';

const EditDefaultLabelsStep = React.memo(({ listId, onBack }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const defaultLabelIds = useSelector((state) => {
    const list = selectListById(state, listId);
    return (list && list.defaultLabelIds) || [];
  });

  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (labelId) => {
      dispatch(
        entryActions.updateList(listId, {
          defaultLabelIds: [...defaultLabelIds, labelId],
        }),
      );
    },
    [listId, defaultLabelIds, dispatch],
  );

  const handleDeselect = useCallback(
    (labelId) => {
      dispatch(
        entryActions.updateList(listId, {
          defaultLabelIds: defaultLabelIds.filter((id) => id !== labelId),
        }),
      );
    },
    [listId, defaultLabelIds, dispatch],
  );

  return (
    <LabelsStep
      currentIds={defaultLabelIds}
      title="common.defaultLabels"
      onSelect={handleSelect}
      onDeselect={handleDeselect}
      onBack={onBack}
    />
  );
});

EditDefaultLabelsStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EditDefaultLabelsStep;
