*RAW*

The main app is a complex web app, with important responsibilities, but it is incredibly easy to set up.

All you need to do is npm install @glue42/web-platform. Then import it in your app and call the default exported factory function

```javascript
import GluePlatform from "@glue42/web-platform";

// Use the object returned from the factory function
// to access the Glue42 APIs.
const { glue } = await GluePlatform();
```

This factory function will initiate and configure everything you need to have a fully functional Glue42 Core V2 project.

The factory function accepts a single optional argument - a configuration object.

You can use this configuration object to set various important aspects of your glue project.

- windows - overwriting various timeouts for the windows operations
- applications - setting a source and mode of your AppManager module - local or remote or a custom supplier
- layouts - setting a source and mode of your Layouts module - local or remote or a custom supplier
- channels - configuration options for the available channels throughout your project
- plugins - providing your custom glue-specific logic, which will be included in the boot-up sequence of the main app
- gateway - overwrite the logging levels and handlers of the glue gateway for advanced control and debugging
- glue - a standard config object used by @glue42/web, which will be used when registering the main app as a glue client
- workspaces - here you can set a location of your workspaces frame app and other workspaces-options
- gluefactory - @glue42/web-platform will always initialize the latest version of @glue42/web internally, but can overwrite that by passing your own glue factory function. This is especially helpful, when you want your main app to run with a specific @glue42/web package version and not the latest.

In-depth explanations and examples of each of those settings can be found in the corresponding sections in Capabilities.

*END*