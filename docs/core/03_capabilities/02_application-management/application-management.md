## Overview

The Application Management API provides a way to manage **Glue42 Core** applications. It offers abstractions for:

- **Application** - a web app as a logical entity, registered in **Glue42 Core** with some metadata (name, title, version, etc.) and with all the configuration needed to spawn one or more instances of it. The Application Management API provides facilities for retrieving application metadata and for detecting when an application has been started;

- **Instance** - a running copy of an application. The Application Management API provides facilities for starting/stopping application instances and tracking application and instance related events;

## Enabling Application Management

To enable the Application Management API in your applications, you need to provide configuration definitions for all applications you want to be accessible through the Application Management API and to initialize the [Glue42 Web](../../../reference/core/latest/glue42%20web/index.html) library with a custom configuration.

### Application Definitions

To define application configurations you have to use the `appManager` top-level key of the `glue.config.json` file of your project. You can provide application definitions directly in the `glue.config.json` file and/or from a remote application configuration store. 

*For more detailed explanations on the available properties for configuring applications, see the [Glue42 Environment: Configuration File](../../core-concepts/environment/overview/index.html#configuration_file) section.*

*The supported application definition formats (local and remote) are **Glue42 Core** and [FDC3](https://fdc3.finos.org/schemas/next/app-directory#tag/Application). The only requirement for an FDC3 application definition to be usable in **Glue42 Core** is to have a valid `details.url` or a `url` top-level property in its `manifest` JSON string property. You can see an example FDC3 application definition in the [FDC3 Compliancy: App Directory](../fdc3-compliance/index.html#fdc3_for_glue42_core-app_directory) section.*

- #### Local Application Definitions

Use the `localApplications` property of the `appManager` top-level key to define applications directly inside the `glue.config.json` file. Below is an example configuration for two applications: 

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "localApplications": [
            {
                "name": "Clients",
                "details": {
                    "url": "http://localhost:4242/clients"
                }
            },
            {
                "name": "Stocks",
                "details": {
                    "url": "http://localhost:4242/stocks",
                    "left": 0,
                    "top": 0,
                    "width": 860,
                    "height": 600
                }
            }
        ]
    }
}
```

- #### Remote Application Store

All specified remote application configuration stores will be polled at the provided interval (in ms) and the application definitions will be fetched with a `GET` request from the specified URL. The expected response is in a JSON format with the following shape:

```json
{
    "message": "OK",
    "applications": [
        // Application definitions.
        {
            "name": "Clients",
            "details": {
                "url": "http://localhost:4242/clients"
            }
        },
        {
            "name": "Stocks",
            "details": {
                "url": "http://localhost:4242/stocks",
                "left": 0,
                "top": 0,
                "width": 860,
                "height": 600
            }
        }
    ]
}
```

To specify remote application stores, use the `remoteSources` property of the `appManager` top-level key. You can define as many stores as you need:

Below is an example configuration for a remote application definition store that will be polled every 5 seconds for new definitions:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "remoteSources": [
            {
                "url": "http://localhost:3001/v1/apps/search",
                "pollingInterval": 5000
            }
        ]
    }
}
```

### Initializing the Application Management API

To enable the Application Management API, you have to pass a [`Config`](../../../reference/core/latest/glue42%20web/index.html#!Config) object when initializing the [Glue42 Web](../../../reference/core/latest/glue42%20web/index.html) library in your application. The configuration object must contain `{ appManager: true }` and the name of the application:

```javascript
const config = { appManager: true, application: "MyApplication" };
```

The application name is used by the platform to map it to the respective local/remote application definition that is then accessible through `glue.appManager.myInstance.application`. For the mapping to work, it is important that the application name provided to `GlueWeb()` is the same as the application name defined in the local/remote application configuration.

- JavaScript ([@glue42/web](https://www.npmjs.com/package/@glue42/web)) example:

```javascript
await window.GlueWeb({ appManager: true, application: "Clients" });
```

- React ([@glue42/react-hooks](https://www.npmjs.com/package/@glue42/react-hooks)) example:

```javascript
<GlueProvider config={{ appManager: true, application: "Clients" }}>
    ...
</GlueProvider>
```

- Angular ([@glue42/ng](https://www.npmjs.com/package/@glue42/ng)) example:

```javascript
Glue42Ng.forRoot({ factory: GlueWeb, config: { appManager: true, application: "Clients" } })
```

*For detailed information on the Application Management API, see the [**Application Management**](../../../glue42-concepts/application-management/javascript/index.html) documentation.*

In the next section, you will see an example that uses the Application Management API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Handling Applications, Application and Instance Events

App A below demonstrates how to discover the application definitions from the `glue.config.json` file using the [`applications()`](../../../reference/core/latest/appmanager/index.html#!API-applications) method of the Application Management API. It also allows you to start the applications using the [`start()`](../../../reference/core/latest/appmanager/index.html#!Application-start) method of the application object. Additionally, it lists all instances of running applications and allows you to stop them using the [`stop()`](../../../reference/core/latest/appmanager/index.html#!Instance-stop) method of the instance object.

App B is subscribed for the [`onInstanceStarted()`](../../../reference/core/latest/appmanager/index.html#!API-onInstanceStarted) and [`onInstanceStopped()`](../../../reference/core/latest/appmanager/index.html#!API-onInstanceStopped) events and logs when an instance has been started or stopped.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/app-manager/app-manager-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://v0fys.csb.app/app-a/index.html"></iframe>
    <iframe src="https://v0fys.csb.app/app-b/index.html"></iframe>
</div>