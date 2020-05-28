/* eslint-disable no-undef */
const APP_NAME = 'Application A';
const methodDefinition = { name: 'G42Core.Basic' };

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    document.getElementById("defaultInvokeBtn")
      .addEventListener('click', invokeGlueMethodWithDefaultOption);

    document.getElementById("allInvokeBtn")
      .addEventListener('click', invokeGlueMethodWithTargetAll);

    document.getElementById("appBInvokeBtn")
      .addEventListener('click', () => invokeGlueMethodWithTargetInstance('Application B'));

    document.getElementById("appCInvokeBtn")
      .addEventListener('click', () => invokeGlueMethodWithTargetInstance('App C'));
  })
  .then(clearLogsHandler)
  .catch(console.error);

async function invokeGlueMethodWithDefaultOption() {
  try {
    const { returned } = await glue.interop.invoke(methodDefinition);

    logger.info(returned.result);
  } catch (error) {
    console.error(`Failed to invoke "${methodDefinition.name}" with default target. Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodDefinition.name}" with default target`);
  }
}

async function invokeGlueMethodWithTargetAll() {
  try {
    const { all_return_values } = await glue.interop.invoke(methodDefinition, null, 'all');

    (all_return_values || []).forEach(({ returned: { result } }) => logger.info(result));
  } catch (error) {
    console.error(`Failed to invoke "${methodDefinition.name}" with target "all". Error: `, error);
    logger.error(error.message || `Failed to invoke "${methodDefinition.name}" with target "all".`);
  }
}

async function invokeGlueMethodWithTargetInstance(serverName) {
  const targetServer = glue.interop.servers()
    .find(({ application }) => application.startsWith(serverName));

  if (targetServer == null) {
    logger.error(`Server with name "${serverName}" has not been found.`);
    return;
  }

  try {

    // A server with serverName exists. Try to invoke the method on it.
    const { returned } = await glue.interop.invoke(methodDefinition, null, targetServer);

    logger.info(returned.result);
  } catch (error) {
    console.error(`Failed to invoke "${methodDefinition.name}" on server "${targetServer.application}". Error: `, error);
    logger.error(error.message || `Failed to invoke method "${methodDefinition.name}" on server "${targetServer.application}".`);
  }
}
