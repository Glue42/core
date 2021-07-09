## Overview

The [Notifications API](../../../reference/core/latest/notifications/index.html) provides a way to display native notifications with actions and to handle notification and action clicks. [**Glue42 Core**](https://glue42.com/core/) supports all available [`Notification`](https://developer.mozilla.org/en-US/docs/Web/API/Notification) settings as defined in the [DOM Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).

The [**Glue42 Core**](https://glue42.com/core/) Notifications API extends the DOM Notifications API with the option to handle notification and action clicks using [Interop](../../data-sharing-between-apps/interop/index.html#overview) methods.

## Configuration

[Raising notifications](../notifications-api/index.html#raising_notifications) without actions doesn't require any special setup of the [Main app](../../../developers/core-concepts/web-platform/overview/index.html) or the [Web Client](../../../developers/core-concepts/web-client/overview/index.html) applications.

If you want to raise a [notification with actions](../notifications-api/index.html#notification_actions), your [Main app](../../../developers/core-concepts/web-platform/overview/index.html) must register a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). There are two ways to register a Service Worker:

1. Use the `serviceWorker` property of the configuration object for the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library to provide the URL to the Service Worker file. The library will check the browser compatibility and register the Service Worker:

```javascript
const config = {
    serviceWorker: {
        url: "/service-worker.js"
    }
};

await GlueWebPlatform(config);
```

Use this option if you don't need the Service Worker in your project for anything other than raising notifications with actions.

2. Use the `serviceWorker` property of the configuration object for the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library to provide the [ServiceWorkerRegistration](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration) `Promise` returned from the registration of the Service Worker:

```javascript
const swPromise = navigator.serviceWorker.register("/service-worker.js");

const config = {
    serviceWorker: {
        registrationPromise: swPromise
    }
};

await GlueWebPlatform(config)
```

Use this option if you need access to the Service Worker in some other application-specific logic as well. 

## Glue42 Web Worker

Defining a Service Worker is specific for each application and is outside the scope of [**Glue42 Core**](https://glue42.com/core/). In order for a [**Glue42 Core**](https://glue42.com/core/) project to be able to correctly process notification actions and their respective click logic, you must include the [`@glue42/web-worker`](https://www.npmjs.com/package/@glue42/web-worker) package in your Service Worker file.

### Initialization

The [`@glue42/web-worker`](https://www.npmjs.com/package/@glue42/web-worker) package exports a default factory function and additionally attaches it to the Service Worker global scope. This offers two options for consuming the library.

The first option is to use the [`importScripts`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) function to add Glue42 Web Worker to the Service Worker scope and is suitable for basic Service Worker scripts:

```javascript
importScripts("/web.worker.umd.js");

self.GlueWebWorker();
```

The second option is to import the [`@glue42/web-worker`](https://www.npmjs.com/package/@glue42/web-worker) package in a dedicated Service Worker project the output of which will be a ready Service Worker script:

```javascript
const GlueWebWorker = require("@glue42/web-worker");

GlueWebWorker();
```

The `GlueWebWorker()` function adds a listener to the [`notificationclick`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event) event and sets up the necessary communication between the worker and the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform). This enables the custom action click logic of [**Glue42 Core**](https://glue42.com/core/) notifications.

### Configuration

The `GlueWebWorker()` function accepts an optional configuration object. Use it to specify handlers for notification and action clicks, as well as whether the worker should open the [Main app](../../../developers/core-concepts/web-platform/overview/index.html) if it is closed when the user clicks the notification.

The configuration object has the following signature:

```javascript
export interface WebWorkerConfig {
    platform?: {
        url: string;
        openIfMissing?: boolean;
    };
    notifications?: {
        defaultClick?: (event: Event, isPlatformOpened: boolean) => Promise<void>;
        actionClicks?: Glue42NotificationClickHandler[];
    };
};

export interface Glue42NotificationClickHandler {
    handler: (event: Event, isPlatformOpened: boolean) => Promise<void>;
    action: string;
};
```

| Property | Description |
|----------|-------------|
| `platform` | By default, the worker won't open the [Main app](../../../developers/core-concepts/web-platform/overview/index.html) when a notification is clicked. This property allows you to instruct the worker to open the Main app if it is closed when the user clicks the notification. |
| `url` | Location of the Main app. |
| `openIfMissing` | Whether to open the Main app if it is closed when the notification is clicked. |
| `notifications` | Allows you to specify custom logic that will be executed on notification or action click. |
| `defaultClick` | Logic that will be executed when the user clicks the notification. |
| `actionClick` | List of handlers that will be executed when the specified notification action is clicked. |
| `handler` | Handler for the notification action. |
| `action` | The title of the notification action for which the handler will be executed. |

### Functionality

The [`@glue42/web-worker`](https://www.npmjs.com/package/@glue42/web-worker) package exposes two additional functions - `raiseGlueNotification()` and `openCorePlatform()`. Both are attached to the Service Worker global scope and exported from the library.

- `openCorePlatform()` - asynchronous function that accepts the URL to the [Main app](../../../developers/core-concepts/web-platform/overview/index.html) as an argument and resolves with `void`. Opens the Main app and waits for the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library to be fully initialized and configured.

- `raiseGlueNotification()` - this function has the same signature as the [`raise()`](../../../reference/core/latest/notifications/index.html#API-raise) method of the [Notifications API](../notifications-api/index.html). It is meant to be used if your project utilizes the [Web Push Protocol](https://www.w3.org/TR/push-api/). In such scenario, the Main app is likely not opened and therefore the Service Worker is responsible for displaying the notification.