/* eslint-disable no-undef */
const APP_NAME = 'App-A';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById('toggleContextSubscribeBtn')
      .addEventListener('click', toggleContextSubscribeHandler, false);
  })
  .catch(console.error);

let unsubscribeFn;

function toggleContextSubscribeHandler() {
  if (typeof unsubscribeFn === 'function') {
    // Currently subscribed to context updates.
    unsubscribeFn();
    unsubscribeFn = null;

    logger.info(`Unsubscribed to context`);
    changeToggleButtonText('Subscribe');
  } else {
    subscribeForContextUpdates('G42CoreContext');

    changeToggleButtonText('Unsubscribe');
  }
}

async function subscribeForContextUpdates(ctxName) {
  const contextUpdatedHandler = (ctxData) => {
    const data = Object.keys(ctxData).map((key) => ctxData[key]).join(', ');
    logger.info(`[${formatTime(new Date())}] Context "${ctxName}" updated to: "${data}"`);
  }

  try {
    unsubscribeFn = await glue.contexts.subscribe(ctxName, contextUpdatedHandler);

    logger.info(`[${formatTime(new Date())}] Subscribed to context "${ctxName}"`);
  } catch (error) {
    logger.error(error.message || `Failed to subscribe to context "${ctxName}"`);
  }
}

function changeToggleButtonText(text) {
  const btn = document.getElementById("toggleContextSubscribeBtn");
  btn.textContent = text;
}
