/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("invokeGlueMethodBtn")
      .addEventListener('click', invokeGlueMethodHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

function invokeGlueMethodHandler() {
  const methodNameInput = document.getElementById('methodNameInput');
  invokeGlueMethod(methodNameInput.value);
  methodNameInput.value = '';
}

async function invokeGlueMethod(methodName) {
  const interop = glue.interop;

  const discoveredMethods = interop.methods({ name: methodName });
  if (discoveredMethods.length === 0) {
    logger.error(`Method with name "${methodName}" has not been registered.`)
    return;
  }

  try {
    const methodDefinition = { name: methodName };
    const invokeOptions = { waitTimeoutMs: 3000 };

    const { all_return_values } = await interop.invoke(methodDefinition, null, 'all', invokeOptions);

    (all_return_values || []).forEach(({ returned }) => logger.info(returned.result));
  } catch (error) {
    console.error(`Failed to invoke "${methodName}". Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodName}".`);
  }
}
