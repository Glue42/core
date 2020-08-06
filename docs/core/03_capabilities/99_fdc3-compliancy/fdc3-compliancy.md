## Overview

[FDC3](https://fdc3.finos.org/) aims at developing specific protocols and classifications in order to advance the ability of desktop applications in financial workflows to interoperate in a plug-and-play fashion without prior bilateral agreements.

## FDC3 for Glue42 Core

This guide explains how to run an FDC3 compliant app inside of **Glue42 Core**. For a detailed information on the FDC3 API itself, see the [FDC3 documentation](https://fdc3.finos.org/docs/next/api/overview).

### Configuration

To get your app to run inside of **Glue42 Core** you will first need to setup and configure the **Glue42 Core environment**.

To do this you can either use our CLI assistant `@glue42/cli-core` package (recommended) or, alternatively, you can configure the environment manually.

You can find step by step guides for both inside of the [**Glue42 Environment: Setup**](../../core-concepts/environment/setup/index.html) section.

### Initialization

Reference `@glue42/fdc3`:

```html
<script src="https://unpkg.com/@glue42/fdc3@latest/dist/fdc3-glue42.js"></script>
```

This is our FDC3 implementation. It will internally initialize `@glue42/web`.

There is no need to call a factory function. The FDC3 API entry point `fdc3` is available globally as a property of the `window` object.

```javascript
fdc3.addContextListener((context) => console.log(`Context: ${context}.`));
```

Read on to learn how to take advantage of the different FDC3 features.

### Intents

The [FDC3 Intents](https://fdc3.finos.org/docs/next/intents/overview) concept serves the purpose of enabling the creation of cross-application workflows on the desktop. An application declares an intent through configuration. An "intent" specifies what action the application can execute and what data structure it can work with.

In **Glue42 Core**, intents are defined inside of the application definitions inside of `glue.config.json`.
You can read more inside of our [AppManager documentation](../application-management/index.html#enabling_application_management-application_definitions). Intents can be configured under the `intents` top-level key of the application definition:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "localApplications": [
            {
                "name": "Clients",
                "details": {
                    "url": "http://localhost:4242/clients"
                },
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
        ]
    }
}
```

- `name` - Required. The name of the intent;
- `displayName` - The human readable name of the intent. Can be used in context menus, etc., to visualize the intent;
- `contexts` - Required. The type of predefined data structures that the application can work with (see [FDC3 Contexts](https://fdc3.finos.org/docs/next/context/overview)).

Glue42 Core supports both Glue42 Core as well as FDC3 App Directory local application definitions. The only requirement (besides the required `appId`, `name`, `manifest` and `manifestType` fields) for the FDC3 App Directory application definitions is that they have a `details.url` or a `url` top level property inside of their `manifest` JSON string. Inside of [the App Directory section](#app-directory) you can find an example definition.

*For more information on using intents, see the [FDC3 Intents API](https://fdc3.finos.org/docs/next/intents/overview).*

### Channels

A [FDC3 Channel](https://fdc3.finos.org/docs/next/api/ref/Channel) is a named context object that an application can join in order to share and update context data and also be alerted when the context data changes. By [specification](https://fdc3.finos.org/docs/next/api/spec#context-channels), channels can either be well-known system channels or channels created by apps. On a UI level, channels can be represented by colors and names.

All system defined channels in **Glue42 Core** can be found inside of `glue.config.json`. There you can easily define as many custom channels as you want. For instance, to add a "Purple" channel to the list of system channels, you need to add the following configuration:

```json

{
    "glue": ...,
    "gateway": ...,
    "channels": [
        {
            "name": "Purple",
            "meta": {
                "color": "#6400b0"
            }
        }
    ]
}
```

Now that you have defined the system channels inside of the Glue42 Core environment you might need a UI representation of the channels for your application. Glue42 Core provides you with [sample channel selector widgets](../channels/index.html#channel_selector_ui) for the most popular JavaScript frameworks that you can use (please note that under the hood the example channel selector widgets use the Glue42 Core Channels API and not a FDC3 API).

You can read more about configuring channels and the channel selector widgets inside of the [Channels documentation](../channels/index.html).

### App Directory

The goal of the [FDC3 App Directory](https://fdc3.finos.org/docs/next/app-directory/overview) REST service is to provide trusted identity for desktop apps. Application definitions are provided by one or more App Directory REST services where user entitlements and security can also be handled.

To configure **Glue42 Core** to retrieve application definitions from remote application stores, you need to add a new entry to the `remoteSources` property of the `appManager` top-level key inside of `glue.config.json`:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "remoteSources": [
            {
                "url": "http://localhost:3001/v1/apps/search",
                "pollingInterval": 5000
            }
        ]
    }
}
```

You can use the [Glue42 Environment: Configuration File](../../core-concepts/environment/overview/index.html#configuration_file) section for reference.

Note that the remote sources can supply both Glue42 Core as well as FDC3 App Directory application definitions. Glue42 Core has support for both. The only requirement (besides the required `appId`, `name`, `manifest` and `manifestType` fields) for the FDC3 App Directory application definitions is that they have a `details.url` or a `url` top level property inside of their `manifest` JSON string. Here is an example:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "localApplications": [
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
        ]
    }
}
```

*For more information on using App Directory, see the [FDC3 App Directory documentation](https://fdc3.finos.org/docs/next/app-directory/overview).*

### Demo

You can find an example of the `broadcast` and `addContextListener` API calls implemented by `@glue42/fdc3` [here](https://fdc3-demo.glue42.com).

The demo consists of a Chart and a Blotter application. Searching and selecting a ticker inside the Chart application adds it to the Blotter application as long as the two applications are on the same channel (use the channel selector widget to navigate between channels).

You can use the [code of the demo](https://github.com/Glue42/fdc3-demos/tree/configure-for-glue42-core) as a reference when adapting your own applications.
