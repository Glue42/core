/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(createStream)
  .then(() => {
    document.getElementById("togglePublishingBtn")
      .addEventListener('click', toggleStreamPublishingHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

let stream;
let nextMessageId = 1;
let intervalId;

async function createStream() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };

  try {
    stream = await glue.interop.createStream(methodDefinition)

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

function toggleStreamPublishingHandler() {
  // Publishing messages is active
  if (typeof intervalId === 'number') {
    clearInterval(intervalId);
    intervalId = undefined;

    changeToggleButtonText('Start Publishing');
  } else {
    intervalId = setInterval(pushMessage, 3000);

    changeToggleButtonText('Stop Publishing');
  }
}

function changeToggleButtonText(text) {
  const btn = document.getElementById("togglePublishingBtn");
  btn.textContent = text;
}
