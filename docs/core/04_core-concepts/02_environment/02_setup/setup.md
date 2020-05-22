## Overview

Setting up the **Glue42 Environment** means creating a correct configuration file and serving it together with the rest of the Environment files - the [**Glue42 Gateway**](../overview/index.html#glue42_gateway) and the [**Shared Worker**](../overview/index.html#shared_worker) scripts. You can set up the Glue42 Environment in two ways - using the [**Glue42 CLI**](../../cli/index.html) tool or manually. The Glue42 CLI greatly facilitates and simplifies the process of setting up your development environment and bundling it for deployment. It installs the necessary dependencies and creates an initial basic configuration file with default settings. It is highly recommended to use the Glue42 CLI as it makes the setup procedure fast and easy and lets you focus on building a great app. On the other hand, if you require a more fine-grained control over your setup (maybe because you use some very custom tools), then you can go to the [Manual](#manual) section.

## Single and Multiple Apps

This section explains how to set up and serve your Glue42 Environment files using the [**Glue42 CLI**](../../cli/index.html) for projects consisting of one or more applications.

As a prerequisite, you need to have the `@glue42/cli-core` package installed globally on your machine:

```javascript
npm install --global @glue42/cli-core
```

### Initiating the Project

First, you need to get all [**Glue42 Environment**](../overview/index.html) files and create basic configuration files. Go to the root directory of your project - for single app projects, this will be the application root directory; for multi app projects, this will be the root directory which contains all apps and shared assets. Open a command prompt and run the following:

```javascript
gluec init
```

The `init` command will set up **Glue42 Core** for the current directory. This means that the Glue42 CLI will:

- install with `npm` (and perform `npm init --yes` beforehand if no `package.json` file is found) all necessary dependencies that provide the [**Glue42 Environment**](../overview/index.html) files;
- create a `glue.config.dev.json` file with default settings and correct paths for all **Glue42 Core** assets;
- create a `glue.config.json` file with default settings so that you can easily customize (if you need to) the settings in it. The Glue42 CLI will copy this file to the output directory when bundling your **Glue42 Core** files for deployment.
- create a `glue.core.cli.log` file which will contain the log output of the [**Glue42 CLI**](../../cli/index.html) if you set the `logging` setting in the `glue.config.dev.json` to `"full"`.

*For detailed descriptions of the Environment files, see the [**Glue42 Environment: Overview**](../overview/index.html) section.*

### Configuration

Next, you need to configure the paths to your application(s) (and shared assets, if you are working on a multi app project) and the route(s) on which the Glue42 Core dev server to serve your project. 

Use the `server.apps` property in the `glue.config.dev.json` file to specify the paths to your applications and the routes on which to be served. The `apps` key is an array of objects, each object representing configuration for a single application. Below is an example configuration of the `apps` property for a two app project:

```json
"apps": [
    {
        "route": "/",
        "file": {
            "path": "./client-list"
        }
    },
    {
        "route": "/client-portfolio/",
        "localhost": {
            "port": 3000
        }
    }
]
```

#### Application Locations

You have the options to: 

- serve your applications using your framework tools (e.g., `ng serve` for Angular, or `npm start` if you are using Create React App) and configure the Glue42 Core dev server to find your apps at the respective ports;
- build your applications with your framework tools (e.g., `ng build` for Angular, or `npm run build` if your are using Create React App) and configure the Glue42 Core dev server to serve your apps from the respective locations;

When you have a multi app project, you can, of course, mix both configuration scenarios, so that the Glue42 Core dev server will serve some of your apps from the file system and proxy to other apps that are already hosted at specific ports.

Both scenarios are explained below:

- **Already Hosted Apps**

You can choose to host your application using your framework tools in order to take full advantage of the built-in development capabilities of your framework. In this case, all you need to do is configure the Glue42 Core dev server where to find your apps. By default, Angular uses port 4200 of `localhost`, and React uses port 3000.

Go to the `glue.config.dev.json` file and add a new object in the `apps` array. In the `localhost.port` property specify the port at which your application is already hosted:

```json
{
    "glueAssets": ...,
    "server": {
        ...
        "apps": [
            {
                "route": "/",
                "localhost": {
                    // Default for React. Change to 4200 for Angular.
                    "port": 3000 
                }
            }
        ]
    },
    "logging": ...
}
```

The example above will configure the Glue42 Core dev server so that when you navigate to `/` (root), the server will proxy to `localhost:3000`.

- **Built Apps**

You can also build your app and let the Glue42 Core dev server serve it for you from the file system. This is helpful if you are developing a light JavaScript app and you don't have a fully configured development server.

Build your app and add a configuration object to the `server.apps` array in the `glue.config.dev.json` file. This time, in the `file.path` property of the configuration object, specify the path (relative or absolute) to your built application:

```json
{
    "glueAssets": ...,
    "server": {
        ...
        "apps": [
            {
                "route": "/",
                "file": {
                    // Path to the built app (relative or absolute).
                    "path": "./client-list/dist" 
                }
            }
        ]
    },
    "logging": ...
}
```

The example above will configure the Glue42 Core dev server so that when you navigate to `/` (root), the server will host your app files from the specified path.

#### Serving Routes

From the `route` property of each configuration object in the `server.apps` array you can specify the route at which you want your app to be served. This allows you to specify different routes (at the same domain, host and port) for different apps. 

*Note that the Glue42 CLI does not currently support deeper levels of routes (e.g., `route: "/apps/client-list/"` will not work). Please, use only single level routes (e.g., `route: "/client-list/"`)*

*Note that if your app is already hosted by another framework (Angular, React, etc.) and you want the Glue42 Core dev server to serve it at a route that is different from the default root route of that framework (e.g., you have an Angular "Client Portfolio" application and you want to serve it at `/client-portfolio/` instead of at `/`), you need to specify the new root route in the respective framework configuration (see details below for [React](#react) and [Angular](#angular)).*

**Important** for all frameworks: *In the case when your app is already hosted by your framework, it is mandatory that the base route you specify in the `glue.config.dev.json` be identical to the one you specify in your framework configuration and that the route **start and end** with a slash (`/`).*

Let's say your project consists of three apps:

- a built "Client List" app, which you want to serve from the file system at `/`;
- a React "Client Contact" app that is already hosted at port 3000 by the React framework and you want to serve it at `/client-contact/`;
- an Angular "Client Portfolio" app that is already hosted at port 4200 by the Angular framework and you want to serve it at `/client-portfolio/`;

Here is how the configuration in your `glue.config.dev.json` should look like:

```json
{
    "glueAssets": ...,
    "server": {
        ...
        "apps": [
            {
                "route": "/",
                "file": {
                    "path": "./client-list/dist"
                }
            },
            {
                "route": "/client-contact/",
                "localhost": {
                    "port": 3000
                }
            },
            {
                "route": "/client-portfolio/",
                "localhost": {
                    "port": 4200
                }
            }
        ]
    },
    "logging": ...
}
```

As mentioned above, you need to change the framework specific configuration for the base route, as both the Angular and the React app will be served at a route different from the default root (`/`) route for Angular and React.

- #### React

If you have a standard React app created with Create React App, then you need to do the following:

- go to the `package.json` file of your app and add:

```json
{
    "homepage": "/client-contact/"
}
```

This will instruct React to search for assets at `/client-contact/`, instead of at `/`.

- instruct the React Router that the `basename` is no longer `/`, but `/client-contact/`:

```javascript
<BrowserRouter basename="/client-contact/" />

// Will render <a href="/client-contact/notes">.
<Link to="/notes" />
```

- #### Angular

Go to the `angular.json` file of your project and add a `baseHref` property next to the `outputPath` and `index` properties:

```json
{
    "outputPath": "dist/client-portfolio",
    "index": "src/index.html",
    "main": "src/main.ts",
    "baseHref": "/client-portfolio/",
}
```

*Note that in some cases you may also need to specify `deployUrl` next to `baseHref`.*

#### Shared Assets

If you are working on a multi app project, it is natural to have some assets shared by all apps. If you wish the Glue42 Core CLI dev server to serve these files, add a configuration object to the `server.sharedAssets` array in the `glue.config.dev.json` file:

```json
{
    "glueAssets": ...,
    "server": {
        ...
        "sharedAssets": [
            {
                "route": "/shared",
                "path": "./shared/"
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

You can define entire directories with shared files, or individual shared files, as in the example above.

### Serving the Project

After all necessary configuration is ready, you can start the Glue42 Core dev server from the Glue42 CLI:

```javascript
gluec serve
```

This command launches a light-weight dev server at `localhost` with the settings specified in the `glue.config.dev.json` file.

At first glance, the end result is pretty much the same as the one from `ng serve` or `npm start`. The difference is that apart from serving your app, we are also serving the [**Glue42 Environment**](../overview/index.html) files and your app is ready to initiate the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library and access all Glue42 Core capabilities.

*Note that any client-side routing you may have will still be working as expected.*

## Manual

You can also manually set up your [**Glue42 Environment**](../overview/index.html) if nonе of the built-in solutions suits your needs. The steps you need to take are the same for both single and multi application projects - simply remember to install the dependencies at the root directory of your project, which in a single app project is the application root directory, and in a multi app project is the root directory containing all applications and shared assets.

*Before you begin, remember that you can also use partially the Glue42 CLI to install the necessary dependencies and create a basic configuration file through the `gluec init` command. After that, you can edit and serve the files with your own dev server and custom settings.*

### Installing the Dependencies

Go to the root directory of your project and install the necessary Glue42 Core dependencies:

```javascript
npm install --save @glue42/gateway-web @glue42/worker-web
```

### Configuration

Now, you have to create a `glue.config.json` configuration file and define the properties you need. For detailed information on the available properties in the configuration file, see the [**Glue42 Environment: Overview**](../overview/index.html#configuration_file) section.

Keep in mind that the configuration file is *optional*, so if you don't want to use such, skip this step and Glue42 Core will continue with the built-in defaults when initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library. You can specify that you will not use a configuration file and/or you can override the built-in default library settings when initializing a [**Glue42 Client**](../../glue42-client/overview/index.html).

### Serving Your Project

Now you need to serve your project, which includes the Glue42 Environment files.

- #### Default Route

Remember that by default:

- Glue42 Clients will expect an *optional* configuration file named `glue.config.json` located at `./glue` to retrieve user-level configurations;
- Glue42 Clients will expect a `worker.js` file located at `./glue`;
- the Shared Worker will expect a `gateway.js` (and an *optional* `glue.config.json`, if you have provided one) file located at `./glue`;

To change these defaults, see [**Glue42 Client: Initializing a Glue42 Client**](../../glue42-client/overview/#initializing_a_glue42_client).

You should serve:

- the Glue42 Gateway script from `./node_modules/@glue42/gateway-web/web/gateway-web.js`;
- the Shared Worker script from `./node_modules/@glue42/worker-web/dist/worker.js`;

- #### Custom Route

If you would like to serve the Glue42 Environment files from a different route, for example from `/assets/glue/`, then you need to:

- serve all Environment files at the same level (so that they are siblings);
- configure all [**Glue42 Clients**](../../glue42-client/overview/index.html) to retrieve the Shared Worker file (and/or the *optional* configuration file) from the correct route;

**Example with a configuration file:**

Routes:

- `/assets/glue/worker.js`
- `/assets/glue/gateway.js`
- `/assets/glue/glue.config.json`

Glue42 Client configuration during initialization:

```javascript
// This will configure the Glue42 Client app to retrieve
// the configuration file from a custom location.
const config = {
    extends: "/assets/glue/glue.config.json"
};
```

**Example without a configuration file:**

Routes:

- `/assets/glue/worker.js`
- `/assets/glue/gateway.js`

Glue42 Client configuration during initialization:

```javascript
// This will configure the Glue42 Client app to expect
// the Shared Worker script at a custom location.
const config = {
    worker: "/assets/glue/worker.js"
};
```

## Advanced

### Extending the Gateway Logging

You can overwrite the default logging configuration of the Glue42 Gateway from the *optional* `glue.config.json` file. For most cases, this is not needed, because the Glue42 Gateway logs internal messages sent back and forth from [**Glue42 Clients**](../../glue42-client/overview/index.html). However, if you really need to, you can define:

- logging level - `"trace" | "debug" | "info" | "warn" | "error"`, defaults to `"info"`
- log appender - a function that receives a `LogInfo` object. By default it logs to the Shared Worker console, but your custom function can send those logs to a remote server, for example. 

The `LogInfo` object has the following structure:

```javascript
{
    time: 2017-06-22T15:38:34.230Z,
    file: 'C:\\Users\\dimd00d\\AppData\\Local\\Temp\\form-init8247674603237706851.clj',
    output: 'DEBUG [gateway.local-node.core:55] - Sending message {:domain "global", :type :error, :request_id nil, :peer_id nil, :reason_uri "global.errors.authentication.failure", :reason "Unknown authentication method "} to local peer',
    level: 'debug',
    line: 55,
    stacktrace: null,
    namespace: 'gateway.local-node.core',
    message: 'Sending message {:domain "global", :type :error, :request_id nil, :peer_id nil, :reason_uri "global.errors.authentication.failure", :reason "Unknown authentication method "} to local peer'
}
```
The `output` key contains a processed message for direct output, whereas the rest of the keys hold the details.

#### Custom Log Appender Example

Below is an example of creating and configuring a custom log appender. Keep in mind that you have to configure the `glue.config.dev.json` file (if you want the Glue42 Core dev server to use your custom log appender) and the `glue.config.json` file (to instruct the Glue42 Environment where to find your custom log appender).

- First, you need to create your custom log appender. It should be a simple JavaScript function which receives a `LogInfo` object as a single argument. You can instruct the function to log to the console, send to a REST server, etc. Go to the root directory of your project, create a log appender file (e.g., `myLogAppender.js`) and define a logging function in it:

```javascript
self.myLog = (logInfo) => {
    // Your custom logging logic here.
};
```

- Next, to instruct the Glue42 Environment where to find your custom log appender, edit the `gateway` top-level key of the `glue.config.json` file to specify logging level and the location of your custom log appender:

```json
{
    "glue": ...,
    "gateway": {
        "logging": {
            "level": "trace",
            "appender": {
                "location": "./myLogAppender.js",
                // Notice that this is the name of the JavaScript function iyou have defined in `myLogAppender.js`.
                "name": "myLog" 
            }
        }
    }
}
```

- If you want to use your custom log appender during development with the Glue42 Core dev server, go to `glue.config.dev.json` and edit the `glueAssets.gateway` property to specify the location of your custom log appender:

```json
{
    "glueAssets": {
        "gateway":{
            ...
            "gwLogAppender": "./gwLogAppender.js"
        },
        ...
    },
    "server": ...,
    "logging": ...
}
```

Now, when you execute the `gluec serve` command from the Glue42 CLI, the log appender file will be hosted and will be detected by the runtime [**Glue42 Environment**](../overview/index.html).