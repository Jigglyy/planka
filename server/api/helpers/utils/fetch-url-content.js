/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { URL } = require('url');
const { ProxyAgent } = require('undici');

const FETCH_TIMEOUT = 4000;
const DEFAULT_MAX_RESPONSE_LENGTH = 1024 * 1024;

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

const readResponse = async (response, maxLength) => {
  const reader = response.body.getReader();

  const chunks = [];
  let receivedLength = 0;
  let truncated = false;

  for (;;) {
    const { value, done } = await reader.read(); // eslint-disable-line no-await-in-loop

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    if (receivedLength > maxLength) {
      reader.cancel();
      truncated = true;
      break;
    }
  }

  return {
    truncated,
    buffer: Buffer.concat(chunks),
  };
};

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
    maxLength: {
      type: 'number',
    },
  },

  async fn(inputs) {
    // Protocol allowlist: never let a user-supplied (or page-derived) URL pull
    // the server into non-HTTP schemes (file:, data:, etc.).
    let protocol;
    try {
      ({ protocol } = new URL(inputs.url));
    } catch (error) {
      return { ok: false };
    }

    if (!ALLOWED_PROTOCOLS.includes(protocol)) {
      return { ok: false };
    }

    const maxLength = inputs.maxLength || DEFAULT_MAX_RESPONSE_LENGTH;

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), FETCH_TIMEOUT);

    let response;
    let readResult;
    try {
      response = await fetch(inputs.url, {
        signal: abortController.signal,
        dispatcher: sails.config.custom.outgoingProxy
          ? new ProxyAgent(sails.config.custom.outgoingProxy)
          : undefined,
      });

      if (!response.body) {
        return { ok: false };
      }

      readResult = await readResponse(response, maxLength);
    } catch (error) {
      return { ok: false };
    } finally {
      clearTimeout(timeout);
    }

    // A response was received (any status / content type). Callers decide what
    // to do with it; `ok: true` here means "do not retry" for the backfill.
    return {
      ok: true,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      finalUrl: response.url,
      truncated: readResult.truncated,
      buffer: readResult.buffer,
    };
  },
};
