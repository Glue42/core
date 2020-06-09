/* eslint-disable no-undef */
const APP_NAME = "Application B";

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    return glue.channels.all();
  })
  .then(channelNames => {
    let myChannel = glue.channels.my();

    // Manually hide the element whenever our application isn't part of any channel as the application can't publish data when the application isn't part of any channel.
    const publishButtonElement = document.getElementById("publishButton");
    const onPublishClicked = async () => {
      const data = {
        currentTimeInMS: +new Date()
      };

      try {
        await glue.channels.publish(data);
      } catch (error) {
        console.error(
          `Failed to publish data:
          ${JSON.stringify(data)}
          on channel "${myChannel}". Error: `,
          error
        );
        logger.error(
          error.message ||
          `Failed to publish data:
          ${JSON.stringify(data)}
          on channel "${myChannel}".`
        );
      }
    };
    publishButtonElement.onclick = onPublishClicked;

    async function onJoinClicked(channelName) {
      myChannel = channelName;
      try {
        await glue.channels.join(myChannel);
        publishButtonElement.classList.remove("d-none");
      } catch (error) {
        console.error(`Failed to join channel "${myChannel}". Error: `, error);
        logger.error(
          error.message || `Failed to join channel "${channelName}".`
        );
      }
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
      renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);
    }
    async function onLeaveClicked() {
      if (myChannel) {
        try {
          await glue.channels.leave();
          publishButtonElement.classList.add("d-none");
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
      renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);
    }
    // Support for Glue42 Enterprise. Whenever the container channel selector widget UI is used instead of the join/leave buttons our app should react.
    glue.channels.onChanged((channelName) => {
      myChannel = channelName;

      if (myChannel) {
        publishButtonElement.classList.remove("d-none");
      } else {
        publishButtonElement.classList.add("d-none");
      }

      renderChannels(
        channelNames,
        myChannel,
        onJoinClicked,
        onLeaveClicked
      );
    });

    renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);
  })
  .then(clearLogsHandler)
  .catch(console.error);
