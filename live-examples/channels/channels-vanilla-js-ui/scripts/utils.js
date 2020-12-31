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

  const createChannelSelectorWidget = (
    NO_CHANNEL_VALUE,
    channelNamesAndColors,
    onChannelSelected
  ) => {

    // Create a custom channel selector widget.
    $.widget("custom.channelSelectorWidget", $.ui.selectmenu, {
      // Create a button that will have the background of the current channel.
      _renderButtonItem: item => {
        const buttonItem = $("<span>", {
          class: "ui-selectmenu-text",
          html: "🔗"
        }).css({
          textAlign: "center"
        });

        const color = item.element.attr("color") || "#f5f5f5";;
        const channelSelectorWidgetButtonElement = $("#channel-selector-widget-button");
        channelSelectorWidgetButtonElement.css('background-color', color);

        return buttonItem;
      },
      // Inside the channel selector widget menu display an item for each channel that has the channel name and color.
      _renderItem: (ul, item) => {
        const li = $("<li>");
        const wrapper = $("<div>", {
          text: item.value
        }).css("padding", "2px 0 2px 48px");
        $("<span>", {
          class: "icon"
        })
          .css({
            backgroundColor: item.element.attr("color"),
            position: "absolute",
            bottom: 0,
            left: "3px",
            margin: "auto 0",
            height: "24px",
            width: "24px",
            top: "1px"
          })
          .appendTo(wrapper);

        return li.append(wrapper).appendTo(ul);
      }
    });

    const channelSelectorWidgetElement = $("#channel-selector-widget");

    channelSelectorWidgetElement.channelSelectorWidget({
      // Whenever an item inside the channel selector widget menu is selected join the corresponding channel (or leave the current channel if NO_CHANNEL_VALUE is selected).
      select: (event, ui) => {
        // Do not call onChannelSelected when the channel is changed programmatically.
        if (event.originalEvent.type === "menuselect") {
          onChannelSelected(ui.item.value);
        }
      }
    });

    $("#channel-selector-widget-button").css({
      width: "148px",
      height: "28px",
      alignSelf: "center",
      padding: 0
    });

    // Add the option to leave the current channel.
    channelSelectorWidgetElement.append(
      $("<option>", {
        value: NO_CHANNEL_VALUE
      })
    );

    // Add an item for each channel to the channel selector widget menu.
    $.each(channelNamesAndColors, (_, channelNameAndColor) => {
      channelSelectorWidgetElement.append(
        $("<option>", {
          value: channelNameAndColor.name,
          attr: {
            color: channelNameAndColor.color
          }
        })
      );
    });
  };

  window.logger = logger;
  window.toggleGlueAvailable = toggleGlueAvailable;
  window.setDocumentTitle = setDocumentTitle;
  window.displayAppName = displayAppName;
  window.formatTime = formatTime;
  window.clearLogsHandler = clearLogsHandler;
  window.createChannelSelectorWidget = createChannelSelectorWidget;
})(window || {});
