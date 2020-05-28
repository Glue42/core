/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(registerGlueMethod)
  .then(clearLogsHandler)
  .catch(console.error);

async function registerGlueMethod() {
  const methodDefinition = { name: 'G42Core.Basic' };

  const invocationHandler = () => {
    logger.info(`Method "${methodDefinition.name}" invoked.`);
    return {
      result: `Hello from "${APP_NAME}"!`
    };
  };

  try {
    await glue.interop.register(methodDefinition, invocationHandler);

    logger.info(`Method "${methodDefinition.name}" registered.`);
  } catch (error) {
    console.error(`Failed to register "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to register "${methodDefinition.name}".`);
  }
}
