/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { URL } = require('url');

const MAX_RESPONSE_LENGTH = 1024 * 1024;

const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 1024;

const META_TAG_REGEX = /<meta\s+[^>]*>/gi;
const ATTR_REGEX = /([a-zA-Z:_-]+)\s*=\s*"([^"]*)"|([a-zA-Z:_-]+)\s*=\s*'([^']*)'/g;
const TITLE_TAG_REGEX = /<title[^>]*>([\s\S]*?)<\/title>/i;

const HTML_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
};

const decodeHtmlEntities = (value) =>
  value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const codePoint =
        entity[1] === 'x' || entity[1] === 'X'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);

      if (Number.isNaN(codePoint)) {
        return match;
      }

      try {
        return String.fromCodePoint(codePoint);
      } catch (error) {
        return match;
      }
    }

    return HTML_ENTITIES[entity] === undefined ? match : HTML_ENTITIES[entity];
  });

const normalize = (value, maxLength) => {
  if (!value) {
    return undefined;
  }

  const normalized = decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
};

const parseMetaTags = (content) => {
  const metaByKey = {};

  const metaTagsMatch = content.match(META_TAG_REGEX);
  if (!metaTagsMatch) {
    return metaByKey;
  }

  metaTagsMatch.forEach((metaTag) => {
    const attributes = {};

    let attrMatch;
    ATTR_REGEX.lastIndex = 0;
    // eslint-disable-next-line no-cond-assign
    while ((attrMatch = ATTR_REGEX.exec(metaTag)) !== null) {
      const name = (attrMatch[1] || attrMatch[3]).toLowerCase();
      const value = attrMatch[2] !== undefined ? attrMatch[2] : attrMatch[4];
      attributes[name] = value;
    }

    const key = attributes.property || attributes.name;
    if (key && attributes.content !== undefined && metaByKey[key.toLowerCase()] === undefined) {
      metaByKey[key.toLowerCase()] = attributes.content;
    }
  });

  return metaByKey;
};

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const result = await sails.helpers.utils.fetchUrlContent.with({
      url: inputs.url,
      maxLength: MAX_RESPONSE_LENGTH,
    });

    // No response at all (network error, timeout, blocked protocol): leave it
    // retry-worthy for the backfill.
    if (!result.ok) {
      return { ok: false };
    }

    // A response was received. Whatever we can (or cannot) extract from it is
    // definitive — do not keep re-fetching on every restart.
    if (
      !result.contentType.includes('text/html') &&
      !result.contentType.includes('application/xhtml')
    ) {
      return { ok: true };
    }

    const content = result.buffer.toString();
    const metaByKey = parseMetaTags(content);

    const titleTagMatch = content.match(TITLE_TAG_REGEX);

    const title = normalize(
      metaByKey['og:title'] || metaByKey['twitter:title'] || (titleTagMatch && titleTagMatch[1]),
      MAX_TITLE_LENGTH,
    );

    const description = normalize(
      metaByKey['og:description'] || metaByKey['twitter:description'] || metaByKey.description,
      MAX_DESCRIPTION_LENGTH,
    );

    const rawImage = metaByKey['og:image'] || metaByKey['twitter:image'];

    let image;
    if (rawImage) {
      try {
        image = new URL(decodeHtmlEntities(rawImage.trim()), result.finalUrl).href;
      } catch (error) {
        image = undefined;
      }
    }

    return {
      ok: true,
      title,
      description,
      image,
    };
  },
};
