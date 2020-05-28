/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("toggleStreamSubscriptionBtn")
      .addEventListener('click', toggleStreamSubscriptionHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

let subscription;

function toggleStreamSubscriptionHandler() {
  if (subscription == null) {
    subscribeToStream();
  } else {
    subscription.close();
    subscription = null;
  }
}

async function subscribeToStream() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };
  const subscribeOptions = { waitTimeoutMs: 3000 };

  try {
    subscription = await glue.interop.subscribe(methodDefinition, subscribeOptions);

    subscription.onData(({ data }) => {
      logger.info(data.message);
    });

    subscription.onClosed(() => {
      logger.info(`Subscription to "${methodDefinition.name}" closed.`);
      subscription = null;
      changeToggleButtonText('Subscribe');
    });

    logger.info(`Subscribed to ${methodDefinition.name} successfully.`);
    changeToggleButtonText('Unsubscribe');
  } catch (error) {
    console.error(`Failed to subscribe to "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to subscribe to "${methodDefinition.name}".`);
  }
}

function changeToggleButtonText(text) {
  const btn = document.getElementById("toggleStreamSubscriptionBtn");
  btn.textContent = text;
}
