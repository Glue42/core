## Overview

The Glue42 Channels are globally accessed named contexts that allow users to dynamically group applications, instructing them to work over the same shared data object. The [Channels API](../../../reference/core/latest/channels/index.html) enables you to:

- discover Channels - get the names and contexts of all Channels;
- navigate through Channels - get the current Channel, join and leave Channels, subscribe for the event which fires when the current Channel has changed;
- publish and subscribe - publish data to other applications on the same Channel and subscribe for Channel updates to react to data published by other applications;

Channels are based on [Shared Contexts](../shared-contexts/index.html). A context object may contain different types of data, e.g. `ids`, `displayName`, etc.:

```json
{
    "contact": {
        "ids": [
            {
                "systemName": "g42sfId",
                "nativeId": "0031r00002IukOxAAJ"
            },
            {
                "systemName": "rest.id",
                "nativeId": "0e23375b-dd4f-456a-b034-98ee879f0eff"
            }
        ],
        "displayName": "Nola Rios",
        "name": {
            "lastName": "Rios",
            "firstName": "Nola",
            "otherNames": null,
            "honorific": "Ms.",
            "postNominalLetters": null
        }
    }
}
```

Different applications on the same Channel may use different parts of the data. A "Client List" app, for example, may update the context object with data for the selected user (`ids`, `displayName`, etc.). A "Portfolio" app may use the `ids` to load the portfolio of the client that the user has selected in the "Client List" app.

## Defining Channels

The Glue42 Channels are enabled by default for all applications in a [**Glue42 Core**](https://glue42.com/core/) project. If you decide to migrate your app to [**Glue42 Enterprise**](https://glue42.com/enterprise/), no code change will be necessary as the Glue42 Channels will be automatically enabled for your app there as well.

Use the `channels` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../../developers/core-concepts/web-platform/overview/index.html) to define the Channels that will be available for your project:

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    channels: {
        // Channel definitions.
        definitions: [
            {
                name: "Red",
                meta: {
                    color: "red"
                },
                data: { glue: 42 }
            },
            {
                name: "Green",
                meta: {
                    color: "#008000"
                }
            }
        ]
    }
};

const { glue } = await GlueWebPlatform(config);
```

The only required properties in a Channel definition object are `name` and `color`. The `color` property expects an HTML color name or a hex value. You can add any number of additional custom properties to the `meta` object. The `data` property holds context data specific to the Channel.

The [Live Examples](#live_examples) section demonstrates using the Channels API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io). 

## Current Channel

The Channels API is accessible through the [`glue.channels`](../../../reference/core/latest/channels/index.html) object.

To get the name of the Channel your application is currently on, use the [`my()`](../../../reference/core/latest/channels/index.html#API-my) method:

```javascript
const myChannel = glue.channels.my();
```

## All Channels

To get a list of all Channel names, use the [`all()`](../../../reference/core/latest/channels/index.html#API-all) method:

```javascript
const channelNames = await glue.channels.all();
```

## Joining or Leaving a Channel

To make your application join a Channel programmatically, use the [`join()`](../../../reference/core/latest/channels/index.html#API-join) method and specify the name of the Channel to join:

```javascript
await glue.channels.join("Red");
```

To leave the Channel your application is currently on, use the [`leave()`](../../../reference/core/latest/channels/index.html#API-leave) method:

```javascript
await glue.channels.leave();
```

## Retrieving Channel Context

To get the context of a Channel, use the [`get()`](../../../reference/core/latest/channels/index.html#API-get) method which accepts a Channel name as a required parameter:

```javascript
const data = await glue.channels.get("Green");
```

To get a list of the contexts of all Channels, use the [`list()`](../../../reference/core/latest/channels/index.html#API-list) method:

```javascript
const channelContexts = await glue.channels.list();
```

## Subscribing for Data

To track the data in the current Channel, use the [`subscribe()`](../../../reference/core/latest/channels/index.html#API-subscribe) method:

```javascript
const handler = (data, channelInfo) => {
    // The callback will be invoked each time the data is updated.
    console.log(data);
};

// Subscribe for updates from the Channel your application is currently on.
glue.channels.subscribe(handler);
```

The callback receives the data from the Channel and information about the current Channel.

The callback will be invoked in three cases:
- the `data` property of the Channel you are currently on is updated;
- the user has switched the Channel and you are receiving a snapshot of the new Channel data; 
- your app is not joined to a Channel anymore (e.g., the user has deselected the current Channel). In this case, both `data` and `channelInfo` will be `undefined`;

To subscribe for updates from a specific Channel, use the [`subscribeFor()`](../../../reference/core/latest/channels/index.html#API-subscribeFor) method:

```javascript
const channelName = "Green";
const handler = (data, channelInfo) => {
    // The callback will be invoked each time the data is updated.
    console.log(data);
};

