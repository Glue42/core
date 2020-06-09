/* eslint-disable no-undef */
const APP_NAME = "Application A";

async function onJoinClicked(channelName) {
  try {
    await glue.channels.join(channelName);
  } catch (error) {
    const message = `Failed to join channel "${channelName}"!`;
    console.error(message);
    logger.error(message);
  }
}

async function onLeaveClicked() {
  const myChannel = glue.windows.my();

  try {
    await glue.channels.leave();
  } catch (error) {
    const message = `Failed to leave channel "${myChannel}"!`;
    console.error(message);
    logger.error(message);
  }
}

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    return glue.channels.all();
  })
  .then(channelNames => {
    // Whenever a channel is joined or left rerender the channels.
    glue.channels.onChanged((channelName) => {
      renderChannels(channelNames, channelName, onJoinClicked, onLeaveClicked);
    });

    // Initial channels rendering.
    renderChannels(channelNames, undefined, onJoinClicked, onLeaveClicked);

    let subscribed = false;
    let unsubscribeFunc;

    const subscribeUnsubscribeButtonElement = document.getElementById("subscribeUnsubscribeButton");
    const SUBSCRIBE_BUTTON_TEXTCONTENT = "Subscribe for current channel";
    const UNSUBSCRIBE_BUTTON_TEXTCONTENT = "Unsubscribe";
    subscribeUnsubscribeButtonElement.textContent = SUBSCRIBE_BUTTON_TEXTCONTENT;
    subscribeUnsubscribeButtonElement.onclick = async () => {
      subscribed = !subscribed;
      if (subscribed) {
        try {
          const subscribeCallback = (data, context) => {
            const currentTimeInMS = data.currentTimeInMS;
            let message;

            if (currentTimeInMS) {
              message = `Received new time: ${currentTimeInMS}`;
            } else {
              const channelName = context.name;
              message = `No time currently on channel ${channelName}.`;
            }

            logger.info(message);
          };
          unsubscribeFunc = await glue.channels.subscribe(subscribeCallback);
        } catch (error) {
          const message = `Failed to subscribe!`;
          console.error(message);
          logger.error(message);
        }
        subscribeUnsubscribeButtonElement.textContent = UNSUBSCRIBE_BUTTON_TEXTCONTENT;
      } else {
        unsubscribeFunc();
        subscribeUnsubscribeButtonElement.textContent = SUBSCRIBE_BUTTON_TEXTCONTENT;
      }
    };
  })
  .then(clearLogsHandler)
  .catch(console.error);
