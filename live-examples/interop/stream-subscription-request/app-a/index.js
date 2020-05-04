/* eslint-disable no-undef */
const APP_NAME = 'App-A';

// Entry point. Initializes GlueWeb. GlueWeb instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => window.onAppStarted())
  .catch(console.error);
