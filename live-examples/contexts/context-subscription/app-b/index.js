/* eslint-disable no-undef */
const APP_NAME = 'App-B';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById('updateContextBtn')
      .addEventListener('click', updateContextHandler, false);
  })
  .catch(console.error);

function updateContextHandler() {
  const ctxName = document.getElementById('ctxNameInput').value;
  const ctxData = document.getElementById('ctxDataInput').value;

  updateContext(ctxName, ctxData);
}

async function updateContext(ctxName, ctxData) {
  try {
    await glue.contexts.set(ctxName, { value: ctxData })

    logger.info(`[${formatTime(new Date())}] Context ${ctxName} updated to "${ctxData}"`);
  } catch (error) {
    logger.error(error.message || `Failed to update context`);
  }
}
