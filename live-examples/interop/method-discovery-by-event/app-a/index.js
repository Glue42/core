/* eslint-disable no-undef */
const APP_NAME = 'App-A';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(subscribeToMethodEvents)
  .then(() => {
    document.getElementById("invokeGlueMethodBtn")
      .addEventListener('click', invokeGlueMethodHandler);
  })
  .catch(console.error);


function subscribeToMethodEvents() {
  glue.interop.serverMethodAdded(({ server, method }) => {
    logger.info(`"${method.name}" registered by "${server.application}"`);
  });

  glue.interop.serverMethodRemoved(({ server, method }) => {
    logger.info(`"${method.name}" unregistered by "${server.application}"`);
  });
}

function invokeGlueMethodHandler() {
  const methodNameInput = document.getElementById('methodNameInput');
  invokeGlueMethod(methodNameInput.value);
}

async function invokeGlueMethod(methodName) {
  const methodDefinition = { name: methodName };
  const invokeOptions = { waitTimeoutMs: 3000 };

  try {
    const { all_return_values } = await glue.interop.invoke(methodDefinition, null, 'all', invokeOptions);

    (all_return_values || []).forEach(({ returned }) => logger.info(returned.result));
  } catch (error) {
    console.error(`Failed to invoke "${methodName}". Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodName}"`);
  }
}
