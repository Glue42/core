/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => setContext('G42Core', 'Glue42 Core'))
  .then(() => {
    document.getElementById('setContextBtn')
      .addEventListener('click', setContextHandler, false);
  })
  .then(clearLogsHandler)
  .catch(console.error);

function setContextHandler() {
  const ctxName = document.getElementById('ctxNameInput').value;
  const ctxData = document.getElementById('ctxDataInput').value;

  setContext(ctxName, ctxData);
}

async function setContext(ctxName, ctxData) {
  try {
    await glue.contexts.set(ctxName, { value: ctxData })

    logger.info(`Context "${ctxName}" set to "${ctxData}".`);
  } catch (error) {
    logger.error(error.message || `Failed to set new context data.`);
  }
}
