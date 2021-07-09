## Guide

Starting a basic [**Glue42 Core**](https://glue42.com/core/) project is easy and intuitive, as this guide will show you. To quick start your project, you have to set up a [Web Platform](../../developers/core-concepts/web-platform/overview/index.html) application (also called "Main application") and optionally a second application - a [Web Client](../../developers/core-concepts/web-client/overview/index.html).

### Main Application

1. Create standard basic `index.html` and `index.js` files for your Main app.

2. Reference the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library and your `index.js` in the `index.html` file:

```html
<script src="https://unpkg.com/@glue42/web-platform@latest/dist/platform.web.umd.js"></script>
<script src="./index.js"></script>
```

3. Initialize the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the `index.js` file using the `GlueWebPlatform()` factory function:

```javascript
const init = async () => {
    const { glue } = await window.GlueWebPlatform();

    console.log(`Glue42 initialized successfully! Glue42 version: ${glue.version}`);
};

init().catch(console.error);
```

Now you have a fully functioning Main application.

### Web Client

1. Create standard basic `index.html` and `index.js` files for your Web Client app.

2. Reference the [Glue42 Web](https://www.npmjs.com/package/@glue42/web) library and your `index.js` in the `index.html` file:

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
<script src="./index.js"></script>
```

3. Initialize the [Glue42 Web](https://www.npmjs.com/package/@glue42/web) library in the `index.js` file using the `GlueWeb()` factory function:

```javascript
const init = async () => {
    const glue = await window.GlueWeb();

    console.log(`Glue42 initialized successfully! Glue42 version: ${glue.version}`);
};

init().catch(console.error);
```

Now you also have a fully functioning [Web Client](../../developers/core-concepts/web-client/overview/index.html) app that can be opened from the Main app - e.g., by using the [Window Management](../../capabilities/windows/window-management/index.html) library and the URL where the app was deployed.

## Next Steps

Congratulations, you have created your very first [**Glue42 Core**](https://glue42.com/core/) project! 

*For deploying your project, see the [Project Deployment](../project-deployment/index.html) section.*

*For more information on the Web Platform and Web Client apps, see the [Web Platform](../../developers/core-concepts/web-platform/overview/index.html) and [Web Client](../../developers/core-concepts/web-client/overview/index.html) sections.*

*For more information on the **Glue42 Web** library, see the [Reference](../../reference/core/latest/glue42%20web/index.html) section.*