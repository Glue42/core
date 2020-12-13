## Overview

[FDC3](https://fdc3.finos.org/) aims at developing specific protocols and classifications in order to advance the ability of desktop applications in financial workflows to interoperate in a plug-and-play fashion without prior bilateral agreements.

## FDC3 for Glue42 Core

This guide explains how to run an FDC3 compliant app in a **Glue42 Core** project. For detailed information on the FDC3 API itself, see the [FDC3 documentation](https://fdc3.finos.org/docs/next/api/overview).

### Initialization

The [`@glue42/fdc3`](https://www.npmjs.com/package/@glue42/fdc3) library is the Glue42 implementation of the FDC3 standards. Reference it in your application:

```html
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

The Glue42 FDC3 library determines internally the environment it runs in (**Glue42 Core** or **Glue42 Enterprise**) and initializes the correct Glue42 library - [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) in a **Glue42 Core** project. You don't need to call the `GlueWeb()` factory function. The FDC3 API entry point `fdc3` is available as a property of the global `window` object:

```javascript
fdc3.addContextListener(context => console.log(`Context: ${context}.`));
```

See below how to use the different FDC3 features.

### Intents

The [FDC3 Intents](https://fdc3.finos.org/docs/next/intents/overview) concept enables the creation of cross-application workflows on the desktop. An application declares an Intent through configuration. An Intent specifies what action the application can execute and what data structure it can work with.

In **Glue42 Core**, Intents are defined in the application configuration objects when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../core-concepts/web-platform/overview/index.html). For more details on defining applications, see the [Application Management: Application Definitions](../application-management/index.html#application_definitions) section. Intents can be configured under the `intents` top-level key of the application definition:

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
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

const { glue } = await GlueWebPlatform(config);
```

| Property | Description |
|----------|-------------|
| `name` | **Required**. The name of the Intent. |
| `displayName` | The human readable name of the Intent. Can be used in context menus, etc., to visualize the Intent. |
| `contexts` | The type of predefined data structures with which the application can work (see [FDC3 Contexts](https://fdc3.finos.org/docs/next/context/overview)). |

In order to be able to properly target applications with `raiseIntent()` the applications need to pass their application name to `@glue42/fdc3`. This is needed by the implementation so it can check whether there is a running instance of the targeted application or a new instance has to be started. Because the FDC3 specification doesn't specify any initialization logic, `@glue42/fdc3` relies on a global variable called `fdc3AppName` being present prior to importing `@glue42/fdc3`:

```html
<script>
    window.fdc3AppName = "TradingView Blotter";
</script>
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

*For more information on using intents, see the [FDC3 Intents API](https://fdc3.finos.org/docs/next/intents/overview).*

### Channels

An [FDC3 Channel](https://fdc3.finos.org/docs/next/api/ref/Channel) is a named context object that an application can join in order to share and update context data and also be alerted when the context data changes. By [specification](https://fdc3.finos.org/docs/next/api/spec#context-channels), Channels can either be well-known system Channels or Channels created by apps. On a UI level, Channels can be represented by colors and names.

Channels are defined when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../core-concepts/web-platform/overview/index.html):

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

All Glue42 Channels are available as FDC3 system Channels.

Glue42 Core applications can interact with FDC3 app Channels by using the [Shared Contexts API](../shared-contexts/index.html). For each FDC3 app Channel there is a shared context with the same name. You can use the `get()`, `set()`, `update()` and `subscribe()` methods to interact with it.

*For a sample Channel Selector widget implementation, see the [Channels: Channel Selector UI](../channels/index.html#channel_selector_ui) section, which offers example implementations for the most popular JavaScript frameworks. Note that internally the examples use the **Glue42 Core** Channels API and not the FDC3 Channels API.*

*For more information on using Channels, see the [FDC3 Channels API](https://fdc3.finos.org/docs/next/api/ref/Channel).*

### App Directory

The goal of the [FDC3 App Directory](https://fdc3.finos.org/docs/next/app-directory/overview) REST service is to provide trusted identity for desktop apps. Application definitions are provided by one or more App Directory REST services where user entitlements and security can also be handled.

*Note that the remote sources can supply both **Glue42 Core** and FDC3 application definitions. **Glue42 Core** supports for both. The only requirement for an FDC3 application definition to be usable in **Glue42 Core** is to have a valid `details.url` or a `url` top-level property in its `manifest` JSON string property.*

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