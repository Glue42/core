/* eslint-disable no-undef */
const APP_NAME = "Application A";

async function onStartClicked(appName) {
  try {
    await glue.appManager.application(appName).start();
    logger.info(`Started App (${appName})!`);
  } catch (error) {
    const message = `Failed to start Application "${appName}"!`;
    console.error(message);
    logger.error(message);
  }
}

async function onStopClicked(instanceId) {
  const instanceToStop = glue.appManager
    .instances()
    .find(instance => instance.id === instanceId);
  try {
    await instanceToStop.stop();
    logger.info(`Stopped Instance "${instanceId}"!`);
  } catch (error) {
    const message = `Failed to stop Instance "${instanceId}"!`;
    console.error(message);
    logger.error(message);
  }
}

const rerenderApplications = applications => {
  const instances = glue.appManager.instances();

  renderApplications(applications, instances, onStartClicked, onStopClicked);
};

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    const applications = glue.appManager.applications();

    glue.appManager.onInstanceStarted(() => {
      rerenderApplications(applications);
    });

    glue.appManager.onInstanceStopped(() => {
      rerenderApplications(applications);
    });

    // Initial applications rendering.
    rerenderApplications(applications);
  })
  .then(clearLogsHandler)
  .catch(console.error);
