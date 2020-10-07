## Overview

The channels are globally accessed named contexts that allow users to dynamically group applications, instructing them to work over the same shared data object. The [Channels API](../../../reference/core/latest/channels/index.html) enables applications to:

- discover channels - applications can get the names and contexts of all channels;
- navigate through channels - application can get the current channel, join and leave channels, subscribe for the event which fires when the current channel has changed;
- publish and subscribe - applications can publish data to other applications on the same channel and can subscribe for channel updates to react to data published by other applications;

Channels are based on Shared Contexts. A context object may contain different types of data, e.g. `ids`, `displayName`, etc.:

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

Different applications on the same channel can use different or the same parts of the data:

A "Client List" app, for example, can update the context object with data for the selected user (`ids`, `displayName`, etc.). A "Portfolio" app can use the `ids` to load the portfolio of the client that the user has selected in the "Client List" app.

## Enabling Channels

To enable the Channels API for your application you need to define channels (channel names and colors) in the `glue.config.json` file of your **Glue42 Core** project and also initialize the [Glue42 Web](../../../reference/core/latest/glue42%20web/index.html) library with a [`Config`](../../../reference/core/latest/glue42%20web/index.html#!Config) object that enables the Channels API.

### Defining Channels

Open the `glue.config.json` file of your project and add a `channels` property. Its value should be an array of objects that describe the channels you want to use. You can define any number of channels. The values for the channel colors can be either HTML color names or hexadecimal color codes. Below you can see an example of defining three channels:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": [
        {
            "name": "Red",
            "meta": {
                "color": "red"
            }
        },
        {
            "name": "Green",
            "meta": {
                "color": "green"
            }
        },
        {
            "name": "Blue",
            "meta": {
                "color": "#66ABFF"
            }
        }
    ]
}
```

### Initializing the Channels API

To enable the Channels API, you have to pass `{ channels: true }` as a configuration object when initializing the [Glue42 Web](../../../reference/core/latest/glue42%20web/index.html) library:

- JavaScript ([@glue42/web](https://www.npmjs.com/package/@glue42/web)) example:

```javascript
await window.GlueWeb({ channels: true });
```

- React ([@glue42/react-hooks](https://www.npmjs.com/package/@glue42/react-hooks)) example:

```javascript
<GlueProvider config={{ channels: true }}>
    ...
</GlueProvider>
```

- Angular ([@glue42/ng](https://www.npmjs.com/package/@glue42/ng)) example:

```javascript
Glue42Ng.forRoot({ factory: GlueWeb, config: { channels: true } })
```

*For detailed information on the Channels API, see the [**Channels**](../../../glue42-concepts/data-sharing-between-apps/channels/javascript/index.html) documentation.*

In the next sections, you can see examples of using the Channels API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Discover and Navigate

The application below demonstrates how to navigate through the available channels using the [`join()`](../../../reference/core/latest/channels/index.html#!API-join) and [`leave()`](../../../reference/core/latest/channels/index.html#!API-leave) methods of the Channels API. An application can be part of only one channel at a time. The example application also demonstrates how to get the context (`name`, `meta`, `data`) of any channel using the [`get()`](../../../reference/core/latest/channels/index.html#!API-get) method. Discovering the available channels is achieved using the [`all()`](../../../reference/core/latest/channels/index.html#!API-all) method.

The background color of the example application reflects the color of the current channel. Click on the "Get" button to log the context data of the selected channel.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-navigation" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://4nwvx.csb.app/app-a/index.html"></iframe>
</div>

## Publish and Subscribe

Once multiple applications are on the same channel, they can communicate by publishing and subscribing data to the channel. This is achieved through the shared context data object that the applications monitor using the [`subscribe()`](../../../reference/core/latest/channels/index.html#!API-subscribe) method of the Channels API and/or update using the [`publish()`](../../../reference/core/latest/channels/index.html#!API-publish) method. The callback provided to `subscribe()` is invoked when the context of the channel that the application is currently on has been updated.

When the two applications below are on the same channel, App B can publish data that is received and logged by App A if it has subscribed for updates of the current channel. Note that if the applications are not on the same channel, or if App A has not subscribed for updates, the applications will not exchange any data.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-pub-sub" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://wsdwe.csb.app/app-a/index.html"></iframe>
    <iframe src="https://wsdwe.csb.app/app-b/index.html"></iframe>
</div>

## Channel Selector UI

To allow the users of your **Glue42 Core** application to use the available channels, you will need to provide them with some sort of UI. Below are examples of Channel Selector widgets developed using the [Channels API](../../../reference/core/latest/channels/index.html) and some of the most popular libraries and frameworks.

*Note that these widgets are only examples. Feel free to use them as they are or as a reference to create your own Channel Selector. **Glue42 Enterprise** ships with a fully functioning Channel Selector that all apps with enabled Glue42 Channels can use.*

### JavaScript

The example below uses a custom [jQuery Selectmenu widget](https://jqueryui.com/selectmenu/#custom_render):

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-vanilla-js-ui" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://gltt6.csb.app/app-a/index.html"></iframe>
</div>

### React

The example below uses [react-select](https://www.npmjs.com/package/react-select):

<a href="https://codesandbox.io/s/glue42-core-channels-react-ui-5xy9i" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://5xy9i.sse.codesandbox.io/"></iframe>
</div>

### Angular

The example below uses [@angular/material](https://www.npmjs.com/package/@angular/material):

<a href="https://codesandbox.io/s/glue42-core-channels-angular-ui-9pub4" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://9pub4.sse.codesandbox.io/"></iframe>
</div>