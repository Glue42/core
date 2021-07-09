## Overview

When designing a multi app project, sometimes you may need to execute initial system logic - initialize data providers, register methods, etc. In a desktop application this is usually handled by auto starting hidden applications. In a web project, however, isn't possible to create a hidden browser window to execute this logic. The solution to this problem is to use the Glue42 Plugins. A "Plugin" in the context of [**Glue42 Core**](https://glue42.com/core/) is a user-defined function that will be executed upon startup of the [Main application](../../developers/core-concepts/web-platform/overview/index.html) *before* the initialization of the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library has been completed. The Plugin receives a fully initialized `glue` object as a first argument, which allows you to perform Glue42 operations *before* the Main app or any of the [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps has been initialized. As a second argument, the Plugin receives a user-defined configuration object.

Use the `plugins` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../developers/core-concepts/web-platform/overview/index.html) to define Plugins:

```javascript
const myPlugin = async (glue, config) => {
    let meaning;

    if (config.tick === 42) {
        meaning = config.tick;
    } else {
        meaning = undefined;
    };

    await glue.interop.register("MyMethod", () => `Currently, the meaning of life is ${meaning}.`);
};

const config = {
    plugins: {
        // Plugin definitions.
        definitions: [
            {
                name: "my-plugin",
                config: { tick: 42 },
                start: myPlugin
            }
        ]
    }
};
 
const { glue } = await GlueWebPlatform(config);
```