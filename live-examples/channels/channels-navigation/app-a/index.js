/* eslint-disable no-undef */
const APP_NAME = "Application A";

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    return glue.channels.all();
  })
  .then(channelNames => {
    let myChannel = glue.channels.my();
    async function onJoinClicked(channelName) {
      try {
        await glue.channels.join(channelName);
      } catch (error) {
        console.error(`Failed to join channel "${channelName}". Error: `, error);
        logger.error(
          error.message || `Failed to join channel "${channelName}".`
        );
      }
      myChannel = channelName;
      try {
        const channelContext = await glue.channels.get(myChannel);

        logger.info(
          `Current channel (${myChannel})'s data: ${JSON.stringify(
            channelContext.data
          )}`
        );
      } catch (error) {
        console.error(
          `Failed to get the context of my channel "${channelName}". Error: `,
          error
        );
        logger.error(
          error.message ||
          `Failed to get the context of my  channel "${channelName}".`
        );
      }
      renderChannels(
        channelNames,
        myChannel,
        onJoinClicked,
        onLeaveClicked,
        onGetClicked
      );
    }
    async function onLeaveClicked() {
      if (myChannel) {
        try {
          await glue.channels.leave();
        } catch (error) {
          console.error(
            `Failed to leave channel "${myChannel}". Error: `,
            error
          );
          logger.error(
            error.message || `Failed to leave channel "${myChannel}".`
          );
        }
      }
      myChannel = undefined;
      renderChannels(
        channelNames,
        myChannel,
        onJoinClicked,
        onLeaveClicked,
        onGetClicked
      );
    }
    async function onGetClicked(channelName) {
      try {
        const channelContext = await glue.channels.get(channelName);

        logger.info(
          `${channelName} channel's data: ${JSON.stringify(
            channelContext.data
          )}`
        );
      } catch (error) {
        console.error(
          `Failed to get the context of channel "${channelName}". Error: `,
          error
        );
        logger.error(
          error.message ||
          `Failed to get the context of channel "${channelName}".`
        );
      }
    }
    // Support for Glue42 Enterprise. Whenever the container channel selector widget UI is used instead of the join/leave buttons our app should react.
    glue.channels.onChanged((channelName) => {
      myChannel = channelName;

      renderChannels(
        channelNames,
        myChannel,
        onJoinClicked,
        onLeaveClicked,
        onGetClicked
      );
    });
    renderChannels(
      channelNames,
      myChannel,
      onJoinClicked,
      onLeaveClicked,
      onGetClicked
    );
  })
  .then(clearLogsHandler)
  .catch(console.error);
