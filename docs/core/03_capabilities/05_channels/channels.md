## Overview

The channels are globally accessed named contexts that allow users to dynamically group applications, instructing them to work over the same shared data object. The [Channels API](../../../reference/core/latest/channels/index.html) enables applications to:

- discover channels - applications can get the names and contexts of all channels;
- navigate through channels - application can get the current channel, join and leave channels, subscribe for whenever the current channel is changed;
- publish and subscribe - applications can publish data to other applications on the same channel and can subscribe to react to data published by other applications;


Channels are based on Shared Contexts. A context object may contain different types of data, e.g. ids, displayName, etc.:

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

A "Client List" app, for example, can update the context object with data for the selected user (ids, displayName, etc.).
A "Portfolio" app can use the ids to load the portfolio of the client, selected in the "Client List" app by the user. It also can update the shared context object with new values when the user selects different instruments (e.g., the RIC field is updated).

## Initialization

To channel enable your application you need to:

1. Pass `{ channels: true }` on initialization:

    - Vanilla JS (*@glue42/web*):

```javascript
await window.GlueWeb({ channels: true });
```

    - React (*@glue42/react-hooks*):

```javascript
<GlueProvider config={{ channels: true }}>
    ...
</GlueProvider>
```

    - Angular (*@glue42/ng*)

```javascript
Glue42Ng.forRoot({ factory: GlueWeb, config: { channels: true } })
```

2. Inside your `glue.config.json` file you need to provide a `channels` property that defines the channels to be added on initialization. Here's an example:

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


In the next sections, you can see examples of using the Channels API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Discovering and Navigating

The application below demonstrates how to navigate through the channels using the [`join()`](../../../reference/core/latest/channels/index.html#!API-join) and [`leave()`](../../../reference/core/latest/channels/index.html#!API-leave) methods of the Channels API. An application can be part of only one channel at a time. The example application also demonstrates how to get the context of any channel using the [`get()`](../../../reference/core/latest/channels/index.html#!API-get) method. The channel discovery is achieved using the [`list()`](../../../reference/core/latest/channels/index.html#!API-list) method.

The channels are defined inside of glue.config.json with their names, colors and initial contexts. On initialization Glue42Web will read the `glue.config.json`'s channels property and will initialize the registered channels.

Inside the example application the background of the web page reflects the color of the current channel. Clicking on the "Get" button logs the context of the selected channel.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-navigation" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://4nwvx.csb.app/app-a/index.html"></iframe>
</div>

## Publishing and Subscribing

Once multiple applications are on the same channels they can communicate by publishing and subscribing. This is achieved through the shared context data object that the application monitor using [`subscribe()`](../../../reference/core/latest/channels/index.html#!API-subscribe) and/or update using [`publish()`](../../../reference/core/latest/channels/index.html#!API-publish). The callback provided to `subscribe()` is called whenever data is received by another application on the channel the application is currently on. Additionally application can subscribe for changes to channels that they aren't a part of using [`subscribeFor()`](../../../reference/core/latest/channels/index.html#!API-subscribeFor). Data can be published to the current or to a different channel.

When the two applications below are on the same channel App B can publish data that is received and logged by App A if it is subscribed. Note that when the applications aren't on the same channel or when App A isn't subscribed the applications don't exchange any data.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-pub-sub" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://wsdwe.csb.app/app-a/index.html"></iframe>
    <iframe src="https://wsdwe.csb.app/app-b/index.html"></iframe>
</div>

## UI for Channel Selection

To allow the users of your Glue42 Core application to assign the application to a channel you will need to provide them with some sort of UI. Below are examples of channel selector widgets that we developed using the [Channels API](../../../reference/core/latest/channels/index.html) and some of the most popular libraries and frameworks.

Please note that these are only examples. Feel free to use them as they are or as a reference to create your own channel selector widget.

Also note that Glue42 Enterprise ships with a channel selector widget as part of the container of channel enabled applications.

### Vanilla JS (jQuery)

The example below uses [a custom jQuery SelectMenu widget](https://jqueryui.com/selectmenu/#custom_render).

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-vanilla-js-ui" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://gltt6.csb.app/app-a/index.html"></iframe>
</div>

### React

The example below uses [react-select](https://www.npmjs.com/package/react-select).

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-react-ui" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="TODO@GG"></iframe>
</div>

### Angular

The example below uses [@angular/material](https://www.npmjs.com/package/@angular/material).

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/channels/channels-angular-ui" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="TODO@GG"></iframe>
</div>
