window.createChannelSelectorWidget = (
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
            value: NO_CHANNEL_VALUE,
            attr: {
                color: ""
            }
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

    // Return a method that would allow the update of the channel programmatically.
    return (channelName) => {
        channelSelectorWidgetElement.val(channelName);
        channelSelectorWidgetElement.channelSelectorWidget('refresh', true);
    };
};
