## Overview

The [Workspaces](../../../reference/core/latest/workspaces/index.html) library offers advanced window management functionalities. Using Workspaces, users are able to arrange multiple applications within the same visual window (called **Frame**). This arrangement can be performed programmatically or by dragging and dropping applications within the Frame. Users can also save Workspace layouts and restore them within the same Frame or even in different Frames.

The Glue42 Workspaces enable the users to compose a custom arrangement of applications by treating each application as an individual building block that can be added, removed, moved or resized within a Workspace. The Frame can hold multiple Workspaces (as tabs) and can also be maximized, minimized or resized. 

*For detailed information on the Workspaces API, see the [Workspaces](../../../glue42-concepts/windows/workspaces/javascript/index.html) documentation.*

## Workspaces Concepts

### Frame

The Frame is a web application also called Workspaces App. This application is the shell that can hold multiple Workspaces as tabs in a single or multiple windows (frames). The Frame application is a vital element in the Workspaces functionality as it handles opening and closing Workspaces, arranging windows in a Workspace, adding or removing Workspaces and windows.

A fully functioning Workspaces App is available in **Glue42 Enterprise**. For **Glue42 Core** projects, however, you have to create your own Workspaces App. This is extremely simple, as the Workspaces App functionality is provided as a single React component by the [@glue42/workspaces-ui-react](https://www.npmjs.com/package/@glue42/workspaces-ui-react) library. For more details on how to create and customize your own Workspaces App, see the [Extending Workspaces](../../../glue42-concepts/windows/workspaces/overview/index.html#extending_workspaces) documentation.

*It is important to note that the `<Workspaces>` component provided by the library is not meant to be used as a typical React component. Besides its rendering responsibilities, it also contains heavy logic. This component is meant to allow you to create a dedicated Workspaces App which must function as a standalone window - you must never use it as a part of another application, as this will lead to malfunctioning. The Workspaces App should be customized only using the available extensibility points.*

### Workspace

A Workspace contains one or more applications (windows) arranged in columns, rows or groups of tabbed windows. Each application acts as a building block of a Workspace and can be resized, maximized, restored within a Workspace. Applications can be added to a Workspace (by drag and drop or programmatically) and can also be ejected from a Workspace as floating windows. The arrangement of each Workspace can be uniquely suited to provide the necessary layout and functionalities for performing tasks quickly and intuitively. Instead of wasting time and effort in finding, opening and arranging the relevant applications, restore the respective Workspace with a single click.

### Workspace Layout

A Workspace layout is a JSON object which describes the model of a Workspace. It contains the name of the Workspace, the structure of its children and how they are arranged, the names of each application present in the Workspace, context and other settings. This layout is the blueprint used by the API to build the Workspace and its components.

Through the Workspaces UI the users can create, modify, save and delete a Workspace layout. The Workspace layouts are saved locally through the `IndexedDB` API of the user's browser.

The example below shows the shape of a simple Workspace layout object containing two applications:

```javascript
const layout = {
    children: [
        {
            type: "column",
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "clientlist"
                        }
                    ]
                },
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "clientportfolio"
                        }
                    ]
                }
            ]
        }
    ]
};
```

#### Allowing Apps in the "Add Application" Menu 

To control whether an app will be available in the Workspace "Add Application" menu (the dropdown that appears when you click the "+" button to add an application), use the `includeInWorkspaces` property of the `customProperties` top-level key in your application definition:

```javascript
const config = {
    applications: {
        local: [
            {
                name: "my-app",
                title: "My App",
                details: {
                    url: "https://my-domain.com/my-app"
                },
                customProperties: {
                    includeInWorkspaces: true
                }
            }
        ]
    }
};
```

By default, this property is set to `false`.

*For more details on application definitions, see the [Application Management](../application-management/index.html#application_definitions) section.*

## Enabling Workspaces

The Workspaces Frame is mandatory for using any Workspaces functionality (see [Frame](#workspaces_concepts-frame) in the previous section).

Enabling Workspaces means including the [Workspaces API](../../../reference/core/latest/workspaces/index.html) library in your [Main app](../../core-concepts/web-platform/overview/index.html) and [Web Client](../../core-concepts/web-client/overview/index.html) applications and configuring the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in your Main application to support Workspaces.

### Main Application

The [Main app](../../core-concepts/web-platform/overview/index.html) is the place where you must specify the location of your Workspaces App. Use the `workspaces` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../core-concepts/web-platform/overview/index.html) to do so:

```javascript
const config = {
    workspaces: {
        src: "https://my-workspaces-app.com"
    }
};
```

This points the Glue42 Web Platform where to look for the Workspaces App, which handles all Workspaces logic. Of course, the Web Platform app is also a Web Client, so you must provide the [Workspaces API](../../../reference/core/latest/workspaces/index.html) library too:

```javascript
const config = {
    workspaces: {
        src: "https://my-workspaces-app.com"
    },
    glue: {
        libraries: [GlueWorkspaces]
    }
};
```

Finally, you must configure the `layouts` property to ensure that the Workspace layouts will function properly:

```javascript
import GlueWebPlatform from "@glue42/web-platform";
import GlueWorkspaces from "@glue42/workspaces-api";

// Provide the location of your Workspaces App,
// the Workspaces API library and configure the Layouts library.
const config = {
    workspaces: {
        src: "https://my-workspaces-app.com"
    },
    glue: {
        libraries: [GlueWorkspaces]
    },
    layouts: {
        mode: "session",
        // Workspace layout definition objects.
        local: [ {...}, {...}]
    }
};

const { glue } = await GlueWebPlatform(config);
```

The `mode` property accepts two values - `"session"` or `"idb"`. Use the `"idb"` setting if you want the Workspace layouts to be persisted using the `IndexedDB` API of the browser.This option is useful for testing and PoC purposes, because it simulates persisting and manipulating Workspace layouts on a server. The `"session"` setting means that the Workspace layouts will be handled using the browser session storage. Once the browser session is over (e.g., the user closes the Main app window), all user-created layouts will be lost. If the Main app is only refreshed, however, the Workspace layouts will still be available.

The `local` property expects an array of Workspaces layout objects (see [Workspace Layout](#workspaces_concepts-workspace_layout) in the previous section). On startup, these predefined layouts will be imported and merged with the already existing Workspace layouts and the layouts with the same names will be replaced. This ensures that the user-created layouts will not be removed when in `"idb"` mode.

### Web Client Applications

To enable the [Workspaces API](../../../reference/core/latest/workspaces/index.html) in your [Web Client](../../core-concepts/web-client/overview/index.html) applications, install the [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) and [`@glue42/workspaces-api`](https://www.npmjs.com/package/@glue42/workspaces-api) packages and initialize the [Glue42 Web](../../../reference/core/latest/glue42%20web/index.html) library by passing the `GlueWorkspaces()` factory function in the configuration object. When `GlueWeb()` resolves, the Workspaces API will be accessible through the `workspaces` property of the returned object - e.g., `glue.workspaces`. Below you can see examples of how to enable the Workspaces API in JavaScript, React and Angular applications.

#### JavaScript

Install the necessary packages:

```cmd
npm install --save @glue42/web @glue42/workspaces-api
```

Initialize the Glue42 Web library enabling the Workspaces API:

```javascript
const config = {
    libraries: [GlueWorkspaces]
};
const glue = await GlueWeb(config);

// Now you can access the Workspaces API through `glue.workspaces`.
```

By default, the `GlueWeb()` and `GlueWorkspaces()` factory functions are attached to the global `window` object.

#### React

Install the necessary packages:

```cmd
npm install --save @glue42/react-hooks @glue42/workspaces-api
```

Initialize Glue42 either by: 

- using the `GlueProvider` component:

```javascript
import GlueWeb from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";
import { GlueProvider } from "@glue42/react-hooks";

ReactDOM.render(
    <GlueProvider fallback={<h2>Loading...</h2>} glueFactory={GlueWeb} config={{ libraries: [GlueWorkspaces] }}>
        <App />
    </GlueProvider>,
    document.getElementById("root")
);
```

-  or using the `useGlueInit()` hook:

```javascript
import GlueWeb from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";
import { useGlueInit } from "@glue42/react-hooks";

const App = () => {
    const config = {
        libraries: [GlueWorkspaces]
    };
    const glue = useGlueInit(config, GlueWeb);

    return glue ? <Main glue={glue} /> : <Loader />;
};

export default App;
```

#### Angular

Install the necessary packages:

```cmd
npm install --save @glue42/ng @glue42/workspaces-api
```

Pass the `GlueWorkspaces()` factory function to `GlueWeb()` using the `config` object:

```javascript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        Glue42Ng.forRoot({ factory: GlueWeb, config: { libraries: [GlueWorkspaces] } })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
``` 

## Manipulating a Workspace

The application below represents a fully functioning Workspace. There are two registered apps which you can use to customize the Workspace layout. You can:

- drag and drop the already opened apps to form new rows, columns or window groups;
- maximize and restore a window or window group;
- eject a window from a Workspace;
- reorder the window and Workspace tabs;
- add new application instances to the current Workspace (in the current column, row or group);
- resize the windows in the Workspace by dragging their borders;
- close and restore a Workspace within the same Frame;
- create a new Workspace, customize its layout and save it;

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/workspaces/basic" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://qm32p.csb.app"></iframe>
</div>

## Restoring and Closing Workspaces

The application below demonstrates how to restore and close programmatically already defined Workspace layouts. Click the "Open" button of either of the two defined Workspaces to open an instance of it. The application will log the ID of the newly opened instance and provide a "Close" button for closing this particular Workspace instance. You can also define a custom context which the restored Workspace will pass to all applications participating in it. You can manipulate freely the restored Workspaces, as in the previous example. 

*Keep in mind that if you create and save a new Workspace, you will have to refresh the app to see the newly saved Workspace layout. If you close a restored Workspace directly from its frame and then try to close it from the "Close" button for its instance, the app will show an error that this Workspace has already been closed.*

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/workspaces/workspaces-listing" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://jc4z0.csb.app/"></iframe>
</div>