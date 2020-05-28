/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("registerGlueMethodBtn")
      .addEventListener('click', registerGlueMethodHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

async function registerGlueMethod(methodName) {
  const methodDefinition = { name: methodName };
  const invocationHandler = () => {
    logger.info(`Method "${methodDefinition.name}" invoked.`);
    return {
      result: `Hello from "${methodDefinition.name}" in "${APP_NAME}"!`
    };
  };

  try {
    await glue.interop.register(methodDefinition, invocationHandler)

    logger.info(`Method "${methodDefinition.name}" registered.`);
  } catch (error) {
    console.error(`Failed to register "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to register "${methodDefinition.name}".`);
  }
}

function registerGlueMethodHandler() {
  const methodNameInput = document.getElementById('methodNameInput');
  registerGlueMethod(methodNameInput.value);
  methodNameInput.value = '';
}
