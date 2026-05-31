/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const sharp = require('sharp');

const MAX_RESPONSE_LENGTH = 5 * 1024 * 1024;

const MAX_IMAGE_SIZE = 720;

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
    filePathSegment: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const result = await sails.helpers.utils.fetchUrlContent.with({
      url: inputs.url,
      maxLength: MAX_RESPONSE_LENGTH,
    });

    if (!result.ok || result.truncated || !result.contentType.startsWith('image/')) {
      return false;
    }

    const availableStorage = await sails.helpers.utils.getAvailableStorage();

    if (availableStorage !== null && result.buffer.length >= availableStorage) {
      return false;
    }

    let image = sharp(result.buffer, { animated: false });

    let metadata;
    try {
      metadata = await image.metadata();
    } catch (error) {
      return false;
    }

    if (!metadata || !metadata.width || !metadata.height) {
      return false;
    }

    image = image
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 80 });

    const fileManager = sails.hooks['file-manager'].getInstance();

    try {
      await fileManager.save(inputs.filePathSegment, image, 'image/jpeg');
    } catch (error) {
      return false;
    }

    return true;
  },
};
