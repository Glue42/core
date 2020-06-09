/* eslint-disable no-undef */
const APP_NAME = "Application B";

// Manually hide the element whenever our application isn't part of any channel as the application can't publish data when the application isn't part of a channel.
const publishButtonElement = document.getElementById("publishButton");

async function onJoinClicked(channelName) {
  try {
    await glue.channels.join(channelName);

    publishButtonElement.classList.remove("d-none");
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

    publishButtonElement.classList.add("d-none");
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
    const onPublishClicked = async () => {
      const data = {
        currentTimeInMS: +new Date()
      };

      try {
        await glue.channels.publish(data);

        logger.error(`Publish data: ${JSON.stringify(data)}!`);
      } catch (error) {
        const message = `Failed to publish data: ${JSON.stringify(data)}!`;
        console.error(message);
        logger.error(message);
      }
    };
    publishButtonElement.onclick = onPublishClicked;

    // Whenever a channel is joined or left rerender the channels.
    glue.channels.onChanged((channelName) => {
      if (channelName) {
        publishButtonElement.classList.remove("d-none");
      } else {
        publishButtonElement.classList.add("d-none");
      }

      renderChannels(
        channelNames,
        channelName,
        onJoinClicked,
        onLeaveClicked
      );
    });

    // Initial channels rendering.
    renderChannels(channelNames, undefined, onJoinClicked, onLeaveClicked);
  })
  .then(clearLogsHandler)
  .catch(console.error);
