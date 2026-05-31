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
import { Button, Icon, Loader, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import api from '../../../api';

import styles from './SelectTemplateStep.module.scss';

const SelectTemplateStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();

  const accessToken = useSelector(selectors.selectAccessToken);

  const [items, setItems] = useState(null);
  const [isError, setIsError] = useState(false);

  const isMountedRef = useRef(true);

  const fetchItems = useCallback(() => {
    api
      .getBoardTemplates({
        Authorization: `Bearer ${accessToken}`,
      })
      .then(({ items: nextItems }) => {
        if (isMountedRef.current) {
          setItems(nextItems);
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setIsError(true);
        }
      });
  }, [accessToken]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchItems();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchItems]);

  const handleBlankClick = useCallback(() => {
    onSelect(null);
    onBack();
  }, [onSelect, onBack]);

  const handleTemplateClick = useCallback(
    (_, { value: id }) => {
      const template = (items || []).find((item) => item.id === id);

      if (template) {
        onSelect({
          id: template.id,
          name: template.name,
        });

        onBack();
      }
    },
    [items, onSelect, onBack],
  );

  const handleDeleteClick = useCallback(
    (event, { value: id }) => {
      event.stopPropagation();

      setItems((prevItems) => (prevItems ? prevItems.filter((item) => item.id !== id) : prevItems));

      api
        .deleteBoardTemplate(id, {
          Authorization: `Bearer ${accessToken}`,
        })
        .catch(() => {
          fetchItems();
        });
    },
    [accessToken, fetchItems],
  );

  const builtInItems = items ? items.filter((item) => item.isBuiltIn) : [];
  const userItems = items ? items.filter((item) => !item.isBuiltIn) : [];

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.selectTemplate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleBlankClick}>
            <Icon name="file outline" className={styles.menuItemIcon} />
            {t('common.blankBoard')}
          </Menu.Item>
        </Menu>
        {isError && <div className={styles.message}>{t('common.couldNotLoadTemplates')}</div>}
        {!isError && !items && (
          <Loader active inline="centered" size="small" className={styles.loader} />
        )}
        {!isError && items && (
          <>
            <hr className={styles.divider} />
            <div className={styles.group}>{t('common.builtInTemplates')}</div>
            <Menu secondary vertical className={styles.menu}>
              {builtInItems.map((item) => (
                <Menu.Item
                  key={item.id}
                  value={item.id}
                  className={styles.menuItem}
                  onClick={handleTemplateClick}
                >
                  <Icon name="clone outline" className={styles.menuItemIcon} />
                  {item.name}
                </Menu.Item>
              ))}
            </Menu>
            <hr className={styles.divider} />
            <div className={styles.group}>{t('common.myTemplates')}</div>
            {userItems.length === 0 ? (
              <div className={styles.message}>{t('common.noSavedTemplatesYet')}</div>
            ) : (
              <Menu secondary vertical className={styles.menu}>
                {userItems.map((item) => (
                  <Menu.Item
                    key={item.id}
                    as="div"
                    value={item.id}
                    className={styles.menuItem}
                    onClick={handleTemplateClick}
                  >
                    <Icon name="clone outline" className={styles.menuItemIcon} />
                    {item.name}
                    <Button
                      type="button"
                      value={item.id}
                      className={styles.deleteButton}
                      onClick={handleDeleteClick}
                    >
                      <Icon fitted name="trash alternate outline" />
                    </Button>
                  </Menu.Item>
                ))}
              </Menu>
            )}
          </>
        )}
      </Popup.Content>
    </>
  );
});

SelectTemplateStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default SelectTemplateStep;
