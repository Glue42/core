/* eslint-disable no-undef */
const APP_NAME = 'App-A';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("subscribeStreamBtn")
      .addEventListener('click', subscribeToStreamHandler);
  })
  .catch(console.error);

async function subscribeToStreamHandler() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };

  try {
    const subscription = await glue.interop.subscribe(methodDefinition, { waitTimeoutMs: 3000 });

    subscription.onData(({ data }) => {
      logger.info(data.message);
    });

    logger.info(`Subscribed to ${methodDefinition.name} successfully`);

    const subscribeBtn = document.getElementById('subscribeStreamBtn');
    subscribeBtn.setAttribute('disabled', true);
    subscribeBtn.innerText = 'Subscribed';
  } catch (error) {
    console.error(`Failed to subscribe to "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to subscribe to "${methodDefinition.name}"`);
  }
}
