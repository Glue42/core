/* eslint-disable no-undef */
const APP_NAME = "Application C";

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    const instanceId = window.glue.appManager.myInstance.id;
    document.getElementById("instanceIdText").textContent = instanceId;
  })
  .catch(console.error);
