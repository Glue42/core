## Overview

The [Workspaces API](../../../../reference/core/latest/workspaces/index.html) offers advanced window management functionalities. Using Workspaces, users are able to arrange multiple applications within the same visual window (called *Frame*). This arrangement can be performed programmatically or by dragging and dropping applications within the Frame. Users can also save Workspace Layouts and restore them within the same Frame or even in different Frames.

The Glue42 Workspaces enable the users to compose a custom arrangement of applications by treating each application as an individual building block that can be added, removed, moved or resized within a Workspace. The Frame can hold multiple Workspaces (as tabs) and can also be maximized, minimized or resized. 

## Workspaces Concepts

### Frame

The Frame is a web application (also called Workspaces App). It is the shell that can hold multiple Workspaces as tabs in a single or multiple windows (frames). The Frame application is a vital element in the Workspaces functionality as it handles opening and closing Workspaces, arranging windows in a Workspace, adding or removing Workspaces and windows.

A fully functioning Workspaces App is available in [**Glue42 Enterprise**](https://glue42.com/enterprise/). For [**Glue42 Core**](https://glue42.com/core/) projects, however, you have to create your own [Workspaces App](../workspaces-app/index.html). This is extremely simple, as all Workspaces App functionalities are provided as a single React component by the [@glue42/workspaces-ui-react](https://www.npmjs.com/package/@glue42/workspaces-ui-react) library.

*For more details on how to create and customize your own Workspaces App, see the [Workspaces App](../workspaces-app/index.html) section.*

### Workspace

A Workspace contains one or more applications (windows) arranged in columns, rows or groups of tabbed windows. Each application acts as a building block of a Workspace and can be resized, maximized and restored within a Workspace. Applications can be added to a Workspace (by drag and drop or programmatically) and can also be ejected from a Workspace as floating windows. The arrangement of each Workspace can be uniquely suited to provide the necessary layout and functionalities for performing tasks quickly and intuitively. Instead of wasting time and effort in finding, opening and arranging the relevant applications, restore the respective Workspace with a single click.

### Workspace Layout

A Workspace Layout is a JSON object which describes the model of a Workspace. It contains the name of the Workspace, the structure of its children and how they are arranged, the names of each application present in the Workspace, context and other settings. This Layout is the blueprint used by the API to build the Workspace and its components.

Through the [Workspaces App](../workspaces-app/index.html) the users can create, modify, save and delete a Workspace Layout. The Workspace Layouts are saved locally through the `IndexedDB` API of the user's browser.

The example below shows the shape of a simple Workspace containing two applications:

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