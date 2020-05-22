## Overview

In the [Quick Start](../quick-start/index.html) section you learned how to quickly set up the [**Glue42 Environment**](../../core-concepts/environment/overview/index.html) files and create a basic [**Glue42 Client**](../../core-concepts/glue42-client/overview/index.html) app using the [**Glue42 CLI**](../../core-concepts/cli/index.html). Here, you can see how to easily bundle all necessary Glue42 Core files ready for deployment using the Glue42 CLI. 

*If you have decided to set up your project manually, you should already be familiar with the locations of the files you need (see [**Glue42 Environment: Manual Setup**](../../core-concepts/environment/setup/index.html#manual)).*

## Deployment

To bundle all necessary Glue42 Core files for deployment, simply use the Glue42 CLI and run:

```javascript
gluec build
```

This command will gather the Glue42 Core assets from the locations defined in the `glue.config.dev.json` (or from the default locations) and will produce a `/glue` directory at the root level of your project directory. All necessary Glue42 Core files will be inside this directory. All that is left for you is to build your app (or apps) and deploy them to you production server.

*Note that, by default, a [**Glue42 Client**](../../core-concepts/glue42-client/overview/index.html) will expect Environment files with the following locations and names:*

*- `/glue/glue.config.json` - for the configuration file;
*- `/glue/gateway.js` - for the Glue42 Gateway file;*
*- `/glue/worker.js` - for the Shared Worker file;*

*If you need to change the expected names and locations, see the [**Glue42 Client: Custom Configuration**](../../core-concepts/glue42-client/overview/index.html#initializing_a_glue42_client-custom_configuration) and the [**Glue42 Environment: Configuration File**](../../core-concepts/environment/overview/index.html#configuration_file) sections.*