/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import ConfirmationStep from '../../common/ConfirmationStep';

const ApplyDefaultLabelsStep = React.memo(({ listId, onBack, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const hasDefaultLabels = useSelector((state) => {
    const list = selectListById(state, listId);
    return !!(list && list.defaultLabelIds && list.defaultLabelIds.length > 0);
  });

  const dispatch = useDispatch();

  const handleConfirm = useCallback(() => {
    dispatch(entryActions.applyDefaultLabelsToList(listId));
    onClose();
  }, [listId, onClose, dispatch]);

  return (
    <ConfirmationStep
      title="common.applyDefaultLabels"
      content={
        hasDefaultLabels
          ? 'common.areYouSureYouWantToApplyDefaultLabelsToAllCards'
          : 'common.areYouSureYouWantToRemoveAllLabelsFromAllCards'
      }
      buttonContent="action.applyDefaultLabels"
      onConfirm={handleConfirm}
      onBack={onBack}
    />
  );
});

ApplyDefaultLabelsStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ApplyDefaultLabelsStep.defaultProps = {
  onBack: undefined,
};

export default ApplyDefaultLabelsStep;
