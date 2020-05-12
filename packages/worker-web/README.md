# Shared Worker

The Shared Worker is a script which is used to create a [Shared Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker). This is the central point to which all [Glue42 Clients](https://docs.glue42.com/core/core-concepts/glue42-client/overview/index.html) connect when initializing the [Glue42 Web](https://docs.glue42.com/reference/core/latest/glue42%20web/index.html) library. It is responsible for configuring, initializing and linking Glue42 Clients to the [Glue42 Gateway](https://docs.glue42.com/core/core-concepts/environment/overview/index.html#glue42_gateway).

The Shared Worker uses the `glue.config.json` configuration file to get user-defined settings for the Glue42 Gateway.

**Important!** The Shared Worker will expect to find a configuration file at `./glue.config.json`. Due to the current limitations of the Shared Web Worker interface, passing a different config file location is not an option. Therefore, if this file is not found at that location, the worker will proceed with the default settings for the Glue42 Gateway.