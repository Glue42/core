/* eslint-disable no-undef */
const APP_NAME = "Application B";

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(subscribeToAppManagerEvents)

  .then(clearLogsHandler)
  .catch(console.error);

function subscribeToAppManagerEvents() {
  const isMyInstance = instanceId =>
    instanceId === glue.appManager.myInstance.id;

  glue.appManager.onInstanceStarted(instance => {
    const instanceId = instance.id;
    const appName = instance.application.name;

    // When it is my window - do not log. Keep the logs list clean.
    if (!isMyInstance(instanceId)) {
      logger.info(`Instance of app ${appName} with id "${instanceId}" started.`);
    }
  });

  glue.appManager.onInstanceStopped(instance => {
    logger.info(`Instance of app ${appName} with id "${instance.id}" stopped.`);
  });
}
