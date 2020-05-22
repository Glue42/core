## Overview

A **Glue42 Client** is every application which initializes the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library and connects to the [**Glue42 Environment**](../../environment/overview/index.html). There could be one or more Glue42 Clients connected to the same Glue42 Environment on a single domain, which gives them full access to the [Shared Contexts](../../../../reference/core/latest/shared%20contexts/index.html), [Interop](../../../../reference/core/latest/interop/index.html) and [Window Management](../../../../reference/core/latest/windows/index.html) functionalities offered by the **Glue42 Core** platform.

A Glue42 Client can be any web application using JavaScript, React, Angular or any other web framework.

## Initializing a Glue42 Client

Initializing a Glue42 Client means initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library which connects the client application to the [**Glue42 Environment**](../../environment/overview/index.html). The library is initialized with several settings related to the names and locations of the [**Glue42 Environment**](../../environment/overview/index.html) files, as well as application window layout and context save and restore options. The settings used for the initialization of the Glue42 Web library can be:

- the default built-in library settings;
- settings from the *optional* `glue.config.json` file that will override the default library settings;
- settings from the *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object passed to the factory function during initialization that will override the built-in library settings and/or the settings in the `glue.config.json` file;

*More detailed information on how to initialize the Glue42 Web library depending on the framework you are using, you can find in the [**JavaScript**](../javascript/index.html) and [**React**](../react/index.html) guides on how to set up your application.*

### Default and Common Configuration

When no custom initialization options are passed to the factory function, the Glue42 Web library is initialized with the common settings from the `glue.config.json` file (if present) or with its own built-in defaults.

#### Default Settings

Below are the built-in default settings of the Glue42 Web library (which are also the default settings of the `glue.config.json` file):

```javascript
{
    glue: {
        worker: "./worker.js",
        layouts: {
            autoRestore: false,
            autoSaveWindowContext: false
        }
    },
    gateway: {
        location: "./gateway.js"
    }
}
```

*For a detailed explanation of all settings in the optional `glue.config.json` file, see the [Environment: Configuration File](../../environment/overview/index.html#configuration_file) section.* 

#### Common Settings

You can use the `glue.config.json` file to set common configurations for you Glue42 Client applications. This is helpful when you want all or most of your apps to have the same settings when initializing the Glue42 Web library. This way, you avoid passing the same configuration object multiple times to the Glue42 Web library when initializing your Glue42 Client apps. For instance, if your [**Glue42 Environment**](../../environment/overview/index.html) files are at their default locations (so no configuration is necessary for that), but you want the layout and context of your windows to be saved, you need to set the following in the `glue.config.json` file:

```json
{
    "glue": {
        "layouts": {
            "autoRestore": true,
            "autoSaveWindowContext": true
        }
    }
}
```

This configuration will now be used by all Glue42 Client applications that do not provide a [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object during initialization and will override the built-in Glue42 Web library defaults.

### Custom Configuration

There are several scenarios where you may want to tweak the default configuration of the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library:

- You don't have a `glue.config.json` file and want your Glue42 Client applications to connect to the [**Glue42 Environment**](../../environment/overview/index.html) with different custom settings.

- You have a `glue.config.json` with default settings which work for most of your Glue42 Client apps, but you want some of them to use custom settings.

- Your Glue42 Environment files are not located at the default directory - e.g., you decide to keep them in a `"/lib"` folder, instead of in the default `"/glue"` folder. In this case, it is mandatory that you specify the custom path to the Environment files when initializing the Glue42 Web library in your client applications. 

The *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object, which you can pass to the factory function when initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library, has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `extends` | `string \| false` | This property can be used by a Glue42 Client during initialization of the Glue42 Web library to specify a URL for the location of the `glue.config.json` file (e.g., if you want to change the default location of the configuration file). The library will fetch it and use it to extend the built-in configuration defaults. It is recommended to set this to `false` if no configuration file is available. Also set to `false` if you don't want the Glue42 Client app to use the defaults from an existing configuration file. *Note that if you define a custom URL for the configuration file, then the library will expect to find a `worker.js` file in the same directory.* | No | `"/glue/glue.config.json"` |
| `worker` | `string` | Specifies a Shared Worker location. It is recommended for a Glue42 Client app to use this property to define a custom location for the Shared Worker script if `extends` has been set to `false` or if the `glue.config.json` file is not hosted at the default location. *Note that the Shared Worker script **must** be in the same directory as the `glue.config.json` file (if you have provided such file).* | No | `"./worker.js"` |
| `layouts` | `object` | Enable or disable auto restoring windows and/or auto saving window context. | No | `-` |
| `layouts.autoRestore` | `boolean` | If `true`, the set of windows opened by the application will be saved (in local storage) when the window is closed and restored when the application is started again. The saved data about each window includes URL, bounds and window context. | No | `false` |
| `layouts.autoSaveWindowContext` | `boolean` | If `true`, will automatically save the context of the window. | No | `false` |

*Note that if you set `extends` to `false`, then, by default, all clients will try to connect to the worker at `/glue/worker.js`. You need to set the `worker` property, if you want to override the default setting.*

## Configuration Example

Below is an example of a custom configuration for the Glue42 Web library:

```javascript
const initOptions = {

    // Specify a path to an existing `glue.config.json`, 
    // or set to `false` if you don't have a configuration file or 
    // you don't want your app to use the default settings from it.
    extends: false,

    // Specify a path to the Shared Worker script when your
    // Environment files are not at the default location,
    // or if you decide to rename the `worker.js` file to something else.
    worker: "./lib/worker.js",

    // Specify whether to save the application windows layout and context.
    layouts: {
        autoRestore: true,
        autoSaveWindowContext: true
    }
};
```