## Overview

We call a "Glue42 Client" every application which initializes the `@glue42/web` library and thus connects to the Glue42 Core Environment. On a single domain there could one or more Glue42 Clients connected to the same Glue42 Environment, which gives them full access to the interop, window and contexts functionality offered by the platform.

A Glue42 Client can be any JS application written using Vanilla JS, React, Angular or any other framework.

## Initializing a Glue42 Client

To "initialize" client, means to connect to the Glue42 Core Environment using the `@glue42/web` library. We have prepared a more detailed guides on how do that using:
- Vanilla JS **TODO: Link**
- React **TODO: Link**

We are not going to overlap the explanations there, instead we will get in-depth on how we can configure this initialization and why would we want to do that. Regardless of whether you use Vanilla JS or our React library, the configuration is done using two **optional** elements, and we will cover both here:
- Glue42Web.Config
- `glue.config.json`

## Glue42Web.Config

Regardless of whether you use the `@glue42/web` library directly or our React library, the initialization is done by invoking a factory function exposed by the libraries. This factory function accepts an **optional** configuration object of type `Glue42Web.Config`. Full details on the Glue42 Web API can be found at the API reference **TODO: Link** page, however here we will explain the config object in more details.

The interface of Glue42Web.Config looks like this:

```javascript
interface Glue42Web.Config {
    worker?: string;
    layouts?: {
        autoRestore?: boolean;
        autoSaveWindowContext?: boolean;
    };
    extends?: string | false;
}
``` 

The **extends** property can be used to disable fetching `glue.config.json` (by setting it to `false`) or to set a location of the file, different from the default (`/glue/glue.config.json`). This is advisable when you decide not to use a `glue.config.json`.

**Note** that if you set a different location for `glue.config.json`, then you need to make sure that the `worker.js` (Glue42 Core Environment **TODO Link**) is located next to the config.
**Note** that if you set **extends** to `false`, then by default all clients will try to connect to the worker at `/glue/worker.js`. You need to set the **worker** property, if you want to overwrite the default.

The **layouts** property enables or disables auto-saving/restoring of windows' location and context on close.

## Glue.Config.JSON

We have covered the `glue.config.json` in the Glue42 Core Environment **TODO: Link** section where we explained all of it's properties. We have also explained how you can use this config to extend parts of the Glue42 Core Environment in the Single Application **TODO: Link** setup guide.

Right now we are interested in what can this config object do to help the Glue42 Clients. The interface of `glue.config.json` is:

```javascript
interface Glue42CoreConfig {
    glue?: Glue42Web.Config;
    gateway?: GatewayConfig;
}
```

We are interested in the `glue` property, which is of type Glue42Web.Config. The Glue42Web.Config defined in property `glue` will be used (unless explicitly told not to) by all clients on the domain as a base config. This base config can be extended by each client and is helpful so that you don't have to declare the same object in all of your clients.

Example:
```json
// glue.config.json
{
    "glue": {
        "layouts": {
            "autoRestore": true,
            "autoSaveWindowContext": true
        }
    }
}
```

Without any further configuration all Glue42 Clients will now auto-restore and auto-save their window contexts by default. If you wish a specific client to ignore this default, you can either:
- overwrite these properties in the client's Glue42Web.Config object
- set `{"extends": false}` in the client's Glue42Web.Config object
