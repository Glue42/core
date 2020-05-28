/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById('updateContextBtn')
      .addEventListener('click', updateContextHandler, false);
  })
  .then(clearLogsHandler)
  .catch(console.error);

function updateContextHandler() {
  const ctxName = document.getElementById('ctxNameInput').value;
  const ctxData = document.getElementById('ctxDataInput').value;

  updateContext(ctxName, ctxData);
}

async function updateContext(ctxName, ctxData) {
  try {
    await glue.contexts.update(ctxName, { value: ctxData })

    logger.info(`Context ${ctxName} updated to "${ctxData}".`);
  } catch (error) {
    logger.error(error.message || `Failed to update context.`);
  }
}
