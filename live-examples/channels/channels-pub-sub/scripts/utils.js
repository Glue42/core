/* eslint-disable no-undef */
(function (window) {
  const toggleGlueAvailable = () => {
    document.getElementById("glueImg").src = "/assets/connected.svg";
    document.getElementById("glueSpan").textContent = "Connected";
  };

  const logger = (function logger() {
    function log(type, options) {
      const message = typeof options === "string" ? options : options.message;
      const logTime =
        options != null && options.logTime === false ? false : true;

      const item = document.createElement("li");
      const itemDot = document.createElement("span");
      const div = document.createElement("div");

      div.classList = "align-items-center d-flex flex-grow-1";
      itemDot.style.width = "10px";
      itemDot.style.height = "10px";
      itemDot.style.minWidth = "10px";
      itemDot.style.minHeight = "10px";
      itemDot.classList = "bg-success d-inline-block mr-2 rounded-circle";
      itemDot.classList.add(`bg-${type}`);

      div.append(itemDot);
      div.append(message);

      item.classList =
        "d-flex justify-content-between align-items-center border-top py-1";

      item.append(div);

      if (logTime) {
        const timeSpan = document.createElement("span");
        timeSpan.textContent = `${formatTime(new Date())} `;
        timeSpan.classList = "badge badge-pill";
        item.append(timeSpan);
      }

      document.getElementById("logs-list").prepend(item);
    }

    return {
      info(options) {
        log("", options);
      },
      error(options) {
        log("danger", options);
      },
      clear() {
        const element = document.getElementById("logs-list");
        if (element) {
          element.innerHTML = "";
        }
      }
    };
  })();

  const setDocumentTitle = title => {
    document.title = title;
  };

  const displayAppName = text => {
    const el = document.getElementById("appNameHeading");
    if (el) {
      el.textContent = text;
    }
  };

  const formatTime = date => {
    if (date instanceof Date) {
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    } else {
      return "";
    }
  };

  /*
    elementId - Default value "clearLogsBtn".
   */
  const clearLogsHandler = elementId => {
    elementId = typeof elementId === "string" ? elementId : "clearLogsBtn";
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener("click", logger.clear);
    }
  };

  const renderChannels = async (
    channelNames,
    myChannel,
    onJoinClicked,
    onLeaveClicked
  ) => {
    if (myChannel) {
      try {
        const colorOfMyChannel = (await glue.channels.get(myChannel)).meta
          .color;
        document.body.style.background = colorOfMyChannel;
      } catch (error) {
        const message = `Failed to get the context of my channel "${myChannel}"!`
        console.error(message);
        logger.error(message);
      }
    } else {
      document.body.style.background = "#fff";
    }

    const channelsListElement = document.getElementById("channelsList");
    channelsListElement.innerHTML = "";

    channelNames.forEach(channelName => {
      const rowElement = document.createElement("div");
      rowElement.classList = "row mt-2";

      const channelNameElement = document.createElement("div");
      channelNameElement.classList = "align-self-center pl-3 w-25";
      channelNameElement.textContent = channelName;

      const joinLeaveButtonWrapperElement = document.createElement("div");
      joinLeaveButtonWrapperElement.classList = "d-flex pl-sm-2";

      if (channelName === myChannel) {
        const leaveButtonElement = document.createElement("button");
        leaveButtonElement.classList =
          "btn btn-primary btn-sm border border-dark text-nowrap w-40";
        leaveButtonElement.textContent = "Leave";
        leaveButtonElement.onclick = onLeaveClicked;
        joinLeaveButtonWrapperElement.appendChild(leaveButtonElement);
      } else {
        const joinButtonElement = document.createElement("button");
        joinButtonElement.classList = "btn btn-primary btn-sm border border-dark text-nowrap w-40";
        joinButtonElement.textContent = "Join";
        joinButtonElement.onclick = () => onJoinClicked(channelName);
        joinLeaveButtonWrapperElement.appendChild(joinButtonElement);
      }

      rowElement.appendChild(channelNameElement);
      rowElement.appendChild(joinLeaveButtonWrapperElement);

      channelsListElement.appendChild(rowElement);
    });
  };

  window.logger = logger;
  window.toggleGlueAvailable = toggleGlueAvailable;
  window.setDocumentTitle = setDocumentTitle;
  window.displayAppName = displayAppName;
  window.formatTime = formatTime;
  window.clearLogsHandler = clearLogsHandler;
  window.renderChannels = renderChannels;
})(window || {});
