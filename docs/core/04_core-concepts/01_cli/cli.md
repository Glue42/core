## Overview

The **Glue42 CLI** is a command line tool designed to simplify your development process with **Glue42 Core**. The Glue42 CLI provides the following basic commands:

- `init` - quickly sets up your project with the necessary configurations and dependencies;
- `serve` - launches a dev server which acts as a reverse proxy for your locally served applications;
- `build` - bundles all the necessary **Glue42 Core** files into one convenient folder that is ready for deployment;
- `version` - returns the currently installed version of the Glue42 CLI;

## Installation

Installing the Glue42 CLI using `npm`:

```cmd
npm install -g @glue42/cli-core
```

## Commands

The Glue42 CLI offers several basic commands with no additional parameters. All the necessary configuration options are taken either from the `glue.config.dev.json` file in the current working directory (see [Configuration](#configuration) below) or from the built-in defaults.

Below are described the available commands:

- #### init

```javascript
gluec init
```

The `init` command will set up **Glue42 Core** for the current directory. This means that the Glue42 CLI will:

- install with `npm` (and perform `npm init --yes` beforehand if no `package.json` file is found) all necessary dependencies that provide the [**Glue42 Environment**](../environment/overview/index.html) files;
- create a `glue.config.dev.json` file with default settings and correct paths for all **Glue42 Core** assets;
- create a `glue.config.json` file with default settings so that you can easily customize (if you need to) the settings in it. The Glue42 CLI will copy this file to the output directory when bundling your **Glue42 Core** files for deployment.
- create a `glue.core.cli.log` file which will contain the log output of the Glue42 CLI if you set the `logging` setting in the `glue.config.dev.json` to `"full"`.

- #### serve

```javascript
gluec serve
```

The `serve` command launches a dev server using the configuration provided in the `glue.config.dev.json` file.

```javascript
gluec build
```

- #### build

The `build` command collects all the necessary **Glue42 Core** assets and bundles them in a `./glue` directory ready for deployment.

- #### version

```javascript
gluec version
```

The `version` command returns the currently installed version of the Glue42 CLI.

## Configuration

The configuration settings for the Glue42 CLI are located in the `glue.config.dev.json` file that is automatically created when initializing your **Glue42 Core** project with the `init` command. This file must be located at top-level of the working directory from which the Glue42 CLI commands are executed. The settings and configurations in this file allow the Glue42 CLI to correctly serve your applications and compose the final **Glue42 Core** bundle ready for production.

Below is the default configuration in the `glue.config.dev.json` file:

```json
{
    "glueAssets": {
        "gateway": {
            "location": "./node_modules/@glue42/gateway-web/web/gateway-web.js"
        },
        "worker": "./node_modules/@glue42/worker-web/dist/worker.js",
        "config": "./glue.config.json",
        "route": "/glue"
    },
    "server": {
        "settings": {
            "port": 4242,
            "disableCache": true
        },
        "apps": [],
        "sharedAssets": []
    },
    "logging": "default"
}
```

Options that specify file locations can be set as absolute paths or as paths relative to the configuration file.

### Properties and Settings

Below are described all available properties and settings in the `glue.config.dev.json` file.

- #### glueAssets

*Optional*. Defines the locations of all scripts and configurations that are part of the [**Glue42 Environment**](../environment/overview/index.html). These settings are used by the `serve` command to correctly host all required files and also by the `build` command, to correctly compose your **Glue42 Core** bundle. It has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `worker` | `string` | The location of the Shared Worker script file. | No | `"./node_modules/@glue42/worker-web/dist/worker.js"` |
| `gateway.location` | `string`| The location of the Glue42 Gateway script file. | No | `"./node_modules/@glue42/gateway-web/web/gateway-web.js"` |
| `gateway.gwLogAppender` | `string` | The location of a [custom log appender file](../environment/setup/index.html#advanced-extending_the_gateway_logging) for the Glue42 Gateway. | No | `-` |
| `config` | `string`| The location of the `glue.config.json` file. | No | `"./glue.config.json"` |
| `route` | `string` | The base route where the [**Glue42 Environment**](../environment/overview/index.html) files will be served by the dev server. | No | `"/glue"` |

In the example below, the user has created a `/lib` directory and has decided to put there the deployment-ready files of the Shared Worker and the Glue42 Gateway. The Glue42 CLI will use these locations (for serving the files during development and for building the final **Glue42 Core** bundle) and will fail with an error if any of the files is missing. The user has also changed the default `route` to `"/shared/glue"`. This can be useful for keeping all shared resources (like images, scripts, styles, etc.) and all **Glue42 Core** files under the same base path. However, now all [**Glue42 Clients**](../glue42-client/overview/index.html) need to be instructed where to find the [**Glue42 Environment**](../environment/overview/sindex.html) files (see [Initializing a Glue42 Client: Custom Configuration](../glue42-client/index.html#initializing_a_glue42_client-custom_configuration)).

```json
{
    "glueAssets": {
        "worker": "./lib/worker.js",
        "gateway": {
            "location": "./lib/gateway.js"
        },
        "route": "/shared/glue"
    },
    "server": ...,
    "logging": ...
}
```

- #### server

*Optional*. This property is required only if you want to use the `serve` command. Defines command-specific settings and has the following properties:

- `server.settings` - *optional* object that defines settings for the dev server and has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `port` | `number` | The port at which the dev server will listen. | No | `4242` |
| `disableCache` | `boolean` | Whether to disable or enable server cache. | No | `true` |


In the example dev server configuration below, the user has changed the port number to `9292` and has decided to enable server cache:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": {
            "port": 9292,
            "disableCache": false
        }
    },
    "logging": ...
}
```

- `server.apps` - a **required** array of objects that define how the dev server should serve your apps - from a local directory or proxy to a `localhost`. Defaults to an empty array. An app object has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `route` | `string` | The URL from which to serve the app. | Yes | `-` |
| `localhost` | `object`| Used when your app is already served on `localhost` and the dev server should proxy to it. | No | `-` |
| `localhost.port` | `number` | The port at which listens the server that is already serving your app. | Yes | `-` |
| `localhost.spa` | `boolean` | Flags whether your app is a Single Page Application or not. | No | `true` |
| `file` | `object` | Used when you want your app to be served from the file system. | No | `-` |
| `file.path` | `string` | The path to the directory where your app is located. | Yes | `-` |

In the example below, the user has two applications. One of the applications is a SPA app (the `localhost.spa` property is not present, but it defaults to `true`) and is already served at port 3000. The dev server will proxy to this SPA app served at `http://localhost:3000` and will serve it at `http://localhost:4242/`. The other application, located in the `./another-app` directory, will be served from the file system at `http://localhost:4242/another-app`.

```json
{
    "glueAssets": ...,
    "server": {
        "apps": [
            {
                "route": "/",
                "localhost": {
                    "port": 3000
                }
            },
            {
                "route": "/another-app",
                "file": {
                    "path": "./another-app"
                }
            }
        ]
    },
    "logging": ...
}
```

- `sharedAssets` - an *optional* array of objects describing assets shared between your applications that you want to be served. Each object has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `route` | `string` | The URL at which to serve the shared asset. | Yes | `-` |
| `path` | `string` | The location of your shared asset. | Yes | `-` |

In the example below, the user declares a `/common` directory which contains shared files. This directory will be served at `http://localhost:4242/common`. The user also defines a single shared file named `favicon.ico` and located in the root project directory. It will be served at `http://localhost:4242/favicon.ico`.

```json
{
    "glueAssets": ...,
    "server": {
        "apps": ...,
        "sharedAssets": [
            {
                "route": "/common",
                "path": "./common"
            },
            {
                "route": "/favicon.ico",
                "path": "./favicon.ico"
            }
        ]
    },
    "logging": ...
}
```

- #### logging

This is an *optional* property that specifies the level of logging for the Glue42 CLI. When omitted or set to `"default"`, the Glue42 CLI will output informational logs and errors *only* to the console. Other possible settings are:

- `"dev"` - outputs only to the console, but includes trace information too;
- `"full"` - outputs everything (info, trace, errors) to the console *and* to a log file named `glue.core.cli.log` located at the root project directory.

In the example below, the user has set the logging to `"dev"` in order for trace information to also be included in the log output to the console:

```json
{
    "glueAssets": ...,
    "server": ...,
    "logging": "dev"
}
```