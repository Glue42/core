## Overview

The [Main application](../../developers/core-concepts/web-platform/overview/index.html)  and all [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps can run [**Glue42 Enterprise**](https://glue42.com/enterprise/) without any code modification. The Main app will automatically detect that it is running in [**Glue42 Enterprise**](https://glue42.com/enterprise/) and won't initialize any of its [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) logic - it will default to being a normal [**Glue42 Enterprise**](https://glue42.com/enterprise/) client application. The Web Client apps will also auto detect the environment and will initialize the [`@glue42/desktop`](https://www.npmjs.com/package/@glue42/desktop) library (instead of [Glue42 Web](https://www.npmjs.com/package/@glue42/web)) with all necessary features enabled and set to the highest possible level (e.g., the Aplication Management API will be initialized in `"full"` mode) to ensure correct app functionality. This gives you the option to easily experiment with your apps running in a functionally richer environment with more integration options.

## How To 

1. Install [**Glue42 Enterprise**](https://glue42.com/enterprise/) version 3.9 or newer. Download the trial version of [**Glue42 Enterprise**](https://glue42.com/enterprise/) from [here](https://glue42.com/free-trial/).

2. Make sure that [**Glue42 Enterprise**](https://glue42.com/enterprise/) runs with auto injection on:

- Open the `system.json` configuration file (located in the `%LocalAppData%\Tick42\GlueDesktop\config` folder).
- Edit the `autoInjectAPI` property of the `windows` top-level key by setting the following configuration:

```json
"windows": {
    ...
    "autoInjectAPI": {
        "enabled": true,
        "version": "5.*",
        "autoInit": false
    }
}
```

*For more details on configuring [**Glue42 Enterprise**](https://glue42.com/enterprise/), see the [System Configuration](https://docs.glue42.com/developers/configuration/system/index.html) section.*

3. Create a definition file for your application. Use the template below and change the `name`, `title` and `url` properties with the details of your app.

```json
[
    {
        "title": "Glue42 Core app",
        "type": "window",
        "name": "glue42-core-app",
        "details": {
            "url": "http://localhost:4242/",
            "top": 100,
            "left": 200,
            "width": 600,
            "height": 300,
            "mode": "tab"      
        }   
    }
]
``` 

Save the configuration file as a JSON file and place it in the application definitions folder. Usually, this is the `%LocalAppData%\Tick42\UserData\<ENV-REG>\apps` folder where `<ENV-REG>` should be replaced with the region and environment folder name used for the deployment of your [**Glue42 Enterprise**](https://glue42.com/enterprise/) - e.g., `T42-DEMO`.

*For more details on configuring a Glue42 enabled applications in [**Glue42 Enterprise**](https://glue42.com/enterprise/), see the [Application Configuration](https://docs.glue42.com/developers/configuration/application/index.html) section.*

4. Start [**Glue42 Enterprise**](https://glue42.com/enterprise/) and open your app from the Glue42 Toolbar.

## Using Enterprise Features

If you want to keep your app running in both environments ([**Glue42 Core**](https://glue42.com/core/) and [**Glue42 Enterprise**](https://glue42.com/enterprise/)) and also use features that are specific to [**Glue42 Enterprise**](https://glue42.com/enterprise/), you need to make checks in your code to determine in which environment your app is running.

For example, you may want to register a global hotkey shortcut using the [Hotkeys API](https://docs.glue42.com/reference/glue/latest/hotkeys/index.html) that is only available in [**Glue42 Enterprise**](https://glue42.com/enterprise/). Use the `glue42gd` or the `glue42core` objects that are automatically attached to the global `window` object on startup of [**Glue42 Enterprise**](https://glue42.com/enterprise/) or [**Glue42 Core**](https://glue42.com/core/) respectively to determine in which environment your app is running:

```javascript
// Check whether the app is running in Glue42 Enterprise in order to use the Hotkeys API.
if (typeof glue42gd !== "undefined") {
   
    // Define a hotkey object.
    const hotkeyClientDetails = {
        hotkey: "shift+alt+c",
        description: "Open Client Details"
    };

    // Register the hotkey.
    glue.hotkeys.register(hotkeyClientDetails, (details) => {
        // This function will be invoked when the hotkey is used.
        console.log("Shortcut has been used.");
    });
} else if (typeof glue42core !== "undefined") {
    // Running in Glue42 Core, will fall back to in-page shortcuts.
};
```

If you are using TypeScript, cast your Glue42 Web API (`@glue42/web`) to the [**Glue42 Enterprise**](https://glue42.com/enterprise/) API (`@glue42/desktop`) to get better types:

```typescript
// Import the types.
import { Glue42 } from "@glue42/desktop"; 

if (typeof glue42gd !== "undefined") {
    // Running in Glue42 Enterprise, you can now use Glue42 Enterprise specific APIs.
    const glueEnterprise = glue as Glue42.Glue;
};
```