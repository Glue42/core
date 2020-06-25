## Overview

The Application Management API provides a way to manage Glue42 Core applications. It offers abstractions for:

Application - a web app as a logical entity, registered in Glue42 Core with some metadata (name, title, version, etc.) and with all the configuration needed to spawn one or more instances of it. The Application Management API provides facilities for retrieving application metadata and for detecting when an application is started.

Instance - a running copy of an application. The Application Management API provides facilities for starting/stopping application instances and tracking application related events.

## Initialization

To initialize the AppManager API inside of your application you need to:

1. Pass `{ appManager: true }` together with the application name on initialization. The application name is used by the platform to map it to a local/remote application definition that is then accessible using `glue.appManager.myInstance.application` (see 2.). For the mapping to work it is important that the application name provided to `GlueWeb` is the same as the application name defined inside the local/remote application definition of the application!

- Vanilla JS (*@glue42/web*) example:

```javascript
await window.GlueWeb({ appManager: true, application: 'Clients' });
```

- React (*@glue42/react-hooks*) example:

```javascript
<GlueProvider config={{ appManager: true, application: 'Clients' }}>
    ...
</GlueProvider>
```

- Angular (*@glue42/ng*) example:

```javascript
Glue42Ng.forRoot({ factory: GlueWeb, config: { appManager: true, application: 'Clients' } })
```

2. Inside of your `glue.config.json` file you need to provide an `appManager` property that defines the application definitions (`localApplications`) *and*/*or* the remote sources of application definitions (`remoteSources`).
The `remoteSources` of application will be fetched with a GET request at the provided pollingInterval (in milliseconds). The expected response is in the following format:

```json
{
    "message": "OK",
    "applications": [
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

You can read more about it inside of the [configuration section](../../core-concepts/environment/overview/index.html#configuration_file).

Below is an example configuration.

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
        ],
        "remoteSources": [
            {
                "url": "http://localhost:3001/v1/apps/search",
                "pollingInterval": 5000
            }
        ]
    }
}
```

In the next section, you will see an example that uses the AppManager API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Discovering and Starting of Applications, Application and Instance Events

App A below demonstrates how to discover the application definitions from `glue.config.json` using the [`applications()`](../../../reference/core/latest/appManager/index.html#!API-applications) method of the AppManager API. It also allows us to start the applications using the [`start()`](../../../reference/core/latest/appManager/index.html#!Application-start) method of the applications. Additionally it lists all instances of running applications and allows us to stop them using the instance's [`stop()`](../../../reference/core/latest/appManager/index.html#!Instance-stop) method.

App B is subscribed for the [`onInstanceStarted()`](../../../reference/core/latest/appManager/index.html#!API-onInstanceStarted) and [`onInstanceStopped()`](../../../reference/core/latest/appManager/index.html#!API-onInstanceStopped) events and logs whenever an instance is started/stopped.

The applications are defined inside of glue.config.json with their names and urls.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/app-manager/app-manager-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://hu9ve.csb.app/app-a/index.html"></iframe>
    <iframe src="https://hu9ve.csb.app/app-b/index.html"></iframe>
</div>
