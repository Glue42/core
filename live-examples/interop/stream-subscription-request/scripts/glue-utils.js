/* eslint-disable no-undef */
(function (window) {
  const startApp = async (options) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }

    if (options && options.appName) {
      window.setDocumentTitle(options.appName);
      window.displayAppName(options.appName);
    }

    try {
      const glue = await window.GlueWeb();
      window.glue = glue;
      window.toggleGlueAvailable();

      console.log(`GlueWeb version ${glue.info.version} initialized`);

      return glue;
    } catch (error) {
      console.error('Failed to initialize GlueWeb. Error: ', error);
      throw error;
    }
  };

  window.startApp = startApp;
})(window || {});
