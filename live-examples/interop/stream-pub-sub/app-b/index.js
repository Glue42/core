/* eslint-disable no-undef */
const APP_NAME = 'App-B';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(createStream)
  .then(() => {
    document.getElementById("togglePublishingBtn")
      .addEventListener('click', toggleStreamPublishingHandler);
  })
  .catch(console.error);

let stream;
let nextMessageId = 1;
let intervalId;

async function createStream() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };

  try {
    stream = await glue.interop.createStream(methodDefinition)

    logger.info(`Stream "${methodDefinition.name}" created`);
  } catch (error) {
    console.error(`Failed to create stream "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to create stream "${methodDefinition.name}"`);
  }
}

function pushMessage() {
  stream.push(
    {
      message: "Hello from publisher",
      timeStamp: Date.now(),
      counter: nextMessageId
    });

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
