## Overview

The Glue42 Core Environment is a set of JS and JSON files which must be hosted at the same domain as your applications in order to have have access to the platform's functionality. This set of files (we call it *environment*) is not application-specific, it is domain-specific.

The environment consists of:
- A shared worker used as a central point for all Glue42 Clients to connect to
- A gateway which carries out the communication between all Glue42 Clients
- **Optional** configuration file used to define Glue42 Core settings and defaults

The Glue42 Core environment requirements are:
- All files must be hosted on the same domain as your applications
- All files must be served from a path easily accessible by all Glue42 Clients. 

### Setting up environment

Setting up is much easier than it seems. We have created a CLI tool **TODO: LINK** which makes the process of setting up your development environment and bundling the Glue42 Core environment for deployment easy and painless. We have prepared detailed guides for setting up the environment using the CLI for single application **TODO: LINK** and multiple application **TODO: LINK** projects.

Those of you who need fine-grained control over the development and deployment of their project, can head over to the Manual Setup **TODO: LINK** section. There we have prepared a detailed guide for manually setting up the environment.

## Configuration File

This is a simple JSON file containing general Glue42 Core settings, gateway settings and shared configuration used by all Glue42 Clients on this domain.

If this file is not present, then all Glue42 Clients will initialize using default settings (more on that in the Glue42 Client section **TODO: LINK**) and will try to connect to the shared worker at the default location at `/glue/worker.js`. The shared worker will also try to connect to the gateway at the default location at `/glue/gateway.js`.

If you provide a configuration file, then it **must** be named `glue.config.json`. The interface of the config is:

```javascript
interface Glue42CoreConfig {
    glue?: Glue42WebConfig;
    gateway?: GatewayConfig;
}
```

### Glue42WebConfig

This is an **optional** configuration object which when defined will be used as a common setting when all Glue42 Clients on this domain initialize the Glue42 Web library. Every client can define it's own initialization options, which will overwrite the common settings in `glue.config.json`.

For more information on the Glue42WebConfig, head over to the Glue42 Web reference documentation. **TODO: LINK**

### GatewayConfig

This is an **optional** configuration object which defines settings used by the shared worker in order to initialize the gateway:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`location`|`string`|**Optional** The location of the gateway script | Defaults to: "./gateway.js" |
|`logging`|`object`|**Optional** Set the logging level and appender for the gateway | -|
|`logging.level`|`"trace" | "debug" | "info" | "warn" | "error"`|**Optional** Defines the log level | Defaults to: `"info"` |
|`logging.appender`|`object`|**Optional** Defines a custom log appender | By default the gateway will log to the shared worker's console |
|`logging.appender.location`|`string`| The location of the appender script | no default |
|`logging.appender.name`|`string`| The name of the appender function defined in the appender script | No default |


#### Gateway log appender

You can overwrite the default logging configuration of the gateway from `glue.config.json`. For most cases this is not needed, because the gateway logs internal messages sent back and forth from Glue42 Clients. However, if you really need to, you can define:
- log level - accepts: `"trace" | "debug" | "info" | "warn" | "error"`, defaults to: `info`
- appender - a function that receives a **LogInfo** object. By default logs to the shared worker console, but your custom function can send those logs to a remove server, for example. The **LogInfo** object has a structure like this:

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
The `output` key contains a processed message for direct output where the rest of the keys hold the details.

Example:

```json
{
    "glue": ...,
    "gateway": {
        "logging": {
            "level": "trace",
            "appender": {
                "location": "./gwLogAppender.js",
                "name": "log"
            }
        }
    }
}
```

```javascript
// ./gwLogAppender.js
self.log = (logInfo) => {
    // your custom log logic here
}
```

## Shared Worker

The shared worker is a script, which is used to create a Shared Web Worker. This is the central point to which all Glue42 Clients connect when initializing the javascript glue library. It is responsible to configuring, initializing and linking Glue42 Clients to the gateway.

The shared worker will use the `glue.config.json` to get user-defined settings for the gateway.

**Important!** The shared worker will expect to find a configuration file at `./glue.config.json`. Due to the current limitations of the Shared Web Worker interface, passing a different config file location is not an option. Therefore if this file is not found at that location, then the worker will proceed with default gateway settings.


## Gateway

The gateway is the backbone of the Glue42 Core environment. It facilitates all communication between all Glue42 Clients and is initialized by the shared worker. There are a few configuration options for the gateway, all exposed via the `glue.config.json` object.