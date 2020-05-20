/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById('discoverContextBtn')
      .addEventListener('click', discoverContextHandler, false);
  })
  .then(clearLogsHandler)
  .catch(console.error);

function discoverContextHandler() {
  const ctxName = document.getElementById('ctxNameInput').value;
  getContext(ctxName)
}

async function getContext(ctxName) {
  const ctxExists = glue.contexts.all().some(ctx => ctx === ctxName);
  if (ctxExists === false) {
    logger.error(`Context "${ctxName}" has not been set.`);
    return;
  }

  try {
    const ctx = await glue.contexts.get(ctxName, false);
    const ctxData = Object.keys(ctx).map(key => ctx[key]).join('; ');

    logger.info(`Context "${ctxName}" contains data: "${ctxData}".`);
  } catch (error) {
    logger.error(error.message || `Failed to get context "${ctxName}".`);
  }
}
