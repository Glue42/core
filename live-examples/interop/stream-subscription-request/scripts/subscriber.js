(function (window) {

  function onAppStarted() {
    document.getElementById("toggleStreamSubscriptionBtn")
      .addEventListener('click', toggleStreamSubscriptionHandler);
  }

  let subscription;

  function toggleStreamSubscriptionHandler() {
    if (subscription == null) {
      subscribeStream();
    } else {
      subscription.close();
      subscription = null;
    }
  }

  async function subscribeStream() {
    const methodDefinition = { name: 'G42Core.Stream.Basic' };

    try {
      subscription = await glue.interop.subscribe(methodDefinition);

      subscription.onData(({ data }) => {
        logger.info(data.message);
      });

      subscription.onClosed(() => {
        logger.info(`Subscription to "${methodDefinition.name}" closed`);
        subscription = null;
        changeToggleButtonText('Subscribe');
      });

      logger.info(`Subscribed to "${methodDefinition.name}" successfully`);
      changeToggleButtonText('Unsubscribe');
    } catch (error) {
      console.error(`Failed to subscribe to "${methodDefinition.name}". Error: `, error);
      logger.error(error.message || `Failed to subscribe to "${methodDefinition.name}".`);
    }
  }

  function changeToggleButtonText(text) {
    const btn = document.getElementById("toggleStreamSubscriptionBtn");
    btn.textContent = text;
  }

  window.onAppStarted = onAppStarted;
})(window || {});
