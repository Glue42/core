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
  try {
    const channelContext = await glue.channels.get(channelName);

    logger.info(`Current channel (${channelName})'s data: ${JSON.stringify(channelContext.data)}`);
  } catch (error) {
    const message = `Failed to get the context of my channel "${channelName}"!`;
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

async function onGetClicked(channelName) {
  try {
    const channelContext = await glue.channels.get(channelName);

    logger.info(`${channelName} channel's data: ${JSON.stringify(channelContext.data)}`);
  } catch (error) {
    const message = `Failed to get the context of channel "${channelName}"!`;
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
      renderChannels(channelNames, channelName, onJoinClicked, onLeaveClicked, onGetClicked);
    });

    // Initial channels rendering.
    renderChannels(channelNames, undefined, onJoinClicked, onLeaveClicked, onGetClicked);
  })
  .then(clearLogsHandler)
  .catch(console.error);
