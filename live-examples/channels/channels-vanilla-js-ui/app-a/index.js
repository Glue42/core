/* eslint-disable no-undef */
const APP_NAME = "Application A";

// The value that will be displayed inside the channel selector widget to leave the current channel.
const NO_CHANNEL_VALUE = "No channel";

// Get the channel names and colors using the Channels API.
const getChannelNamesAndColours = async () => {
  let channelContexts;

  try {
    channelContexts = await glue.channels.list();
  } catch (error) {
    console.error("Failed to get the channel contexts. Error: ", error);
    logger.error(error.message || "Failed to get the channel contexts.");
  }

  const channelNamesAndColors = channelContexts.map(channelContext => ({
    name: channelContext.name,
    color: channelContext.meta.color
  }));

  return channelNamesAndColors;
};

const onChannelSelected = (channelName) => {
  if (channelName === NO_CHANNEL_VALUE) {
    const myChannel = glue.channels.my();
    if (myChannel) {
      glue.channels
        .leave()
        .then(() => {
          logger.info(`Left channel: ${myChannel}.`);
        })
        .catch(error => {
          console.error(
            `Failed to leave channel: ${myChannel}. Error: `,
            error
          );
          logger.error(
            error.message || `Failed to leave channel: ${myChannel}.`
          );
        });
    }
  } else {
    glue.channels
      .join(channelName)
      .then(() => {
        logger.info(`Joined channel "${channelName}".`);
      })
      .catch(error => {
        console.error(
          `Failed to join channel "${channelName}". Error: `,
          error
        );
        logger.error(
          error.message || `Failed to join channel "${channelName}".`
        );
      });
  }
};

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(getChannelNamesAndColours)
  .then((channelNamesAndColors) => {

    return createChannelSelectorWidget(
      NO_CHANNEL_VALUE,
      channelNamesAndColors,
      onChannelSelected
    );
  })
  .then(() => clearLogsHandler())
  .catch(console.error);
