## Overview

The Application Management API provides a way to manage **Glue42 Core** applications. It offers abstractions for:

- **Application** - a web app as a logical entity, registered in **Glue42 Core** with some metadata (name, title, version, etc.) and with all the configuration needed to spawn one or more instances of it. The Application Management API provides facilities for retrieving application metadata and for detecting when an application has been started;

- **Instance** - a running copy of an application. The Application Management API provides facilities for starting/stopping application instances and tracking application and instance related events;

*For detailed information on the Application Management API, see the [Application Management](../../../glue42-concepts/application-management/javascript/index.html) documentation.*

## Application Definitions

To participate in the Application Management API, each application in a **Glue42 Core** project must have an application definition. Application definitions are supplied using the `applications` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../core-concepts/web-platform/overview/index.html). Use the `local` property of the `applications` object to specify an array of application [`Definition`]() objects.

The following example demonstrates defining two applications when initializing the Web Platform library:

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    applications: {
        local: [
            {
                name: "my-app",
                title: "My App",
                details: {
                    url: "https://my-domain.com/my-app"
                }
            },
            {
                name: "my-other-app",
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

The only required top-level properties are `name` and `details`. The `details` object has a required `url` property that you must use to specify the location of your application.

Application definitions in **Glue42 Core** are compatible with **Glue42 Enterprise**.

The [Main app](../../core-concepts/web-platform/overview/index.html) is the central hub that provides application information to all [Web Client](../../core-concepts/web-client/overview/index.html) apps. It is responsible for starting, managing, tracking the lifecycle and stopping all application instances, as well as for firing application related events.

*The supported application definition formats are **Glue42 Core** and [FDC3](https://fdc3.finos.org/schemas/next/app-directory#tag/Application). The only requirement for an FDC3 application definition to be usable in **Glue42 Core** is to have a valid `details.url` or a `url` top-level property in its `manifest` JSON string property. You can see an example FDC3 application definition in the [FDC3 Compliancy: App Directory](../fdc3-compliance/index.html#fdc3_for_glue42_core-app_directory) section.*

The examples in the next sections demonstrate using the Application Management API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

## Handling Applications, Application and Instance Events

App A below demonstrates how to discover the available application definitions using the [`applications()`](../../../reference/core/latest/appmanager/index.html#!API-applications) method of the Application Management API. It also allows you to start the applications using the [`start()`](../../../reference/core/latest/appmanager/index.html#!Application-start) method of the application object. Additionally, it lists all instances of running applications and allows you to stop them using the [`stop()`](../../../reference/core/latest/appmanager/index.html#!Instance-stop) method of the instance object.

App B is subscribed for the [`onInstanceStarted()`](../../../reference/core/latest/appmanager/index.html#!API-onInstanceStarted) and [`onInstanceStopped()`](../../../reference/core/latest/appmanager/index.html#!API-onInstanceStopped) events and logs when an instance has been started or stopped.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/app-manager/app-manager-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://v0fys.csb.app/app-a/index.html"></iframe>
    <iframe src="https://v0fys.csb.app/app-b/index.html"></iframe>
</div>