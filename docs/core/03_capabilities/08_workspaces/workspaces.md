## Overview

The [**Workspaces**](../../../reference/core/latest/workspaces/index.html) library offers advanced window management functionalities. Using Workspaces, users are able to arrange multiple applications within the same visual window (called **Frame**). This arrangement can be performed programmatically or by dragging and dropping applications within the Frame. Users can also save Workspace layouts and restore them within the same Frame or even in different Frames.

The Glue42 Workspaces enable the users to compose a custom arrangement of applications by treating each application as an individual building block that can be added, removed, moved or resized within a Workspace. The Frame can hold multiple Workspaces (as tabs) and can also be maximized, minimized or resized. 

*For detailed information on the Workspaces API, see the [**Workspaces**](../../../glue42-concepts/windows/workspaces/javascript/index.html) documentation.*

## Workspaces Concepts

### Frame

The Frame is a web application (also called Workspaces App) which comes with the [`@glue42/workspaces-app`](https://www.npmjs.com/package/@glue42/workspaces-app) package. This application is the shell that can hold multiple Workspaces as tabs in a single or multiple windows (frames). The Frame application is a vital element in the Workspaces functionality as it handles opening and closing Workspaces, arranging windows in a Workspace, adding or removing Workspaces and windows.

### Workspace

A Workspaces can contain one or more applications (windows) arranged in columns, rows or groups of tabbed windows. Each application acts as a building block of a Workspace and can be resized, maximized, restored within a Workspace. Applications can be added to a Workspace (by drag and drop or programmatically) and can also be ejected from a Workspace as floating windows. The arrangement of each Workspace can be uniquely suited to provide the necessary layout and functionalities for performing tasks quickly and intuitively. Instead of wasting time and effort in finding, opening and arranging the relevant applications, the end users can now restore the respective Workspace with a single click.

### Workspace Layout

A Workspace layout is a JSON object which describes the model of a Workspace. It contains the name of the Workspace, the structure of its children and how they are arranged, the names of each application present in the Workspace, context and other settings. This layout is the blueprint used by the API to build the Workspace and its components. The Workspace layouts can be defined in the [`glue.layouts.json`](../../core-concepts/environment/overview/index.html#workspace_layouts) file which is part of the [**Glue42 Environment**](../../core-concepts/environment/overview/index.html) of a **Glue42 Core** project. These layouts are accessible to the end users but cannot be overwritten by them. The users, however, can modify a Workspace and save the modified layout as a new Workspace layout. This new layout is saved locally through the `IndexedDB` API of the user's browser.

## Enabling Workspaces

Enabling Workspaces includes:

- modifying the Glue42 Environment files (installing the necessary packages, configuring the settings related to Workspaces and creating Workspace layouts);
- modifying the initialization configuration of the [**Glue42 Client**](../../core-concepts/glue42-client/overview/index.html#initializing_a_glue42_client) applications (adding the Workspaces API to [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html)). 

### Environment Files

#### Environment Setup

If you are starting a brand new **Glue42 Core** project and you want to set up your development environment with Workspaces enabled, go to your project root directory and run:

```cmd
gluec init -w
```

This command will set up all Glue42 Environment files, including the Workspaces App and the configurations necessary to enable Workspaces.

If you are already working on a project that was started with the `gluec init` command and now you just want to add Workspaces support to your development environment, run:

```cmd
gluec workspaces init
```

This command will get all the required Workspaces packages, create the necessary files and edit your existing configuration files by adding the defaults for Workspaces.

#### Defining Applications

Next, you have to create application definitions in the `glue.config.json` file for the apps you want to use in Workspaces. For information on how to do that, see the [**Application Management: Application Definitions**](../application-management/index.html#enabling_application_management-application_definitions) section.

#### Creating Workspace Layouts

Finally, you need to create one or more Workspace layouts. You can [define Workspace layouts manually](#manual_setup) in the `workspaces` array of the `glue.layouts.json` file (not recommended - a Workspace layout can quickly become very complex) or you can use the Glue42 CLI to access the Workspaces Builder to create and save Workspace layouts.

Assuming your development environment has already been initialized with Workspaces, run the [Glue42 CLI development server](../../core-concepts/cli/index.html#serve):

```cmd
gluec serve
```

Open another command prompt and launch the Workspaces Builder:

```cmd
gluec workspaces build
```

This command will open your default browser and navigate to the Workspace Builder page. 

*For best experience, it is recommended to set Chrome as your default browser.*

You will be presented with a blank, unsaved and untitled Workspace. You can then proceed to add and arrange applications as you please. When you are happy with the layout, click on the Workspace save icon to the left of the Workspace title, give your Workspace a name and click "Download". You will be asked to save a `.txt` file to your machine containing the Workspace layout structured as a JSON object. Copy the contents of this file and paste them inside the `workspaces` array of the `glue.layouts.json` file. Now your workspace can be accessed and manipulated via the [Workspaces API](../../../reference/core/latest/workspaces/index.html).

*The Workspace layout is downloaded as a `.txt` file in order to bypass any security policies of the user's browser. Some browsers and some security settings block downloading `.json` files.*

As stated previously, keep in mind that your end-users cannot modify a Workspace layout defined in the `glue.layouts.json` file by opening the respective Workspace in the Workspace app, rearranging its layout (by dragging/dropping apps, resizing, etc.), and attempting to save the resulting Workspace layout with the same name. The Workspace layout definitions in the `glue.layouts.json` file cannot be overwritten by the end-user. The users can, however, open an existing Workspace, modify it and save it with a different name. This new Workspace will then be available in the Workspaces App and its layout will be saved locally by the browser.

#### Manual Setup

If you need to setup the support for Workspaces manually, follow these steps:

1. Install the [`@glue42/workspaces-app`](https://www.npmjs.com/package/@glue42/workspaces-app) package that contains a built version of the Workspaces App.

```cmd
npm install --save @glue42/workspaces-app
```

2. Define the applications you want the use in Workspaces in the `glue.config.json` file. For information on how to do that, see the [**Application Management: Application Definitions**](../application-management/index.html#enabling_application_management-application_definitions) section.

3. Define your Workspace layouts using this layout as a base skeleton:

```json
{
    "name": "workspace-name",
    "type": "Workspace",
    "components": [
        {
            "type": "Workspace",
            "state": {
                "children": [
                    {
                        "type": "column",
                        "children": [
                            {
                                "type": "group",
                                "children": [
                                    {
                                        "type": "window",
                                        "config": {
                                            "appName": "app-one"
                                        }
                                    }
                                ]
                            },
                            {
                                "type": "group",
                                "children": [
                                    {
                                        "type": "window",
                                        "config": {
                                            "appName": "app-two"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
```

4. Serve the Workspaces App from the same directory where all other Glue42 Environment files are located - e.g., `/glue/workspaces`.

### Client Applications

To enable the [Workspaces API](../../../reference/core/latest/workspaces/index.html) in your [**Glue42 Client**](../../core-concepts/glue42-client/overview/index.html) applications, install the [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) and [`@glue42/workspaces-api`](https://www.npmjs.com/package/@glue42/workspaces-api) packages and initialize the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library by passing the `GlueWorkspaces()` factory function in the configuration object. When `GlueWeb()` resolves, the Workspaces API will be accessible through the `workspaces` property of the returned object - e.g., `glue.workspaces`. Below you can see examples of how to enable the Workspaces API in JavaScript, React and Angular applications.

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

## Workspace Routing

Besides opening Workspaces via the [Workspaces API](../../../reference/core/latest/workspaces/index.html), you may want to construct your project so that you can route into a workspace. For example, when a user opens up `yourdomain.com`, you may want to present them with a Frame containing one or more pre-selected Workspaces.

By default, Glue42 Web expects the Workspaces App at `/glue/workspaces` route which also accepts a number of query parameters:

- `/glue/workspaces?workspaceName=myWorkspace` - will open a new Frame and load the Workspace with the specified name in it;
- `/glue/workspaces?workspaceNames=["myWorkspaceOne", "myWorkspaceTwo"]` - will open a new Frame and load all specified Workspaces in it;
- `/glue/workspaces?workspaceName=myWorkspace&context={}` - will open a new Frame, load the specified Workspace and set the provided JSON object as a context for all applications included in the Workspace;

As an example, this will allow you to configure your server to resolve `yourdomain.com` to `/glue/workspaces?workspaceName=myWorkspace`.

In the next sections, you can see examples of using the Workspaces API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

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