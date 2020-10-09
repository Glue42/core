## Overview

The Glue42 Environment is a set of JavaScript and JSON files. These files must be hosted at the same domain as your applications in order for your applications to have access to **Glue42 Core** functionalities. This set of files is not application-specific, but rather - domain-specific.

The Glue42 Environment consists of the following files:

- [**Configuration File**](#configuration_file) (`glue.config.json`) - an *optional* JSON configuration file that is used to define **Glue42 Core** settings and defaults;
- [**Workspace Layouts**](#workspace_layouts) (`glue.layouts.json`) - a file containing definitions of [**Workspaces**](../../../capabilities/workspaces/index.html) layouts;
- [**Workspaces App**](#workspaces_app) - a directory containing the Workspaces App which is used to open and handle Workspaces;
- [**Glue42 Gateway**](#glue42_gateway) - a script that handles the communication between all [**Glue42 Clients**](../../glue42-client/overview/index.html);
- [**Shared Worker**](#shared_worker) - a [Shared Worker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) that functions as a central point to which all [**Glue42 Clients**](../../glue42-client/overview/index.html) to connect;

Environment requirements:

- all files must be hosted on the same domain as your applications;
- all files must be served from a path easily accessible by all [**Glue42 Clients**](../glue42-client/index.html);
- all files must be located at the same level in the same directory;

All files are described in more detail below. For step-by-step guides and examples on how to set up the Environment files depending on your project requirements, see the [**Glue42 Environment: Setup**](../setup/index.html) section.

## Configuration File

This is an *optional* JSON file containing a [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object with general **Glue42 Core** settings, Glue42 Gateway settings and shared configuration settings to be used by all [**Glue42 Clients**](../../glue42-client/overview/index.html) on this domain. If you provide a configuration file, then it **must** be named `glue.config.json`.

Each Glue42 Client app can initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library with its own [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object which will override the default settings specified in the `glue.config.json` file (see [Initializing a Glue42 Client](../../glue42-client/overview/index.html#initializing_a_glue42_client)).

If a `glue.config.json` file is not present, then all Glue42 Clients will initialize using the default library settings and will try to connect to the Shared Worker at the default location at `/glue/worker.js`. The Shared Worker will also try to connect to the Glue42 Gateway at the default location at `/glue/gateway.js`.

Below you can see the default content and settings of the `glue.config.json` file:

```json
{
    "glue": {
        "layouts": {
            "autoRestore": false,
            "autoSaveWindowContext": false
        },
        "channels": false,
        "appManager": false,
        "assets": {
            "location": "/glue"
        }
    },
    "gateway": {},
    "appManager": {},
    "channels": []
}
```

- `glue` - An *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object that is used as a common setting when the [**Glue42 Clients**](../../glue42-client/overview/index.html) on this domain initialize the Glue42 Web library. Each client can define its own [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object with initialization options, which will override the common settings in the `glue.config.json`.

The `glue` top-level key has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `layouts` | `object` | Enable or disable auto restoring windows and/or auto saving window context. | No | `-` |
| `layouts.autoRestore` | `boolean` | If `true`, the set of windows opened by the application will be saved (in local storage) when the window is closed and restored when the application is started again. The saved data about each window includes URL, bounds and window context. | No | `false` |
| `layouts.autoSaveWindowContext` | `boolean` | If `true`, will automatically save the context of the window. | No | `false` |
| `channels` | `boolean` | Whether to enable the [Channels API](../../../../reference/core/latest/channels/index.html). | No | `false` |
| `appManager` | `boolean` | Whether to enable the [Application Management API](../../../../reference/core/latest/appmanager/index.html). | No | `false` |
| `assets` | `object` | Specifies the location of all Glue42 Environment files. It is recommended for a Glue42 Client app to use this property to define a custom location for the Glue42 Environment files, if the Glue42 Environment files are not hosted at the default location. | No | `-` |
| `assets.location` | `string` | Defines the location of the **Glue42 Core** assets bundle (configuration file, layouts file, Workspaces App, etc.) | No | `"/glue"` |
| `assets.extendConfig` | `boolean` | Whether to use the settings in the `glue` object of the `glue.config.json` file when initializing a [**Glue42 Client**](../../glue42-client/overview/index.html) application. Set to `false` if your project does not have a `glue.config.json` file, or if you want to initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library in this specific app with custom settings. | No | `true` |

- `gateway` - An *optional* configuration object that defines settings used by the Shared Worker in order to initialize the Glue42 Gateway.

The `gateway` top-level key has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `location` | `string` | The location of the Glue42 Gateway script. | No | `"./gateway.js"` |
| `logging` | `object` | Set the logging level and a log appender for the Glue42 Gateway. | No | `-` |
| `logging.level` | `string` | Defines the log level. Can be one of: `"trace" \| "debug" \| "info" \| "warn" \| "error"`. | No | `"info"` |
| `logging.appender` | `object` | Defines a custom log appender. | No | `-` |
| `appender.location` | `string` | The location of the log appender script. | Yes | `-` |
| `appender.name` | `string` | The name of the logging function defined in the log appender script. | Yes | `-` |

For more information on defining a custom log appender, see the [Advanced Setup](../setup/index.html#advanced) section.

- `channels` - An *optional* configuration property that defines all available [color channels](../../../capabilities/channels/index.html) the applications can use. Each channel has a name, color and initial contexts. The configuration for the channels is shared between all applications.

The shape of the `channels` property is the same as the one in the [**Glue42 Enterprise: Channels Configuration**](../../../../developers/configuration/channels/index.html#channels_configuration) section.

- `appManager` - An *optional* configuration property that holds the local application definitions and defines the remote sources of application definitions.

The `appManager` top-level key has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `localApplications` | `Glue42CoreApplicationConfig[]` | The local application definitions. | No | `[]` |
| `remoteSources` | `RemoteSource[]` | The remote sources of application definitions. | No | `[]` |

A `Glue42CoreApplicationConfig` has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `name` | `string` | Application name. Must be unique. | Yes | `-` |
| `title` | `string` | The title of the application. Sets the window title. | No | `""` |
| `version` | `string` | The version of the application. | No | `""` |
| `icon` | `string` | The icon application. | No | `""` |
| `caption` | `string` | The caption of the application. | No | `""` |
| `details` | `object` | Detailed configuration. Has the same shape as the [CreateOptions](../../../../reference/core/latest/windows/index.html#!CreateOptions) object and must have a defined `url` field. | Yes | `-` |
| `customProperties` | `object` | Generic object for passing properties, settings, etc., in the form of key/value pairs. Accessed using the [`userProperties`](../../../../reference/core/latest/appmanager/index.html#!Application-userProperties) property of the `application` object. | No | `{}` |

A `RemoteSource` has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `url` | `string` | The URL of the remote source of application definitions. The provided application definitions need to be of type `Glue42CoreApplicationConfig`. | Yes | `-` |
| `pollingInterval` | `number` | The polling interval for fetching application definitions from the remote source. | No | `3000` |

The expected response from the remote application store is in JSON format and with the following shape:

```json
{
    "message": "OK",
    "applications": [
        {
            "name": "Clients",
            "details": {
                "url": "http://localhost:4242/clients"
            }
        },
        {
            "name": "Stocks",
            "details": {
                "url": "http://localhost:4242/stocks",
                "left": 0,
                "top": 0,
                "width": 860,
                "height": 600
            }
        }
    ]
}
```

If the response contains invalid application definitions, a warning will be displayed in the application console. The application name serves as an identifier and must be unique across all application definitions.

Below is an example configuration for defining local and remote application definitions:

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
                }
            },
            {
                "name": "Stocks",
                "details": {
                    "url": "http://localhost:4242/stocks",
                    "left": 0,
                    "top": 0,
                    "width": 860,
                    "height": 600
                }
            }
        ],
        "remoteSources": [
            {
                "url": "http://localhost:3001/v1/apps/search",
                "pollingInterval": 5000
            }
        ]
    }
}
```

## Workspace Layouts

The `glue.layouts.json` file contains layout definitions of [**Workspaces**](../../../capabilities/workspaces/index.html). These definitions are used for restoring a previously saved Workspace. All Workspaces layouts must be defined in the `workspaces` top-level array of the `glue.layouts.json` file:

```json
{
    "workspaces": [
        // Workspace layout definition
        {
            "name": "my-workspace",
            "type": "Workspace",
            "components": [
                ...
            ]
        }
    ]
}
```

## Workspaces App

The `/workspaces` directory contains the files of the Workspaces App. This app is a Progressive Web App and is used to open and handle Workspaces. The `workspaces.webmanifest` file inside this directory is the application manifest file that defines the Workspaces App as a PWA. If your **Glue42 Core** project is not using Workspaces, this directory will not be created by the [Glue42 CLI](../../cli/index.html) when you build the project.

### Customization

You can customize the Workspaces App by providing custom CSS files for the app and for its popup windows (menus). Your custom CSS will be injected in the Workspaces App after all other styles. When you build your project, the custom CSS files will be automatically bundled with the production-ready build of the Workspaces App.

To add your custom CSS files for the Workspaces App and/or for its popup windows, specify their location in the `glue.config.dev.json` file using the `frameCss` and `popupsCss` properties of the `glueAssets.workspaces` object:

```json
{
    "glueAssets": {
        ...
        "workspaces": {
            ...
            "frameCss": "./custom-frame.css",
            "popupsCss": "./custom-popups.css"
        }
    },
    "server": ...,
    "logging": ...
}
```

Restart the development server if running for the changes to take effect.

## Glue42 Gateway

The Glue42 Gateway is the backbone of the **Glue42 Core** environment. It facilitates the communication between all Glue42 Clients and is initialized by the Shared Worker. There are several configuration options for the Glue42 Gateway which you can set from the optional `glue.config.json` file.

## Shared Worker

The [Shared Worker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) instance is the central point to which all [**Glue42 Clients**](../../glue42-client/overview/index.html) connect when initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) Javascript library. It is responsible for configuring, initializing and linking the Glue42 Clients to the Glue42 Gateway. The Shared Worker retrieves the user-defined settings for the Glue42 Gateway from the `glue.config.json` configuration file.
