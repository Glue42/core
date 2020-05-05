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

      console.log(`Glue42 Web version ${glue.info.version} initialized.`);

      return glue;
    } catch (error) {
      console.error('Failed to initialize Glue42 Web. Error: ', error);
      throw error;
    }
  };

  window.startApp = startApp;
})(window || {});
