# Shared Worker

The shared worker is a script, which is used to create a Shared Web Worker. This is the central point to which all Glue42 Clients connect when initializing the javascript glue library. It is responsible to configuring, initializing and linking Glue42 Clients to the gateway.

The shared worker will use the `glue.config.json` to get user-defined settings for the gateway.

**Important!** The shared worker will expect to find a configuration file at `./glue.config.json`. Due to the current limitations of the Shared Web Worker interface, passing a different config file location is not an option. Therefore if this file is not found at that location, then the worker will proceed with default gateway settings.