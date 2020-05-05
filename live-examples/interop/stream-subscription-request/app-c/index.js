/* eslint-disable no-undef */
const APP_NAME = 'App C';
const PRIVATE_BRANCH = 'Private';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(createStream)
  .then(() => {
    document.getElementById("pushBtn")
      .addEventListener('click', pushHandler);

    document.getElementById("pushPrivateBtn")
      .addEventListener('click', pushPrivateHandler);
  })
  .catch(console.error);

function subscriptionRequestHandler(request) {
  // A new subscription request is received. Should be accepted or rejected.
  const appName = request.instance.application;
  const infoText = `Subscription request from ${appName}`;

  const li = document.createElement('li');

  const defaultAcceptBtn = createRequestSubscriberButton('Accept', () => {
    // Request is accepted.
    request.accept()

    li.innerHTML = `${infoText} - accepted on the default branch.`;
  });

  const privateAcceptBtn = createRequestSubscriberButton('Accept on Private', () => {
    // Request is accepted on a branch.
    request.acceptOnBranch(PRIVATE_BRANCH);

    li.innerHTML = `${infoText} - accepted on branch "Private".`;
  });

  const rejectBtn = createRequestSubscriberButton('Reject', () => {
    // Request is rejected.
    request.reject();

    li.innerHTML = `${infoText} - rejected from server.`;
  });

  const infoSpan = document.createElement('span');
  infoSpan.textContent = infoText;

  // Display a message on the UI that a new subscription is requested.
  li.classList.add(`list-group-item`);
  li.append(infoSpan, defaultAcceptBtn, privateAcceptBtn, rejectBtn);
  document.getElementById('logs-list').prepend(li);
}

let stream;
let nextMessageId = 1;

async function createStream() {
  const methodDefinition = { name: 'G42Core.Stream.Basic' };
  const streamOptions = {
    subscriptionRequestHandler
  };

  try {
    stream = await glue.interop.createStream(methodDefinition, streamOptions)

    logger.info(`Stream "${methodDefinition.name}" created.`);
  } catch (error) {
    console.error(`Failed to create stream "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to create stream "${methodDefinition.name}".`);
  }
}

function pushHandler() {
  const data = {
    message: "Hello from the stream publisher!",
    timeStamp: Date.now(),
    counter: nextMessageId
  };

  // Pushes the data to all subscribers.
  stream.push(data);

  nextMessageId++;
}

function pushPrivateHandler() {
  const data = {
    message: "Hello from the stream publisher!",
    timeStamp: Date.now(),
    counter: nextMessageId
  };

  // Pushes the data only to subscribers on branch "Private".
  stream.push(data, [PRIVATE_BRANCH]);

  nextMessageId++;
}

function createRequestSubscriberButton(label, handler) {
  const btn = document.createElement('button');
  btn.innerHTML = label;
  btn.classList.add('btn');
  btn.classList.add(`btn-link`);
  btn.classList.add(`btn-sm`);
  btn.addEventListener('click', handler);

  return btn;
}
