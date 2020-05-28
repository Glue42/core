/* eslint-disable no-undef */
const APP_NAME = 'Application B';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(subscribeToWindowEvents)

  .then(clearLogsHandler)
  .catch(console.error);

function subscribeToWindowEvents() {
  const isMyWindow = (windowId) => windowId === glue.windows.myWindow.id;

  glue.windows.onWindowAdded((webWindow) => {
    // When it is my window - do not log. Keep the logs list clean.
    if (isMyWindow(webWindow.id) === false) {
      logger.info(`Window with name "${webWindow.id}" opened.`);
    }
  });
}
