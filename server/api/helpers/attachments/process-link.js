/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const crypto = require('crypto');
const { URL } = require('url');

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { hostname } = new URL(inputs.url);

    if (!sails.helpers.utils.isPreloadedFaviconExists(hostname)) {
      await sails.helpers.utils.downloadFavicon(inputs.url);
    }

    const metadata = await sails.helpers.utils.fetchLinkMetadata(inputs.url);

    let image;
    if (metadata.image) {
      const filename = `${crypto.createHash('sha1').update(inputs.url).digest('hex')}.jpg`;

      const isDownloaded = await sails.helpers.utils.downloadLinkImage.with({
        url: metadata.image,
        filePathSegment: `${sails.config.custom.linkImagesPathSegment}/${filename}`,
      });

      if (isDownloaded) {
        image = filename;
      }
    }

    return {
      hostname,
      url: inputs.url,
      title: metadata.title,
      description: metadata.description,
      image,
      // Only mark as fetched on a successful response so transient failures
      // (timeouts, anti-bot challenges) are retried by the backfill instead
      // of permanently suppressing the preview.
      metadataFetched: metadata.ok === true,
    };
  },
};
