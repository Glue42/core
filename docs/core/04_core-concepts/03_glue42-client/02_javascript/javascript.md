## Overview

This guide will show you how to initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library in a simple JavaScript app in order to make it a Glue42 Client.

## Referencing Glue42 Web

The [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library provides the connection between your apps and the [**Glue42 Environment**](../../environment/overview/index.html). You can install the `@glue42/web` package from `npm` and reference the library file directly, or reference the Glue42 Web library in your web apps with a link to `UNPKG`.

- From `npm`:

Install the `@glue42/web` package in the root directory of your project:

```cmd
npm install @glue42/web
```

Reference the library in your web app:

```html
<script src="./node_modules/@glue42/web/dist/web.umd.js">
```

- From `UNPKG`:

Reference the library in your web app:

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
```

Referencing the Glue42 Web library script will attach a `GlueWeb()` factory function to the `window` object.

## Initialization

You have to initialize the Glue42 Web library by invoking the exposed `GlueWeb()` factory function. It accepts an *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object in which you can specify settings regarding the [**Glue42 Environment**](../../environment/overview/index.html) files (the *optional* `glue.config.json` file and the Shared Worker script), as well as settings related to saving and restoring the application window layout and context. All available settings for the `Config` object are explained in detail in the [**Glue42 Client: Overview**](../overview/index.html) section.

Below is an example of initializing the Glue42 Web library with the default settings:

```javascript
// Use the object returned from the factory function
// to access the Glue42 Core APIs
const glue = await GlueWeb();
```

In your application, go to the `index.js` file and initialize the Glue42 Web library:

```javascript
const initializeGlue42 = async () => {

    // Example initialization options.
    const initOptions = {
        extends: false,
        worker: "./lib/worker.js",
        layouts: {
            autoRestore: true,
            autoSaveWindowContext: true
        }
    };

    // Use the object returned from the factory function
    // to access the Glue42 Core APIs
    const glue = await GlueWeb(initOptions);

    // Here Glue42 Web is initialized and you can access all Glue42 Core APIs
};

initializeGlue42().catch(console.error);
```

Your application is now configured as a Glue42 Client and can connect to the [**Glue42 Environment**](../../environment/overview/index.html). You can serve your app with your own server or you can use the Glue42 Core dev server via the [**Glue42 Core CLI**](../../cli/index.html).