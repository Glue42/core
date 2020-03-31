## Overview

As we explained in the concepts overview section **TODO: Link**, on a high level a Glue42 Core project consists of one or more Clients and an Environment. In this section we will cover how to set up your Glue42 Core environment for a single client project. Setting up the environment means creating the correct configuration files and serving them together with the rest of the environment parts. For more details on what exactly are those parts, you can head over to the Environment **TODO: LINK** section.

There are two ways to get yourself set up. The first one is to use our CLI **TODO: Link** tool, which will get all the required dependencies and scaffold default configuration files for you. The second one is to do everything manually. We recommend sticking with the CLI, because it greatly simplifies the setup procedure and let's you focus on building a great app. On the other hand, if you require really fine-grained control over your app development setup, maybe because you use some very custom tools, then you can skip over to the manual section.

## CLI

As a prerequisite you need to have the `@glue42/cli-core` globally installed on your machine. Alternatively you can include it as a dev dependency for your app, it is up to, but the following steps will assume that you have it globally:

```javascript
npm install --global @glue42/cli-core
```

### Step One

First, you need to get all the Glue42 Core Environment files and scaffold the config files. Go to your application's root directory. This could be an existing application or a freshly created one with `ng new` or `npx create-react-app`, for example. Open a terminal and:

```javascript
gluec init
```

This will `npm install --save` the necessary files. If, for some reason, npm is not initialized in your directory, this command will also init it with basic `--yes` settings. 

As a result you will have a few more packages included in your `./node_modules` directory and on root level you will find three new files
- `glue.config.dev.json` - this is the config used by the CLI, containing default settings.
- `glue.config.json` - this is config used by the Glue42 Clients, containing default settings.
- `glue.core.cli.log` - this is the log output of the CLI, if you've set the `full` logging setting in `glue.config.dev.json`.

We are not going to go over the specifics of each file, because you can find all you need in the Glue42 Core Environment section **TODO: Link**.

### Step Two

Next, you need to tell the CLI where to find your application and where to serve it. Here you have two options
- You can serve your application using your framework's tools. For example, `ng serve` for Angular or `npm start` for React apps created with Create React App.
- You can just build your application using yor framework's tools. For example, `ng build` for Angular or `npm run build` for React apps created with Create React App.

Now, let's cover each of those scenarios.

#### Served application

If you choose to serve your application, you can take full advantage of your framework's built-in dev capabilities like fully configured dev server, live reloading and so on.

As you know, by default Angular will serve you application at `localhost:4200`, while React will do so at `localhost:3000`. That's all great and you do not need to change any of it. The only thing you need to do is tell the Glue42 CLI where to find your apps. To do that go to `glue.config.dev.json` and add a new object in the `apps` array:

```json
{
    // some other stuff
    "apps": [
        {
            "route": "/",
            "localhost": {
                "port": 3000 // this is the react default, for angular default change it to 4200
            }
        }
    ]
    // some other stuff
}
```

This config tells the CLI that you want at `/` (root) the built-in dev server to proxy to `localhost:3000`.

#### Built application

If you don't want to use your framework's serving capabilities, you can just build your app and let the Glue42 Core dev server serve it for you from the file system. This is also helpful, if you are developing something quick and light using Vanilla JS and you don't really have a fully configured development server.

First you need to build your app (`ng build` for Angular, `npm run build` for React) and then edit the `glue.config.dev.json`:

```json
{
    // some other stuff
    "apps": [
        {
            "route": "/",
            "file": {
                "path": "./path/to/built/app"
            }
        }
    ]
    // some other stuff
}
```

This config tells the CLI that you want at `/` (root) the built-in dev server to serve your files from the chosen path.

This option could be beneficial for users with less powerful computers, because the frameworks' files watching, rebuilding and live reloading functionalities can be CPU intensive.

**Note!** Keep in mind that the `path` property should describe the location of your built app directory. For example `./dist/myapp`. Also, this property accepts absolute and relative paths.

### Step Three

Great, so right now you have your files ready, your app is either served or built and you have told the Glue42 CLI where to find your app. Next you need to start the built-in dev server, by

```javascript
gluec serve
```

This command parses the `glue.config.dev.json` and launches a light-weight dev server at `localhost:4242` (by default). If you navigate to `localhost:4242`, you will see what your app is served there. What's more the Angular and React live reloading functionality is also available (if you chose to serve your app).

