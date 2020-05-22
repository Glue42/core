# Overview

The `@glue42/core` package is the core [Glue42](https://glue42.com/) JavaScript module used in applications for sharing data with other Glue42 enabled applications. It can be used by applications hosted in Glue42, a browser or `Node.js`.

The `@glue42/core` package is a subset of the [`@glue42/desktop`](https://www.npmjs.com/package/@glue42/desktop) package which offers tools for more advanced scenarios that require [Window Management](https://docs.glue42.com/glue42-concepts/windows/window-management/overview/index.html), [Application Management](https://docs.glue42.com/glue42-concepts/application-management/overview/index.html), [Activities](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/activities/overview/index.html), [Layouts](https://docs.glue42.com/glue42-concepts/windows/layouts/overview/index.html), [Channels](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/channels/overview/index.html), etc.

The `@glue42/core` package contains the following APIs:

- **Interop** - an [Interop](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/interop/javascript/index.html) API which enables applications to:
    - offer functionality to other applications (JavaScript and native) by registering Interop methods;
    - discover Interop methods and applications which offer Interop methods;
    - invoke Interop methods on the user desktop and across the network;
    - stream and subscribe to real-time data using a Streaming API;

- **Shared Contexts** - a [Shared Contexts](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/shared-contexts/javascript/index.html) API which provides a simple and effective way of sharing data between applications by using shared named data objects;

- **Metrics** - use the Glue42 [Metrics](https://docs.glue42.com/glue42-concepts/metrics/overview/index.html) as a way of assessing the life cycle of a certain process (application performance, business process, employee productivity, etc.) by acquiring, recording and monitoring over time specific data about the key performance indicators of the said process;

- **Pub/Sub** - a basic [Pub/Sub](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/pub-sub/javascript/index.html) API that allows apps to publish/subscribe for messages on a specific topic;

# Usage

## Running in Glue42

```javascript
import GlueCore from "@glue42/core";

const initializeGlue42 = async () => {
    // You can pass an optional configuration object to the factory function.
    // If you do not privide configuration, it will be inferred from your application configuration file.
    const glue = await GlueCore();

    // Use the Glue42 APIs.
};

// Handle errors.
initializeGlue42().catch(console.error);
```

## Running in Node.js

Note that your Node.js script should be started by the **Glue42 Desktop** client in order to receive a `gwToken` and a `gwURL`.

```javascript
import GlueCore from "@glue42/core"

const initializeGlue42 = async () => {

    const config = {
        application: "MyNodeApp",
        gateway: {
            protocolVersion: 3,
            ws: process.env.gwURL
        },
        auth: {
            gatewayToken: process.env.gwToken
        }
    };

    const glue = await GlueCore(config);

    // Use the Glue42 APIs.
};

// Handle errors.
initializeGlue42().catch(console.error);
```
