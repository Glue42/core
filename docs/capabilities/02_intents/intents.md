## Overview

In certain workflow scenarios, your application may need to start (or activate) a specific application. For instance, you may have an application showing client portfolios with financial instruments. When the user clicks on an instrument, you want to start an application which shows a chart for that instrument. In other cases, you may want to present the user with several options for executing an action or handling data from the current application. 

The [Intents API](../../reference/core/latest/intents/index.html) makes all that possible by enabling applications to register, find and raise Intents.

The case with the "Portfolio" and the "Chart" application above can be implemented in the following way:

1. The "Chart" applications registers an Intent called "ShowChart", specifying the data type (predefined data structure) that it works with - e.g., "Instrument".

2. When the user clicks on on instrument, the "Portfolio" application raises the "ShowChart" Intent, optionally specifying an Intent target, data type and application start up options.

This way, the "Portfolio" and "Chart" applications can be completely decoupled. If later the "Chart" application needs to be replaced, the new application for showing charts only needs to register the same Intent in order to replace the old one (provided that it works with the "Instrument" data structure as well).

Another case where the Intents API can be useful is if you want to find (and possibly filter) all apps that have registered a certain Intent. This may be because you want to present the user with all available (or appropriate) options for executing an action or handling data - e.g., on hover over an instrument or when clicking an instrument, the user sees a menu with all apps that have registered the Intent "ShowChart" *and* can work with the "Instrument" data structure:

1. All applications that can visualize data in charts register an Intent called "ShowChart", specifying the data structure they work with. Some of them work with "Instrument" data type, others work with different data types.

2. When the user clicks on an instrument in the "Portfolio" app, the "Portfolio" app searches for all registered Intents with a name "ShowChart" and filters them by the data type they work with. 

3. The user sees a menu built on the fly which shows all currently available apps for visualizing charts that work with "Instrument" data type.

## Defining Intents