At first glace, the end result is pretty much the same as the one from `ng serve` or `npm start`. The difference is that apart from serving your app, we are also serving the Glue42 Environment and your app is ready to initiate the `@glue42/web` library and use all of the Glue42 Core capabilities.

### Advanced

So far we have covered the default, straight forward initiation. But what if you need a little bit more control? By going over the `glue.config.dev.json` you can change the port of the dev server, the sources of the Glue42 Core Environment files, the logging of the CLI and so on. If you are interested, head over to the Configuration portion of the CLI section **TODO: Link**.

#### Extending the Gateway's logging

You can get detailed information on what the gateway is from the Environment section **TODO: Link**. Here we will explain how you can extend it's logging functionality. Normally this is something you do not need to to, because the gateway logs internal messages to and from Glue42 Clients, but obtaining this information could be useful for creating bug issues in our github or just to get a better understanding on what's going on behind the scenes.

First, you need to create an `appender`. This is a simple JS function which takes as a single argument the log info object and does with it whatever you need - log to the console, send to a REST server, etc. To do that, go to your application's root and create:

```javascript
// ./gwLogAppender.js
self.myLog = (logInfo) => {
    // your log logic here
};
```

Next, go to `glue.config.dev.json` to tell the CLI that there is an appender:

```json
{
    // some other stuff
    "glueAssets": {
        "gateway":{
            "gwLogAppender": "./gwLogAppender.js"
        }
    }
    // some other stuff
}
```

Finally go to `glue.config.json` to tell the runtime Environment, what there is a custom appender:

```json
{
    // some other stuff
    "gateway":{
        "logging": {
            "appender": {
                "name": "myLog", // notice that this is the name of the JS function in ./gwLogAppender.js,
                "location": "./gwLogAppender.js"
            }
        }
    }
    // some other stuff
}
```

Now, when you `gluec serve`, the appender will be hosted and it will be detected by the runtime Environment.

## Manual

Maybe you don't like using scaffolding tools or maybe you just have a complex and custom case, and the built-in functionality just doesn't suite you. No problem, now we will go through manually setting your Glue42 Core Environment.

### Step One

Go to your application's root and install the necessary Glue42 Core dependencies:

```javascript
npm install --save @glue42/gateway-web @glue42/worker-web
```

### Step Two

Now you have to create the `glue.config.json` and define all the properties you need. You can get a detailed information on the available properties in the Glue42 Core Environment **TODO: Link** section.

**Note** that this file is optional, so if you won't use it just skip this step and Glue42 Core will continue with defaults.

### Step Three

Now you need to serve your application and the Glue42 Core Environment.

By default:
- Glue42 Clients will look for `/glue/glue.config.json` to get user-level configs.
- Glue42 Clients will look for `/glue/worker.js`
- The worker will look for `/glue/gateway.js` and `/glue/glue.config.json`

You should serve:
- the gateway from `./node_modules/@glue42/gateway-web/web/gateway-web.js`
- the worker from `./node_modules/@glue42/worker-web/dist/worker.js`

If you don't want to use a `glue.config.json`, then you need to specify that when initializing a Glue42 Client **TODO: Link**.

If you would like to serve the Glue42 Core environment from a different route, for example from `/my/other/assets/`, then you need to:
- serve all environment assets at the same level (so that they are siblings)
- configure the Glue42 Clients **TODO: Link** to look for a config or a worker at the right route.

Example with a `glue.config.json`:

```text
routes
    /my/other/assets/worker.js
    /my/other/assets/gateway.js
    /my/other/assets/glue.config.json
```

```javascript
// Glue42 Client
// Glue42Web config
const config = {
    extends: "/my/other/assets/glue.config.json"
}
```

Example without a `glue.config.json`:

```text
routes
    /my/other/assets/worker.js
    /my/other/assets/gateway.js
```

```javascript
// Glue42 Client
// Glue42Web config
const config = {
    worker: "/my/other/assets/worker.js"
}
```

We touched on all major steps needed to manually set up your environment, but also keep in mind that you can partially use the CLI. You can use

```javascript
gluec init
```

Just to set up the necessary files for you and then you can serve them using your own dev setup.