await glue.channels.subscribeFor(channelName, handler);
```

The `subscribeFor()` method accepts a Channel name as a first parameter and a callback to handle Channel data updates. 

Use the unsubscribe function returned by `subscribe()` and `subscribeFor()` to stop tracking updates of the Channel data:

```javascript
const unsubscribe = await glue.channels.subscribeFor(channelName, handler);

unsubscribe();
```

## Publishing Data

To update the context of the Channel, use [`publish()`](../../../reference/core/latest/channels/index.html#API-publish). The `publish()` method accepts two parameters - data to publish (required) and an optional Channel ID specifying which Channel context to update. If you do not specify a Channel ID, the current Channel will be updated.

Updating the current Channel:

```javascript
const data = { RIC: "VOD.L" };

await glue.channels.publish(data);
```

Updating a specific Channel:

```javascript
const data = { RIC: "VOD.L" };
const channelName = "Green";

await glue.channels.publish(data, channelName);
```

Note that a Channel may contain multiple data structures, e.g. `RIC` and `clientId`. When executing the code above, only the `RIC` field will be updated, leaving the other fields of the context unchanged.

The [`publish()`](../../../reference/core/latest/channels/index.html#API-publish) method will throw an exception if you are not on a Channel and try to publish data.

## Channel Events

If you want to monitor how your app moves between Channels, subscribe for updates with the [`onChanged()`](../../../reference/core/latest/channels/index.html#API-onChanged) method:

```javascript
const handler = (newChannel) => {
    if (newChannel) {
        // Handle the case where you have switched to another Channel.
        console.log(newChannel);
    } else {
        // Handle the case where your app is not joined to any Channel 
        // (e.g., the user has deselected the current Channel).
        console.log("No Channel selected.")
    };
};

glue.channels.onChanged(handler);
```

## Live Examples

### Discover and Navigate

The application below demonstrates how to navigate through the available Channels using the [`join()`](../../../reference/core/latest/channels/index.html#API-join) and [`leave()`](../../../reference/core/latest/channels/index.html#API-leave) methods of the Channels API. An application can be part of only one Channel at a time. The example application also demonstrates how to get the context (`name`, `meta`, `data`) of any Channel using the [`get()`](../../../reference/core/latest/channels/index.html#API-get) method. Discovering the available Channels is achieved using the [`all()`](../../../reference/core/latest/channels/index.html#API-all) method.

The background color of the example application reflects the color of the current Channel. Click on the "Get" button to log the context data of the selected Channel.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-navigation" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://4nwvx.csb.app" style="border: none;"></iframe>
</div>

### Publish and Subscribe

Once multiple applications are on the same Channel, they can communicate by publishing and subscribing data to the Channel. This is achieved through the shared context data object that the applications monitor using the [`subscribe()`](../../../reference/core/latest/channels/index.html#API-subscribe) method of the Channels API and/or update using the [`publish()`](../../../reference/core/latest/channels/index.html#API-publish) method. The callback provided to `subscribe()` is invoked when the context of the Channel that the application is currently on has been updated.

When the two applications below are on the same Channel, App B can publish data that is received and logged by App A if it has subscribed for updates of the current Channel. Note that if the applications are not on the same Channel, or if App A has not subscribed for updates, the applications will not exchange any data.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-pub-sub" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://wsdwe.csb.app" style="border: none;"></iframe>
</div>

### Channel Selector UI

To allow the users of your [**Glue42 Core**](https://glue42.com/core/) application to use the available Channels, you will need to provide them with some sort of UI. Below are examples of Channel Selector widgets developed using the [Channels API](../../../reference/core/latest/channels/index.html) and some of the most popular libraries and frameworks.

*Note that these widgets are only examples. Feel free to use them as they are or as a reference to create your own Channel Selector. [**Glue42 Enterprise**](https://glue42.com/enterprise/) ships with a fully functioning Channel Selector that all apps with enabled Glue42 Channels can use.*

#### JavaScript

The example below uses a custom [jQuery Selectmenu widget](https://jqueryui.com/selectmenu/#custom_render):

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-vanilla-js-ui" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://gltt6.csb.app" style="border: none;"></iframe>
</div>

## Reference

[Channels API Reference](../../../reference/core/latest/channels/index.html) 
