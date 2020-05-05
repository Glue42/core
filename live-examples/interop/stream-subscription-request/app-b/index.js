/* eslint-disable no-undef */
const APP_NAME = 'App B';

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => window.onAppStarted())
  .catch(console.error);
