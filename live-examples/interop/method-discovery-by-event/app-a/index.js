/* eslint-disable no-undef */
const APP_NAME = 'Application A';

const systemMethods = ['GC.Control', 'T42.HC.GetSaveContext'];

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(subscribeToMethodEvents)
  .then(() => {
    document.getElementById("invokeGlueMethodBtn")
      .addEventListener('click', invokeGlueMethodHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);


function subscribeToMethodEvents() {
  glue.interop.serverMethodAdded(({ server, method }) => {
    // Excluded system methods from logs.
    if (!systemMethods.includes(method.name)) {
      logger.info(`Method "${method.name}" registered by "${server.application}".`);
    }
  });

  glue.interop.serverMethodRemoved(({ server, method }) => {
    // Excluded system methods from logs.
    if (!systemMethods.includes(method.name)) {
      logger.info(`Method "${method.name}" unregistered by "${server.application}".`);
    }
  });
}

function invokeGlueMethodHandler() {
  const methodNameInput = document.getElementById('methodNameInput');
  invokeGlueMethod(methodNameInput.value);
  methodNameInput.value = '';
}

async function invokeGlueMethod(methodName) {
  const methodDefinition = { name: methodName };
  const invokeOptions = { waitTimeoutMs: 3000 };

  try {
    // We leave glue to handle whether a method exists.
    const { all_return_values } = await glue.interop.invoke(methodDefinition, null, 'all', invokeOptions);

    (all_return_values || []).forEach(({ returned }) => logger.info(returned.result));
  } catch (error) {
    console.error(`Failed to invoke "${methodName}". Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodName}".`);
  }
}
