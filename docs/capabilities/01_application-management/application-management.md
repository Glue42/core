## Overview

The Application Management API provides a way to manage [**Glue42 Core**](https://glue42.com/core/) applications. It offers abstractions for:

- **Application** - a web app as a logical entity, registered in [**Glue42 Core**](https://glue42.com/core/) with some metadata (name, title, version, etc.) and with all the configuration needed to spawn one or more instances of it. The Application Management API provides facilities for retrieving application metadata and for detecting when an application has been started;

- **Instance** - a running copy of an application. The Application Management API provides facilities for starting/stopping application instances and tracking application and instance related events;

## Application Definitions

To participate in the Application Management API, each application in a [**Glue42 Core**](https://glue42.com/core/) project must have an application definition. Application definitions are supplied using the `applications` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../developers/core-concepts/web-platform/overview/index.html). Use the `local` property of the `applications` object to specify an array of application [`Definition`](../../reference/core/latest/appmanager/index.html#Definition) objects.

The following example demonstrates defining two applications when initializing the Web Platform library:

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    applications: {
        local: [
            {
                name: "my-app",
                type: "window",
                title: "My App",
                details: {
                    url: "https://my-domain.com/my-app"
                }
            },
            {
                name: "my-other-app",
                type: "window",
                title: "My Other App",
                details: {
                    url: "https://my-domain.com/my-other-app"
                }
            }
        ]
    }
};

const { glue } = await GlueWebPlatform(config);
```

The only required top-level properties are `name`, `details` and `type`. The `details` object has a required `url` property that you must use to specify the location of your application.

Application definitions in [**Glue42 Core**](https://glue42.com/core/) are compatible with [**Glue42 Enterprise**](https://glue42.com/enterprise/).

The [Main app](../../developers/core-concepts/web-platform/overview/index.html) is the central hub that provides application information to all [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps. It is responsible for starting, managing, tracking the lifecycle and stopping all application instances, as well as for firing application related events.

*The supported application definition formats are [**Glue42 Core**](https://glue42.com/core/) and [FDC3](https://fdc3.finos.org/schemas/next/app-directory#tag/Application). The only requirement for an FDC3 application definition to be usable in [**Glue42 Core**](https://glue42.com/core/) is to have a valid `details.url` property or a `url` top-level property in its `manifest` JSON string property. You can see an example FDC3 application definition in the [FDC3 Compliance: App Directory](../../getting-started/fdc3-compliance/index.html#fdc3_for_glue42_core-app_directory) section.*

The [Live Examples](#live_examples) section demonstrates using the Application Management API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

## Managing Application Definitions at Runtime

The Application Management API is accessible through the [`glue.appManager`](../../reference/core/latest/appmanager/index.html) object.

Application definitions can be imported, exported and removed at runtime using the [`InMemory`](../../reference/core/latest/appmanager/index.html#InMemory) object of the Application Management API. 

*Note that all application [`Definition`](../../reference/core/latest/appmanager/index.html#Definition) objects provided at runtime are stored in-memory and the methods of the `InMemory` object operate only on them - i.e., the application definitions provided during the initialization of the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library aren't affected.*

### Import

To import a list of application definitions at runtime, use the [`import()`](../../reference/core/latest/appmanager/index.html#InMemory-import) method:

```javascript
const definitions = {
    {
        name: "my-app",
        type: "window",
        title: "My App",
        details: {
            url: "https://my-domain.com/my-app"
        }
    },
    {
        name: "my-other-app",
        type: "window",
        title: "My Other App",
        details: {
            url: "https://my-domain.com/my-other-app"
        }
    }
};
const mode = "merge";
const importResult = await glue.appManager.inMemory.import(definitions, mode);
```

The `import()` method accepts a list of [`Definition`](../../reference/core/latest/appmanager/index.html#Definition) objects as a first parameter and an import mode as a second. There are two import modes - `"replace"` (default) and `"merge"`. Using `"replace"` will replace all existing in-memory definitions with the provided ones, while using `"merge"` will merge the existing ones with the provided ones, replacing the application definitions with the same name. Use the `imported` property of the returned [`ImportResult`](../../reference/core/latest/appmanager/index.html#ImportResult) object to see a list of the successfully imported definitions and its `errors` property to see a list of the errors:

```javascript
const importedApps = importResult.imported;
const errors = importResult.errors;

importedApps.forEach(console.log);
errors.forEach(e => console.log(`App: ${e.app}, Error: ${e.error}`));
```

### Export

To export a list of already imported in-memory application definitions, use the [`export()`](../../reference/core/latest/appmanager/index.html#InMemory-export) method:

```javascript
const definitions = await glue.appManager.inMemory.export();
```

### Remove

To remove a specific in-memory application definition, use the [`remove()`](../../reference/core/latest/appmanager/index.html#InMemory-remove) method and provide the application name:

```javascript
await glue.appManager.inMemory.remove("my-app");
```

### Clear

To clear all imported in-memory definitions, use the [`clear()`](../../reference/core/latest/appmanager/index.html#InMemory-clear) method:

```javascript
await glue.appManager.inMemory.clear();
```

## Listing Applications

To see a list of all applications available to the current user, use the [`applications()`](../../reference/core/latest/appmanager/index.html#API-applications) method:

```javascript
const applications = glue.appManager.applications();
```

### Specific Application

To get a reference to a specific application, use the [`application()`](../../reference/core/latest/appmanager/index.html#API-application) method and pass the name of the application as an argument:

```javascript
const app = glue.appManager.application("ClientList");
```

### Current Application Instance

To get a reference to the instance of the current application, use the [`myInstance`](../../reference/core/latest/appmanager/index.html#API-myInstance) property:

```javascript
const myInstance = glue.appManager.myInstance;
```

## Starting Applications

To start an application, use the [`start()`](../../reference/core/latest/appmanager/index.html#Application-start) method of the [`Application`](../../reference/core/latest/appmanager/index.html#Application) object:

```javascript
const app = glue.appManager.application("ClientList");

const appInstance = await app.start();
```

The `start()` method accepts two optional parameters - a context object (object in which you can pass custom data to your app) and an [`ApplicationStartOptions`](../../reference/core/latest/appmanager/index.html#ApplicationStartOptions) object:

```javascript
const app = glue.appManager.application("ClientList");
const context = { selectedUser: 2 };
const startOptions = { height: 400, width: 500 };

const appInstance = await app.start(context, startOptions);
```

## Listing Running Instances

To list all running instances of all applications, use the [`instances()`](../../reference/core/latest/appmanager/index.html#API-instances) method:

```javascript
// Returns a collection of the running instances of all apps.
glue.appManager.instances();
```

## Stopping Instances

To stop a running instance, use the [`stop()`](../../reference/core/latest/appmanager/index.html#Instance-stop) method of an instance object:

```javascript
await appInstance.stop();
```

## Events

### Application Events

The set of applications defined for the current user can be changed at runtime. To track the events which fire when an application has been added, removed or updated, use the respective methods exposed by the Application Management API.

Application added event:

```javascript
const handler = application => console.log(application.name);

// Notifies you when an application has been added.
const unsubscribe = glue.appManager.onAppAdded(handler);
```

Application removed event:

```javascript
const handler = application => console.log(application.name);

// Notifies you when an application has been removed.
const unsubscribe = glue.appManager.onAppRemoved(handler);
```

Application updated event:

```javascript
const handler = application => console.log(application.name);

// Notifies you when an application configuration has been updated.
const unsubscribe = glue.appManager.onAppChanged(handler);
```

### Instance Events

To monitor instance related events globally (for all instances of all applications running in [**Glue42 Core**](https://glue42.com/core/)) or on an application level (only instances of a specific application), use the respective methods exposed by the Application Management API.

#### Global

The [`appManager`](../../reference/core/latest/appmanager/index.html#API) object offers methods which you can use to monitor instance events for all applications running in [**Glue42 Core**](https://glue42.com/core/). Get notified when an application instance has started, stopped, has been updated or when starting an application instance has failed. The methods for handling instance events receive a callback as a parameter which in turn receives the application instance as an argument. All methods return an unsubscribe function - use it to stop receiving notifications about instance events.

Instance started event:

```javascript
const handler = instance => console.log(instance.id);

const unsubscribe = glue.appManager.onInstanceStarted(handler);
```

Instance stopped event:

```javascript
const handler = instance => console.log(instance.id);

const unsubscribe = glue.appManager.onInstanceStopped(handler);
```

#### Application Level

To monitor instance events on an application level, use the methods offered by the [`Application`](../../reference/core/latest/appmanager/index.html#Application) object. The methods for handling instance events receive a callback as a parameter which in turn receives the application instance as an argument.

Instance started event:

```javascript
const app = glue.appManager.application("ClientList");
const handler = instance => console.log(instance.id);

app.onInstanceStarted(handler);
```

Instance stopped event:

```javascript
const app = glue.appManager.application("ClientList");
const handler = instance => console.log(instance.id);

app.onInstanceStopped(handler);
```

## Live Examples

### Handling Applications, Application and Instance Events

App A below demonstrates how to discover the available application definitions using the [`applications()`](../../reference/core/latest/appmanager/index.html#API-applications) method of the Application Management API. It also allows you to start the applications using the [`start()`](../../reference/core/latest/appmanager/index.html#Application-start) method of the application object. Additionally, it lists all instances of running applications and allows you to stop them using the [`stop()`](../../reference/core/latest/appmanager/index.html#Instance-stop) method of the instance object.

App B is subscribed for the [`onInstanceStarted()`](../../reference/core/latest/appmanager/index.html#API-onInstanceStarted) and [`onInstanceStopped()`](../../reference/core/latest/appmanager/index.html#API-onInstanceStopped) events and logs when an instance has been started or stopped.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/app-manager/app-manager-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://v0fys.csb.app/" style="border: none;"></iframe>
</div>

## Reference

[Application Management API Reference](../../reference/core/latest/appmanager/index.html)