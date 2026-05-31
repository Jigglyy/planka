/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useForm, useNestedRef } from '../../../../hooks';
import api from '../../../../api';

import styles from './SaveAsTemplateStep.module.scss';

const SaveAsTemplateStep = React.memo(({ boardId, onBack, onClose }) => {
  const [t] = useTranslation();

  const accessToken = useSelector(selectors.selectAccessToken);

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  const isMountedRef = useRef(true);
  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = useCallback(() => {
    const name = data.name.trim();

    if (!name) {
      nameFieldRef.current.select();
      return;
    }

    setIsSubmitting(true);
    setIsError(false);

    api
      .createBoardTemplate(
        {
          name,
          boardId,
        },
        {
          Authorization: `Bearer ${accessToken}`,
        },
      )
      .then(() => {
        if (isMountedRef.current) {
          onClose();
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setIsSubmitting(false);
          setIsError(true);
        }
      });
  }, [accessToken, boardId, onClose, data, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.saveBoardAsTemplate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            placeholder={t('common.title')}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          {isError && <div className={styles.message}>{t('common.couldNotSaveTemplate')}</div>}
          <Button positive disabled={isSubmitting} content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

SaveAsTemplateStep.propTypes = {
  boardId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SaveAsTemplateStep;
