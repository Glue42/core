/* eslint-disable no-undef */
const APP_NAME = 'App-B';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(registerGlueMethod)
  .catch(console.error);

async function registerGlueMethod() {
  const methodDefinition = { name: 'G42Core.Basic' };

  const invocationHandler = () => {
    logger.info(`"${methodDefinition.name}" invoked`);
    return {
      result: 'Hello from the other app'
    };
  };

  try {
    await glue.interop.register(methodDefinition, invocationHandler);

    logger.info(`"${methodDefinition.name}" registered`);
  } catch (error) {
    console.error(`Failed to register method "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to register "${methodDefinition.name}"`);
  }
}
