## Overview

In certain workflow scenarios, your application may need to start (or activate) a specific application. For instance, you may have an application showing client portfolios with financial instruments. When the user clicks on an instrument, you want to start an application which shows a chart for that instrument. In other cases, you may want to present the user with several options for executing an action or handling data from the current application. 

The [**Intents**](../../../reference/core/latest/intents/index.html) API makes all that possible by enabling applications to register, find and raise Intents.

The case with the "Portfolio" and the "Chart" application above can be implemented in the following way:

1. The "Chart" applications registers an [`Intent`](../../../reference/core/latest/intents/index.html#!Intent) called "ShowChart", specifying the data type (predefined data structure) that it works with - e.g., "Instrument".

2. When the user clicks on on instrument, the "Portfolio" application raises the "ShowChart" [`Intent`](../../../reference/core/latest/intents/index.html#!Intent), optionally specifying an Intent target, data type and application start up options.

This way, the "Portfolio" and "Chart" applications can be completely decoupled. If later the "Chart" application needs to be replaced, the new application for showing charts only needs to register the same Intent in order to replace the old one (provided that it works with the "Instrument" data structure as well).

Another case where the [**Intents**](../../../reference/core/latest/intents/index.html) API can be useful is if you want to find (and possibly filter) all apps that have registered a certain Intent. This may be because you want to present the user with all available (or appropriate) options for executing an action or handling data - e.g., on hover over an instrument or when clicking an instrument, the user sees a menu with all apps that have registered the Intent "ShowChart" *and* can work with the "Instrument" data structure:

1. All applications that can visualize data in charts register an Intent called "ShowChart", specifying the data structure they work with. Some of them work with "Instrument" data type, others work with different data types.

2. When the user clicks on an instrument in the "Portfolio" app, the "Portfolio" app searches for all registered Intents with a name "ShowChart" and filters them by the data type they work with. 

3. The user sees a menu built on the fly which shows all currently available apps for visualizing charts that work with "Instrument" data type.

## Registering Intents

Intents are registered either through the [application configuration](../application-management/index.html#enabling_application_management-application_definitions) (in the `glue.config.json` file), or dynamically at runtime (using the [`addIntentListener()`](../../../reference/core/latest/intents/index.htmll#!API-addIntentListener) method). Intents are configured under the `intents` top-level key of the application configuration.

It is possible for several applications to register an Intent with the same name, which is useful when several applications perform the same action or work with the same data structure. This allows for easy replacement of applications. You may have an old app that has registered an Intent called `"ShowChart"` which you want to replace with a new app. Your new app only needs to register the same Intent (you can either remove the old app or leave it as an additional option for the users who prefer it). No changes to the calling application are necessary - when it raises the `"ShowChart"` Intent, the new app will be called. 

Use the `intents` top-level key in the application configuration file to define an Intent:

```json
"intents": [
    {
        "name": "ShowChart",
        "displayName": "BBG Instrument Chart",
        "contexts": ["Instrument"]
    }
]
```

- `name` - **Required**. The name of the Intent;
- `displayName` - Optional human readable name of the Intent. Used in context menus to visualize the Intent;
- `contexts` - Optional array of types of predefined data structures with which the application works;

The [Intents API](../../../reference/core/latest/intents/index.html) is accessible through `glue.intents`.

*For detailed information on the Intents API, see the [**Intents**](../../../glue42-concepts/intents/javascript/index.html) documentation.*

*Live examples for Intents coming soon.*