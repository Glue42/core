## Overview

[FDC3](https://fdc3.finos.org/) aims at developing specific protocols and classifications in order to advance the ability of desktop applications in financial workflows to interoperate in a plug-and-play fashion without prior bilateral agreements.

## FDC3 for Glue42 Core

This guide explains how to run an FDC3 compliant app in a **Glue42 Core** project. For detailed information on the FDC3 API itself, see the [FDC3 documentation](https://fdc3.finos.org/docs/next/api/overview).

### Initialization

The [`@glue42/fdc3`](https://www.npmjs.com/package/@glue42/fdc3) library is the Glue42 implementation of the FDC3 standards. Reference it in your application:

```html
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

The Glue42 FDC3 library determines internally the environment it runs in (**Glue42 Core** or **Glue42 Enterprise**) and initializes the correct Glue42 library. In a **Glue42 Core** project that can be either [`@glue42/web-platform`](https://www.npmjs.com/package/@glue42/web-platform) or [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) depending on whether your application is [a Main application](../../core-concepts/web-platform/overview/index.html) or [a web client](../../core-concepts/web-client/overview/index.html). You don't need to call the `GlueWeb()`/`GlueWebPlatform()` factory functions yourself. The FDC3 API entry point `fdc3` is available as a property of the global `window` object:

```javascript
fdc3.addContextListener(context => console.log(`Context: ${context}.`));
```

To provide a platform config to **an FDC3 Main application** you need to attach a `webPlatformConfig` config object to the global `window` object like so before referencing [`@glue42/fdc3`](https://www.npmjs.com/package/@glue42/fdc3):

```html
<script>
    window.webPlatformConfig = {
        applications: {
            local: [
                ...
            ]
        },
        channels: {
            definitions: [
                ...
            ]
        }
    };
</script>
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

*Note: that the config object needs to be named `webPlatformConfig`!*

See below how to use the different FDC3 features.

### Intents

The [FDC3 Intents](https://fdc3.finos.org/docs/next/intents/overview) concept enables the creation of cross-application workflows on the desktop. An application declares an Intent through configuration. An Intent specifies what action the application can execute and what data structure it can work with.

To define Intents add them to the application configuration objects inside of the [Main application's config](../../core-concepts/web-platform/setup/index.html#configuration) or inside of the application definitions provided by a remote source. For more details on defining applications, see the [Application Management: Application Definitions](../application-management/index.html#application_definitions) section. Intents can be configured under the `intents` top-level key of the application definition:

```html
<script>
    window.webPlatformConfig = {
        applications: {
            local: [
                {
                    name: "Clients",
                    details: {
                        url: "http://localhost:4242/clients"
                    },
                    // Intent definitions.
                    intents: [
                        {
                            name: "ShowClientInfo",
                            displayName: "Client Info",
                            contexts: [
                                "ClientName"
                            ]
                        }
                    ]
                }
            ]
        }
    };
</script>
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

| Property | Description |
|----------|-------------|
| `name` | **Required**. The name of the Intent. |
| `displayName` | The human readable name of the Intent. Can be used in context menus, etc., to visualize the Intent. |
| `contexts` | The type of predefined data structures with which the application can work (see [FDC3 Contexts](https://fdc3.finos.org/docs/next/context/overview)). |

*For more information on using intents, see the [FDC3 Intents API](https://fdc3.finos.org/docs/next/intents/overview).*

### Channels

An [FDC3 Channel](https://fdc3.finos.org/docs/next/api/ref/Channel) is a named context object that an application can join in order to share and update context data and also be alerted when the context data changes. By [specification](https://fdc3.finos.org/docs/next/api/spec#context-channels), Channels can either be well-known system Channels or Channels created by apps. On a UI level, Channels can be represented by colors and names.

To define Channels add them to the [Main application's config](../../core-concepts/web-platform/setup/index.html#configuration).

```html
<script>
    window.webPlatformConfig = {
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
</script>
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

All Glue42 Channels are available as FDC3 system Channels.

Glue42 Core applications can interact with FDC3 app Channels by using the [Shared Contexts API](../shared-contexts/index.html). For each FDC3 app Channel there is a shared context with the same name. You can use the `get()`, `set()`, `update()` and `subscribe()` methods to interact with it.

*For a sample Channel Selector widget implementation, see the [Channels: Channel Selector UI](../channels/index.html#channel_selector_ui) section, which offers example implementations for the most popular JavaScript frameworks. Note that internally the examples use the **Glue42 Core** Channels API and not the FDC3 Channels API.*

*For more information on using Channels, see the [FDC3 Channels API](https://fdc3.finos.org/docs/next/api/ref/Channel).*

### App Directory

The goal of the [FDC3 App Directory](https://fdc3.finos.org/docs/next/app-directory/overview) REST service is to provide trusted identity for desktop apps. Application definitions are provided by one or more App Directory REST services where user entitlements and security can also be handled.

To connect to remote sources of applications you need to attach a `remoteSources` config object to the global `window` object like so before referencing [`@glue42/fdc3`](https://www.npmjs.com/package/@glue42/fdc3):

```html
<script>
    window.remoteSources = [
        {
            url: 'http://localhost:3001/v1/apps/search',
            pollingInterval: 1000,
            requestTimeout: 5000
        }
    ];
</script>
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

| Property | Description |
|----------|-------------|
| `url` | **Required**. The url of the remote source of application definitions. The remote source needs to follow the [FDC3 AppDirectory standard](https://github.com/finos/FDC3). The applications provided by the remote need to either be of type Glue42WebApplicationDefinition or FDC3Definition. |
| `pollingInterval` | The polling interval for fetching application definitions from the remote source in milliseconds. Defaults to 3000. |
| `requestTimeout` | The request timeout for fetching application definitions from the remote source in milliseconds. Defaults to 3000. |

*Note: that the config object needs to be named `remoteSources`!*

*Note: that any application can connect to remote sources and not only the Main application. The application definitions from all remote sources are then merged by the Main application.*

*Note: that the remote sources can supply both **Glue42 Core** and FDC3 application definitions. **Glue42 Core** supports for both. The only requirement for an FDC3 application definition to be usable in **Glue42 Core** is to have a valid `details.url` or a `url` top-level property in its `manifest` JSON string property.*

Alternatively you could supply the application definitions locally to the Main application by adding them to `webPlatformConfig.applications.local` (see [Intents](#Intents)).

Below is an example FDC3 application definition:

```json
{
    "name": "Clients",
    "appId": "clients",
    "manifestType": "Glue42",
    "manifest": "{\"details\":{\"url\":\"http://localhost:4242/clients\"}}",
    "intents": [
        {
            "name": "ShowClientInfo",
            "displayName": "Client Info",
            "contexts": [
                "ClientName"
            ]
        }
    ]
}
```

*For more information on using App Directory, see the [FDC3 App Directory documentation](https://fdc3.finos.org/docs/next/app-directory/overview).*

### Demo

Example of the `broadcast()` and `addContextListener()`, `findIntentsByContext()` and `raiseIntent()` API calls implemented by `@glue42/fdc3` are available in [this demo](https://fdc3-demo.glue42.com).

The demo consists of a Chart and a Blotter application. Searching and selecting a ticker inside the Chart application adds it to the Blotter application as long as the two applications are on the same Channel (use the Channel Selector widget to navigate between Channels):

![FDC3 Demo](../../../images/fdc3/fdc3-demo.gif)

Right-clicking on an instrument inside the Blotter opens up a context menu with the intents that can be raised for the instrument. When the chart application is running it would update its context and when there are no instances of the Chart application running it will start a new instance with the given context.

Use the [code of the demo](https://github.com/Glue42/fdc3-demos/tree/adapt-for-glue42) as a reference when adapting your own applications.

#### Extension

Inside of the demo project you will also find [a Chrome extension](https://github.com/Glue42/fdc3-demos/tree/adapt-for-glue42/extension) that auto injects `@glue42/fdc3` inside of all web pages. It can save you time from referencing the implementation inside of all of your projects and redeploying them, but also when integrating with 3rd party closed source applications.

To install the extension simply follow the instructions inside of the [README.md](https://github.com/Glue42/fdc3-demos/blob/adapt-for-glue42/README.md).