Intents are either defined through the [application configuration](../application-management/index.html#application_definitions), or dynamically at runtime. Intents are configured under the `intents` top-level key of the application configuration object defined in the [Main application](../../developers/core-concepts/web-platform/overview/index.html).

It is possible for different applications to register an Intent with the same name, which is useful when several applications perform the same action or work with the same data structure. This allows for easy replacement of applications. You may have an old app that has registered an Intent called `"ShowChart"` which you want to replace with a new app. Your new app only needs to register the same Intent (you can either remove the old app or leave it as an additional option for the users who prefer it). No changes to the calling application are necessary - when it raises the `"ShowChart"` Intent, the new app will be called. 

Use the `intents` top-level key in the application configuration to define an Intent:

```javascript
const config = {
    applications: {
        local: [
            {
                name: "Instrument Chart",
                details: {
                    url: "http://localhost:4242/chart"
                },
                // Intent definitions.
                intents: [
                    {
                        name: "ShowChart",
                        displayName: "BBG Instrument Chart",
                        contexts: ["Instrument"]
                    }
                ]
            }
        ]
    }
};

const { glue } = await GlueWebPlatform(config);
```

| Property | Description |
|----------|-------------|
| `name` | **Required**. The name of the Intent. |
| `displayName` | The human readable name of the Intent. Can be used in context menus, etc., to visualize the Intent. |
| `contexts` | The type of predefined data structures with which the application can work. |

## Finding Intents

The Intents API is accessible through the [`glue.intents`](../../reference/core/latest/intents/index.html) object.

To find all registered Intents, use the [`all()`](../../reference/core/latest/intents/index.html#API-all) method:

```javascript
const allIntents = await glue.intents.all();
```

To get a collection of all Intents that fit certain criteria, use the [`find()`](../../reference/core/latest/intents/index.html#API-find) method:

```javascript
const intents = await glue.intents.find("ShowChart");
```

The [`find()`](../../reference/core/latest/intents/index.html#API-find) method accepts a string or an [`IntentFilter`](../../reference/core/latest/intents/index.html#IntentFilter) object as an optional argument. The [`IntentFilter`](../../reference/core/latest/intents/index.html#IntentFilter) has the following optional properties:

| Property | Description |
|----------|-------------|
| `name` | Name of the Intent for which to search. |
| `contextType` | Context type (pre-defined data structure - e.g., `"Instrument"`) with which the Intent handler works. |

If no filter is supplied, [`find()`](../../reference/core/latest/intents/index.html#API-find) returns all registered Intents.

## Raising Intents

To raise an Intent, use the [`raise()`](../../reference/core/latest/intents/index.html#API-raise) method:

```javascript
await glue.intents.raise("ShowChart");
```

The [`raise()`](../../reference/core/latest/intents/index.html#API-raise) method accepts an Intent name as a string or an [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object as a required argument. The only required property of the [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object is [`intent`](../../reference/core/latest/intents/index.html#IntentRequest-intent) which must specify the name of the Intent to be raised.

## Targeting Intent Handlers

When raising an Intent, optionally target one or more Intent handlers using the [`target`](../../reference/core/latest/intents/index.html#IntentRequest-target) property of the [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object:

```javascript
const intent = await glue.intents.find("ShowChart")[0];
const intentHandler = intent.handlers[0];

const intentRequest = {
    intent: "ShowChart",
    target: { app: intentHandler.applicationName }
}

await glue.intents.raise(intentRequest);
```

The [`target`](../../reference/core/latest/intents/index.html#IntentRequest-target) property of the [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object accepts the following values:


| Value | Description |
|-------|-------------|
| `"startNew"` | Will start a new instance of the first available Intent handler. |
| `"reuse"` | Will reuse the first available running instance of an Intent handler or will fall back to `"startNew"` if there are no running instances available. |
| `{ app?: string, instance?: string}` | An object with optional `app` and `instance` properties. The `app` property accepts an application name, the `instance` property - an ID of a running application instance. Provide a value for the `app` property to start a new instance of a specific Intent handler application. The application name is available in the `applicationName` property of the [`IntentHandler`](../../reference/core/latest/intents/index.html#IntentHandler) object. Provide a value for the `instance` property to reuse a specific running instance of an Intent handler. The ID of an Intent handler instance is available in the `instanceId` property of the [`IntentHandler`](../../reference/core/latest/intents/index.html#IntentHandler) object. Using this targeting option gives you full control over the choice of an appropriate Intent handler. |

The default value for the `target` property is `"startNew"` when the Intent has been defined in an application configuration. If the Intent has been [registered dynamically](#registering_intents_at_runtime), the default value is `"reuse"`.

The [`IntentHandler`](../../reference/core/latest/intents/index.html#IntentHandler) object has a `type` property which shows whether the Intent handler is an application that will be started (`type: "app"`), or an already running instance of an Intent handler (`type: "instance"`).

*Note that in order for the running Intent handler instance to be registered as type `"instance"`, the application must use the [`addIntentListener()`](../../reference/core/latest/intents/index.html#API-addIntentListener) method in its code to handle context updates (see [Handling Context Updates](#context-handling_context_updates)) or to register an Intent at runtime (see [Registering Intents at Runtime](#registering_intents_at_runtime)). Otherwise, the running Intent handler instance will be of type `"app"`.*

## Context

### Passing Initial Context

To pass initial context to the Intent handler, use the [`context`](../../reference/core/latest/intents/index.html#IntentRequest-context) property of the [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object. It accepts an [`IntentContext`](../../reference/core/latest/intents/index.html#IntentContext) object as a value:

```javascript
const intentRequest = {
    intent: "ShowChart",
    target: "startNew"
    context: {
        type: "Instrument",
        data: {
            // Context for the started application.
            RIC: "MSFT"
        }
    },
    // Specify application start options for the Intent handler.
    options: {
        width: 300,
        height: 200
    }
}

await glue.intents.raise(intentRequest);
```

The [`type`](../../reference/core/latest/intents/index.html#IntentContext-type) property of the [`IntentContext`](../../reference/core/latest/intents/index.html#IntentContext) object is required and specifies the structure of the context object. The [`data`](../../reference/core/latest/intents/index.html#IntentContext-data) property is the actual data to be passed to the Intent handler.

The [`options`](../../reference/core/latest/intents/index.html#IntentRequest-options) property of the [`IntentRequest`](../../reference/core/latest/intents/index.html#IntentRequest) object is used to pass custom [`ApplicationStartOptions`](../../reference/core/latest/appmanager/index.html#ApplicationStartOptions) to the Intent handler.

### Handling Context Updates

To handle the context data passed when an Intent is raised and targeted at your application, use the [`addIntentListener()`](../../reference/core/latest/intents/index.html#API-addIntentListener) method. It has two required parameters - an Intent name and a context handler definition:

```javascript
// Context handler definition.
function contextHandler (context) {
    // Check the context type.
    const contextType = context.type;

    if (contextType === "Instrument") {
        // Extract the context data.
        const data = context.data;
        // Аpplication specific logic for handling the new context data.
    };
};

glue.intents.addIntentListener("ShowChart", contextHandler);
```

## Registering Intents at Runtime

To register an Intent at runtime, use the [`addIntentListener()`](../../reference/core/latest/intents/index.html#API-addIntentListener) method. Besides an Intent name, this method also accepts an object describing an Intent as a first required parameter:

```javascript
// Intent definition.
const intent = {
    intent: "ShowChart",
    contextTypes: ["Instrument"],
    displayName: "Fidessa Instrument Chart",
    icon: "https://example.com/resources/icon.ico"
};

// Context handler.
function contextHandler (context) {
    // Check the context type.
    const contextType = context.type;

    if (contextType === "Instrument") {
        // Extract the context data.
        const data = context.data;
        // Аpplication specific logic for handling the new context data.
    };
};

glue.intents.addIntentListener(intent, contextHandler);
```

*Note that when you register an Intent only at runtime (the Intent is not defined in an application configuration), your application must be running in order to handle the Intent and it will always be of type `"instance"`. If your application is not running when this Intent is raised, it will not be available as a possible Intent handler.*

*Live examples for Intents coming soon.*

## Reference

[Intents API Reference](../../reference/core/latest/intents/index.html)