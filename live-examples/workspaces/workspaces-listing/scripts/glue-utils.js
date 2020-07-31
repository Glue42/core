/* eslint-disable no-undef */
(function (window) {
  const startApp = async (options) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }

    if (options && options.appName) {
      window.displayAppName(options.appName);
    }

    try {
      const glue = await window.GlueWeb({ libraries: [GlueWorkspaces], application: options.application });
      window.glue = glue;
      window.toggleGlueAvailable();

      return glue;
    } catch (error) {
      console.error('Failed to initialize Glue42 Web. Error: ', error);
      throw error;
    }
  };

  window.startApp = startApp;
})(window || {});
