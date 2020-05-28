/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("methodInvokeBtn")
      .addEventListener('click', invokeGlueMethodHandler);
  })
  .then(clearLogsHandler)
  .catch(console.error);

async function invokeGlueMethodHandler() {
  const methodDefinition = { name: 'G42Core.Basic' };

  try {
    const { returned } = await glue.interop.invoke(methodDefinition);

    logger.info(returned.result);
  } catch (error) {
    console.error(`Failed to invoke "${methodDefinition.name}". Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodDefinition.name}".`);
  }
}
