/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById('getContextBtn')
      .addEventListener('click', () => getContext('G42Core'), false);
  })
  .then(clearLogsHandler)
  .catch(console.error);

async function getContext(ctxName) {
  try {
    const ctxData = await glue.contexts.get(ctxName, false);

    const data = Object.keys(ctxData).map((key) => ctxData[key]).join(', ');
    logger.info(`Context "${ctxName}" contains data: "${data}".`);
  } catch (error) {
    logger.error(error.message || `Failed to get context "${ctxName}".`);
  }
}
