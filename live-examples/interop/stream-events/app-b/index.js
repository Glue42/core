/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("toggleStreamBtn")
      .addEventListener('click', toggleStreamHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

let stream;
let nextMessageId = 1;
let intervalId;

function toggleStreamHandler() {
  // Publishing messages is active
  if (stream == null) {
    createStream();
    intervalId = setInterval(pushMessage, 3000);

    changeToggleButtonText('Close Stream');
  } else {
    clearInterval(intervalId);
    stream.close();
    stream = null;
    nextMessageId = 1;

    changeToggleButtonText('Create Stream');
  }
}

function subscriptionAddedHandler(subscription) {
  const { instance } = subscription;
  logger.info(`Subscriber "${instance.application}" added.`);
}

function subscriptionRemovedHandler(subscription) {
  const { instance } = subscription;
  logger.info(`Subscriber "${instance.application}" removed.`);
}

async function createStream() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };
  const streamOptions = {
    subscriptionAddedHandler,
    subscriptionRemovedHandler
  };

  try {
    stream = await glue.interop.createStream(methodDefinition, streamOptions)

    logger.info(`Stream "${methodDefinition.name}" created.`);
  } catch (error) {
    console.error(`Failed to create stream "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to create stream "${methodDefinition.name}".`);
  }
}

function pushMessage() {
  const date = new Date();

  stream.push(
    {
      message: `Hello from the stream publisher! Message ${nextMessageId}.`,
      timeStamp: date.getTime(),
      counter: nextMessageId
    });

  logger.info(`Message ${nextMessageId} published.`);

  nextMessageId++;
}

function changeToggleButtonText(text) {
  const btn = document.getElementById("toggleStreamBtn");
  btn.textContent = text;
}
