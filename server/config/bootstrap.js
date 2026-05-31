/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

const BACKFILL_CONCURRENCY = 3;

// Re-processes link attachments that were created before link metadata
// (title/description/preview image) was captured. Runs in the background so it
// never blocks app lift.
const backfillLinkMetadata = async () => {
  let queryResult;
  try {
    queryResult = await sails.sendNativeQuery(
      `SELECT id, data FROM attachment
       WHERE type = $1 AND (data ->> 'metadataFetched') IS DISTINCT FROM 'true'`,
      [Attachment.Types.LINK],
    );
  } catch (error) {
    sails.log.warn(`Link metadata backfill skipped: ${error.message}`);
    return;
  }

  const { rows } = queryResult;
  if (rows.length === 0) {
    return;
  }

  sails.log.info(`Link metadata backfill started (${rows.length} attachment(s))`);

  const processOne = async (row) => {
    if (!row.data || !row.data.url) {
      return false;
    }

    try {
      const data = await sails.helpers.attachments.processLink(row.data.url);
      await Attachment.qm.updateOne({ id: row.id }, { data });
      return true;
    } catch (error) {
      sails.log.warn(`Link metadata backfill failed for ${row.id}: ${error.message}`);
      return false;
    }
  };

  let processed = 0;
  for (let offset = 0; offset < rows.length; offset += BACKFILL_CONCURRENCY) {
    const batch = rows.slice(offset, offset + BACKFILL_CONCURRENCY);

    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(batch.map(processOne));
    processed += results.filter(Boolean).length;
  }

  sails.log.info(`Link metadata backfill finished (${processed}/${rows.length} updated)`);
};

module.exports.bootstrap = async () => {
  // Fire-and-forget: existing links get previews without delaying lift.
  backfillLinkMetadata().catch((error) => {
    sails.log.warn(`Link metadata backfill error: ${error.message}`);
  });
};
