## Overview

The Glue42 CLI is a command line tool designed to simplify your development process with Glue42 Core. This tool boils down to three simple commands:
- `init` - Quickly set up your workspace with the necessary configs and dependencies
- `serve` - Launches a dev server, which acts as a reverse proxy for your locally served applications
- `build` - Bundles all the necessary Glue42 Core files into one convenient folder ready for deploy

## Installation

Install the Glue42 CLI using the npm package manager:

```javascript
npm install -g @glue42/cli-core
```

Next we will take a look at how to use the CLI, by going on the available commands.

## Commands

The Glue42 Core CLI offers three simple commands with no additional parameters. All the necessary configuration options are take either from the `glue.config.dev.json` file in the current working directory or from the defaults.

### Init

```javascript
gluec init
```

This command will set up Glue42 Core for the current directory. This means that the CLI will:
- npm install (or npm init --yes beforehand, if no package.json was found) the Glue42 Core Environment **TODO: Link** files
- create `glue.config.dev.json` with default settings and correct paths for all Glue42 Core assets
- create `glue.config.json` with default settings for easy overwrite

### Serve

```javascript
gluec serve
```

This command launches the dev server using the configuration provided in the `glue.config.dev.json` file.

### Build

```javascript
gluec build
```

This command collects all the necessary Glue42 Core assets and bundles them in a `./glue` directory, ready for deployment.

## Configuration

The Glue42 CLI requires a file named `glue.config.dev.json` to be available in the current working directory (the directory from which the CLI commands are called). This file contains tool settings and other configurations which allows it to correctly serve your applications and compose the final Glue42 Core bundle.

Options that specify files can be given as absolute paths, or as paths relative to the configuration file.

The interface of the config object looks like this: 
```javascript
interface GlueDevConfig {
    glueAssets?: GlueAssets;
    server?: {
        settings?: ServerSettings;
        apps: ServerApp[];
        sharedAssets?: SharedAsset[];
    };
    logging?: "full" | "dev";
}
```

### GlueAssets

`glueAssets` is optional and defines the locations of all scripts and configs part of the Glue42 Core Environment **TODO: LINK**. These settings are used by the `serve` command to correctly host all required files and by the `build` command to correctly compose your Glue42 Core bundle. It has the following properties:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`worker`|`string`|**Optional** The location of the @glue42/worker-web dist JS file| Defaults to: "./node_modules/@glue42/worker-web/dist/worker.js" |
|`gateway`|`object`|**Optional**| - |
|`gateway.location`|`string`|**Optional** The location of the @glue42/gateway-web dist JS file| Defaults to: "./node_modules/@glue42/gateway-web/web/gateway-web.js" |
|`gateway.gwLogAppender`|`string`|**Optional** The location of a custom Gateway **TODO: LINK** log appender file.  | no default |
|`config`|`string`|**Optional** The location of the glue.config.json file | Defaults to: "./glue.config.json" |
|`route`|`string`|**Optional** The base route where the Glue42 Core Environment **TODO: LINK** files will be served by the dev server | Defaults to: "/glue" |

Example:
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
    "logging":....
}
```

In this example, the user has a `lib` directory where he has put the built dist files of the `@glue42/worker-web` and `@glue42/gateway-web` packages. The CLI will use these locations (for serving and building) and will fail with an error if any of the files where not found.

Here the user has also overwritten the default `route` to `"/shared/glue"`. This could be useful, if the user wishes to keep all shared resources like images, scripts, styles, etc and Glue42 Core files under the same base path. However now all Glue42 Clients need to be instructed where to find the Glue42 Core Environment files. For detailed information on how to do that head over to the Glue42 Client **TODO: LINK** section. 

### Server

`server` is required when using the `serve` command and defines various command-specific settings.

`server.settings` defines dev server-specific settings:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`port`|`number`|**Optional** The port at which the dev server will listen| Defaults to: 4242 |
|`disableCache`|`boolean`|**Optional** Toggles wether to disable server cache or not| Defaults to: true |

Example:
```json
{
    "glueAssets": ...,
    "server": {
        "settings": {
            "port": 9292,
            "disableCache": false
        }
    },
    "logging":....
}
```


`server.apps` is an array of objects which define how the dev server should serve your apps: from a local directory or proxy to a localhost. The app object has the following properties:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`route`|`string`|**Required** The route where to serve the app | no default |
|`localhost`|`{port: number; spa?: boolean}`| Used when your app is already served on localhost and the dev server should proxy to it |no default|
|`localhost.port`|`number`|**Required** The port at which the server serving your app listens to| no default |
|`localhost.spa`|`boolean`|**Optional** Toggles whether your app is a Single Page Application| Defaults to: true |
|`file`|`object`| Used when your app is not served and the dev server should serve it from the file system |no default|
|`file.path`|`string`|**Required** The location of your app's directory| no default |

Example:
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
                "route": "/apptwo",
                "file": {
                    "path": "./apptwo-dist"
                }
            }
        ]
    },
    "logging":....
}
```

In this example, the user has two applications which he needs to be served:
- At `http://localhost:4242` the dev server will proxy to the app served at `http://localhost:3000`
- At `http://localhost:4242/apptwo` the dev server will serve the app located in `./apptwo-dist`

`sharedAssets` is an array of objects describing assets shared between your applications, so that the dev server can serve them. Each object has the following properties:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`route`|`string`|**Required** The route where to serve the shared asset| no default |
|`path`|`string`|**Required** The location of your shared asset| no default |

Example:
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
    "logging":....
}
```

In this example the user declares a directory `common` which contains shared files and also a single common file `favicon.ico`. They will be served at:
- `http://localhost:4242/common`
- `http://localhost:4242/favicon.ico`


### Logging

`logging` is an optional property and specifies the level of logging for the CLI.

When omitted the CLI will output informational logs and errors **only** to the console. Other possible settings are:
- `dev` - Again outputs only to the console, but this time includes trace information too.
- `full` - Outputs everything (info, trace, errors) to the console and to the log file at `./glue.core.cli.log`

Example:
```json
{
    "glueAssets": ...,
    "server": ...,
    "logging": "dev"
}
```
