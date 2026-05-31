/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Menu } from 'semantic-ui-react';
import { FilePicker, Input, Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../hooks';
import { isUrl } from '../../../utils/validator';
import { AttachmentTypes } from '../../../constants/Enums';

import styles from './AddAttachmentStep.module.scss';

const StepTypes = {
  ADD_LINK: 'ADD_LINK',
};

const AddAttachmentStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [step, openStep, handleBack] = useSteps();

  const [data, handleFieldChange] = useForm(() => ({
    url: '',
    name: '',
  }));

  const [urlFieldRef, handleUrlFieldRef] = useNestedRef('inputRef');

  const handleFilesSelect = useCallback(
    (files) => {
      files.forEach((file) => {
        dispatch(
          entryActions.createAttachmentInCurrentCard({
            file,
            type: AttachmentTypes.FILE,
            name: file.name,
          }),
        );
      });

      onClose();
    },
    [onClose, dispatch],
  );

  const handleAddLinkClick = useCallback(() => {
    openStep(StepTypes.ADD_LINK);
  }, [openStep]);

  const handleLinkSubmit = useCallback(() => {
    let url = data.url.trim();

    if (!url) {
      urlFieldRef.current.select();
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    if (!isUrl(url)) {
      urlFieldRef.current.select();
      return;
    }

    const name = data.name.trim() || url;

    dispatch(
      entryActions.createAttachmentInCurrentCard({
        url,
        type: AttachmentTypes.LINK,
        name,
      }),
    );

    onClose();
  }, [onClose, dispatch, data, urlFieldRef]);

  useEffect(() => {
    if (step && step.type === StepTypes.ADD_LINK) {
      urlFieldRef.current.focus({
        preventScroll: true,
      });
    }
  }, [step, urlFieldRef]);

  if (step && step.type === StepTypes.ADD_LINK) {
    return (
      <>
        <Popup.Header onBack={handleBack}>
          {t('common.addAttachment', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleLinkSubmit}>
            <Input
              fluid
              ref={handleUrlFieldRef}
              name="url"
              value={data.url}
              placeholder="https://"
              maxLength={2048}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <Input
              fluid
              name="name"
              value={data.name}
              placeholder={t('common.title')}
              maxLength={128}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <Button positive content={t('action.addLink')} />
          </Form>
        </Popup.Content>
      </>
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.addAttachment', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <FilePicker multiple onSelect={handleFilesSelect}>
            <Menu.Item className={styles.menuItem}>
              <Icon name="computer" className={styles.menuItemIcon} />
              {t('common.fromComputer', {
                context: 'title',
              })}
            </Menu.Item>
          </FilePicker>
          <Menu.Item className={styles.menuItem} onClick={handleAddLinkClick}>
            <Icon name="linkify" className={styles.menuItemIcon} />
            {t('common.fromUrl', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
        <hr className={styles.divider} />
        <div className={styles.tip}>
          {t('common.pressPasteShortcutToAddAttachmentFromClipboard')}
        </div>
      </Popup.Content>
    </>
  );
});

AddAttachmentStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddAttachmentStep;
