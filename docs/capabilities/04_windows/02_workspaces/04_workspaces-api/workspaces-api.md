## Frame

The [Live Examples](#live_examples) section demonstrates using the Workspaces API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

The [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) is the topmost level window which contains all Workspaces. 

### Frame Reference

There are several ways to get a reference to a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) instance.

#### Current Window Frame

Get the [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) of the current window by using the [`getMyFrame()`](../../../../reference/core/latest/workspaces/index.html#API-getMyFrame) method:

```javascript
// This method will return the Frame of the current window.
// If an error is thrown, the window is not part of a Workspace.
const frame = await glue.workspaces.getMyFrame().catch(console.error);
```

#### All Frames

Get all [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) instances by using the [`getAllFrames()`](../../../../reference/core/latest/workspaces/index.html#API-getAllFrames) method:

```javascript
// Getting all Frames.
const allFrames = await glue.workspaces.getAllFrames();
```

#### Specific Frame

Get a specific [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) instance by using the [`getFrame()`](../../../../reference/core/latest/workspaces/index.html#API-getFrame) method:

```javascript
// Getting a specific Frame.
const specificFrame = await glue.workspaces.getFrame(frame => frame.id === "frame-id");
```

### Frame Bounds

Once you get a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) instance, you can manipulate its bounds using the [`move()`](../../../../reference/core/latest/workspaces/index.html#Frame-move) and [`resize()`](../../../../reference/core/latest/workspaces/index.html#Frame-resize) methods: 

```javascript
const myFrame = await glue.workspaces.getMyFrame();

// Moving a Frame.
await myFrame.move({ top: 100, left: 100 });

// Resizing a Frame.
await myFrame.resize({ width: 600, height: 600 });
```

### Focusing a Frame

To bring a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) on focus, use the [`focus()`](../../../../reference/core/latest/workspaces/index.html#Frame-focus) method:

```javascript
const frame = await glue.workspaces.getFrame(frame => frame.id === "frame-id");

// Focusing a Frame.
await frame.focus();
```

### Closing a Frame

To close a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame), use the [`close()`](../../../../reference/core/latest/workspaces/index.html#Frame-close) method:

```javascript
const frame = await glue.workspaces.getFrame(frame => frame.id === "frame-id");

// Closing a Frame.
await frame.close();
```

### Frame Workspaces

To get all [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) objects in a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame), use the [`workspaces()`](../../../../reference/core/latest/workspaces/index.html#Frame-workspaces) method:

```javascript
const myFrame = await glue.workspaces.getMyFrame();

// Getting all Workspaces in a Frame.
const frameWorkspaces = await myFrame.workspaces();
```

## Workspace

A [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) contains one or more application windows arranged in columns, rows or groups. 

*A [`Group`](../../../../reference/core/latest/workspaces/index.html#Group) is a Workspace element that holds tabbed windows. If a window is placed directly in a [`Column`](../../../../reference/core/latest/workspaces/index.html#Column) or a [`Row`](../../../../reference/core/latest/workspaces/index.html#Row), it will be static and without a tab - the user will not be able to move it or close it and manipulating it will be possible only through the API.*  

You can use the [`frame`](../../../../reference/core/latest/workspaces/index.html#Workspace-frame) property of a Workspace to get a reference to the [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) containing it. 

To get a collection of the immediate children of a Workspace, use its [`children`](../../../../reference/core/latest/workspaces/index.html#Workspace-children) property.

### Workspace Reference

There are several methods available for getting a reference to a Workspace.

#### Current Window Workspace

To get the Workspace of the current window, use the [`getMyWorkspace()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getMyWorkspace) method:

```javascript
// This method will return the Workspace of the current window.
// If an error is thrown, the window is not part of a Workspace.
const workspace = await glue.workspaces.getMyWorkspace().catch(console.error);
```

#### All Workspaces

To get all Workspaces, use the [`getAllWorkspaces()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllWorkspaces) method:

```javascript
// Getting all Workspaces.
const allWorkspaces = await glue.workspaces.getAllWorkspaces();
```

#### Specific Workspace

To get a specific Workspace, use the [`getWorkspace()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getWorkspace) method:

```javascript
// Getting a specific Workspace.
const specificWorkspace = await glue.workspaces.getWorkspace(workspace => workspace.id === "workspace-id");
```

#### Workspace State

The Workspaces are designed to be freely modified programmatically as well as by the end user via the UI. Keeping a correct reference to a modified Workspace instance object is important in order for your code to be able to update the Workspace accordingly. For example, the user may have already closed a Workspace element that you want to update. To avoid such errors, you can either get a new reference to that element using the API, or you can use the [`refreshReference()`](../../../../reference/core/latest/workspaces/index.html#Workspace-refreshReference) method of a Workspace instance:

```javascript
// Updating the reference to an already existing Workspace instance.
await myWorkspace.refreshReference();

// When this resolves, the `myWorkspace` object will be updated to reflect the current Workspace state.
```

### Restoring Workspaces

You can restore a Workspace by using the [`restoreWorkspace()`](../../../../reference/core/latest/workspaces/index.html#API-restoreWorkspace) method which is available at top level of the API. It accepts an optional [`RestoreWorkspaceConfig`](../../../../reference/core/latest/workspaces/index.html#RestoreWorkspaceConfig) object in which you can specify a title and a context for the restored Workspace, and also whether to restore it in a specific existing Frame or in a new Frame: 

```javascript
// Specify the Frame in which to restore the Workspace.
const restoreOptions = {
    frameId: "frame-id"
};

const workspace = await glue.workspaces.restoreWorkspace("myWorkspace", restoreOptions);
```

This method is also available on the frame instance:

```javascript
const myFrame = await glue.workspaces.getMyFrame();

// You don't have to specify a Frame in which to restore the Workspace.
const workspace = await myFrame.restoreWorkspace("myWorkspace");
```

### Creating Workspaces

You can create Workspaces runtime by using the [`createWorkspace()`](../../../../reference/core/latest/workspaces/index.html#API-createWorkspace) method available at top level of the API and on a [`Frame`](../../../../reference/core/latest/workspaces/index.html#Frame) instance. Using the `createWorkspace()` method, however, may often be quite inconvenient as every time you want to create a Workspace you will have to pass a JSON object describing a full Workspace Layout. This Layout can quickly become very complex depending on the number and arrangement of applications participating in it. Below is an example of creating a [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) by passing a [`WorkspaceDefinition`](../../../../reference/core/latest/workspaces/index.html#WorkspaceDefinition) with only two applications arranged in a single column:

```javascript
// Workspace definition.
const definition = {
    // Define all Workspace elements (children).
    children: [
        {
            type: "column",
            children: [
                {
                    type: "window",
                    appName: "app-one"
                },
                {
                    type: "window",
                    appName: "app-two"
                }
            ]
        }
    ],
    // Confugartion for the Workspace.
    config: {
        title: "My Workspace"
    }
};

// Creating a Workspace.
const workspace = await glue.workspaces.createWorkspace(definition);
```

*If you insert an empty [`Column`](../../../../reference/core/latest/workspaces/index.html#Column), [`Row`](../../../../reference/core/latest/workspaces/index.html#Row) or [`Group`](../../../../reference/core/latest/workspaces/index.html#Group) element in a Workspace (without a window as its content), it will be visually represented in the Workspace as an empty space with a grey background and a button in the middle from which the user will be able to add an application. The user will not be able to move or close this empty element.*

#### Workspaces Builder API

An easier solution is to use the Workspaces Builder API. The builder allows you to compose entire Workspaces as well as different Workspace elements (rows, columns or groups) depending on the builder type you set.

You can define a builder with the [`getBuilder()`](../../../../reference/core/latest/workspaces/index.html#API-getBuilder) method. It accepts a [`BuilderConfig`](../../../../reference/core/latest/workspaces/index.html#BuilderConfig) object as a parameter in which you should specify the type of the builder (`"workspace"`, `"row"`, `"colum"` or `"group"`) and provide either a Workspace definition or a definition for the element (row, column or group) you want to build. You can then use the methods of the builder instance to add rows, columns, groups or windows. 

Here is how you can create the same Workspace as above using a builder: 

```javascript
// Configuration for the builder.
const builderConfig = {
    // Type of the builder.
    type: "workspace",
    definition: {
        // This time pass only the Workspace configuration without defining Workspace children.
        config: {
            title: "My Workspace"
        }
    }
};

// Access the Workspaces Builder API and define a builder.
const builder = glue.workspaces.getBuilder(builderConfig);

// Use the builder methods to add a column and two windows in it.
builder.addColumn()
    .addWindow({ appName: "app-one" })
    .addWindow({ appName: "app-two" });

// Finally, use the `create()` method of the builder instance to create the Workspace.
const workspace = await builder.create();
```

### Finding Workspace Elements

The Workspaces API offers various methods for finding elements in a Workspace - [`Row`](../../../../reference/core/latest/workspaces/index.html#Row), [`Column`](../../../../reference/core/latest/workspaces/index.html#Column), [`Group`](../../../../reference/core/latest/workspaces/index.html#Group) and [`WorkspaceWindow`](../../../../reference/core/latest/workspaces/index.html#WorkspaceWindow). All methods for querying Workspaces accept a predicate function as a parameter which you can use to find the desired Workspace elements.

#### Box Elements

[`Box`](../../../../reference/core/latest/workspaces/index.html#Box) elements are Workspace elements that can contain other Workspace elements - [`Row`](../../../../reference/core/latest/workspaces/index.html#Row), [`Column`](../../../../reference/core/latest/workspaces/index.html#Column) and [`Group`](../../../../reference/core/latest/workspaces/index.html#Group). These elements are the building blocks of a Workspace Layout, while the actual windows (applications) can be viewed as their content. 

To get all box elements in a Workspace, use the [`getAllBoxes()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllBoxes) method of a Workspace instance:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

// This will return all `Row`, `Column` and `Group` elements in the Workspace.
const allBoxElements = myWorkspace.getAllBoxes();
```

The Workspace instance also offers methods for specific types of box elements. For example, to get all rows in a Workspace, use the [`getAllRows()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllRows) method:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

const allRows = myWorkspace.getAllRows();
```

To get all columns or groups, use the [`getAllColumns()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllColumns) or [`getAllGroups()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllGroups) method respectively.

You can also get a specific box element using the [`getBox()`](../../../../reference/core/latest/workspaces/index.html#API-getBox) method available on top level of the API as well as on a Workspace instance. Below is an example of getting the immediate parent element of a window using the window ID:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

// The `getBox()` method (as most methods for querying Workspaces)
// accepts a predicate function used to find the desired elements.
const targetElement = myWorkspace.getBox((boxElement) => {
    return boxElement.children.some(child => child.type === "window" && child.id === "target-id");
});
```

The Workspace instance also offers methods for finding specific rows, columns or groups - [`getRow()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getRow), [`getColumn()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getColumn) and [`getGroup()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getGroup).

#### Workspace Windows

To get all windows in a Workspace, use the [`getAllWindows()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getAllWindows) method of a Workspace instance:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

const allWorkspaceWindows = myWorkspace.getAllWindows();
```

To get a specific window, use the [`getWindow()`](../../../../reference/core/latest/workspaces/index.html#API-getWindow) method available on top level of the API as well as on a Workspace instance:

```javascript
const specificWindow = await glue.workspaces.getWindow(window => window.id === "target-id");
```

### Editing Workspaces

Workspace instances and [`Box`](../../../../reference/core/latest/workspaces/index.html#Box) element instances offer methods for adding and removing Workspace elements. This, combined with the powerful querying methods, gives you full programmatic control over a Workspace. 

Below is an example of adding a new window as a sibling to another window in a Workspace using the [`addWindow()`](../../../../reference/core/latest/workspaces/index.html#Box-addWindow) method of a box element:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

const targetElement = myWorkspace.getBox((boxElement) => {
    return boxElement.children.some(child => child.type === "window" && child.id === "target-id");
});

await targetElement.addWindow({ appName: "app-three" });
```

### Size Constraints

Workspace elements can have size constraints which will prevent the user from resizing them beyond the set limits. Workspace rows and columns can also be pinned, meaning that the size of the pinned element (width for columns, height for rows) will be preserved when the user maximizes, restores or resizes the Workspace.

The following table lists the available size constraint properties and the Workspace elements to which they apply:

| Property | Type | Description | Applies to |
|----------|------|-------------|------------|
| `maxWidth` | `number` | Sets the maximum width in pixels of the element. | `Column`, `Group`, `Window` |
| `minWidth` | `number` | Sets the minimum width in pixels of the element. | `Column`, `Group`, `Window` |
| `maxHeight` | `number` | Sets the maximum height in pixels of the element. | `Row`, `Group`, `Window` |
| `minHeight` | `number` | Sets the minimum height in pixels of the element. | `Row`, `Group`, `Window` |
| `isPinned` | `boolean` | Specifies whether the size of the element (width for columns, height for rows) will be preserved when the user maximizes, restores or resizes the Workspace. | `Row`, `Column` |

Mind that if you set the same max or min property of more than one of several nested elements to different values (e.g., you've set `maxWidth: 400` for a column and `maxWidth: 500` for a window inside that column), then in the case of maximum values, the lower one will be used, and in the case of minimum values, the higher one will be used. This way, all defined constraints will be respected when the user resizes the Workspace or its elements. 

To set size constraints for Workspace elements when creating a Workspace, use the `config` property of the [`WorkspaceDefinition`](../../../../reference/core/latest/workspaces/index.html#WorkspaceDefinition) object:

```javascript
const definition = {
    children: [
        {
            type: "column",
            children: [
                {
                    type: "group",
                    children: [{
                        type: "window",
                        appName: "app-two"
                    }],

                },
                {
                    type: "group",
                    children: [{
                        type: "window",
                        appName: "app-two",
                        config: {
                            // Window size constraints.
                            maxWidth: 500,
                            minHeight: 200
                        }
                    }],

                }
            ],
            config: {
                // The column will be constrained to 400 px width.
                // The maximum width of the column will override the one of the window
                // because it is set to a lower value.
                maxWidth: 400
            }
        }],
    config: {
        title: "My Workspace"
    }
};

const workspace = await glue.workspaces.createWorkspace(definition);
```

*Note that if the specified constraints are invalid, they will be ignored - e.g., when min exceeds max or conflicting constraints between different elements.*

You can set size constraints also when using the [Workspaces Builder API](#workspaces_builder_api) or when adding Workspace elements using the `addRow()`, `addColumn()`, `addGroup()` or `addWindow()` methods of a [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) instance or [box elements](#box_elements):

```javascript
const rowDefinition = {
    type: "row",
    children: [{
        type: "group",
        children: [{
            type: "window",
            appName: "app-two"
        }],

    }],
    config: {
        // The row will be pinned - its height will be preserved when the user resizes the Workspace.
        isPinned: true
    }
};

await myWorkspace.addRow(rowDefinition);
```

### Hibernation

To hibernate a Workspace instance, use the [`hibernate()`](../../../../reference/core/latest/workspaces/index.html#Workspace-hibernate) method of a Workspace instance:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

await myWorkspace.hibernate();
```

To resume a hibernated Workspace, use the [`resume()`](../../../../reference/core/latest/workspaces/index.html#Workspace-resume) method of a Workspace instance:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

await myWorkspace.resume();
```

*For more details on how to configure Workspace hibernation, see [Hibernation](../enabling-workspaces/index.html#main_application-hibernation) in the Enabling Workspaces section.*

### Loading Strategies

When creating a Workspace with the [createWorkspace()](../../../../reference/core/latest/workspaces/index.html#API-createWorkspace) method or when restoring a Workspace with the [restoreWorkspace()](../../../../reference/core/latest/workspaces/index.html#API-restoreWorkspace) method, you can specify a loading strategy:

```javascript
const options = { loadingStrategy: "lazy" };
const workspace = await glue.workspaces.restoreWorkspace("My Workspace", options);
```

*For more details on how to configure Workspace loading strategies, see [Loading Strategies](../enabling-workspaces/index.html#main_application-loading_strategies) in the Enabling Workspaces section.*

### Lockdown

[`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) instances, [`Group`](../../../../reference/core/latest/workspaces/index.html#Group), [`Row`](../../../../reference/core/latest/workspaces/index.html#Row), [`Column`](../../../../reference/core/latest/workspaces/index.html#Column) and [`WorkspaceWindow`](../../../../reference/core/latest/workspaces/index.html#WorkspaceWindow) elements can be locked using the [`lock()`](../../../../reference/core/latest/workspaces/index.html#Workspace-lock) method of the respective instance. Locking a Workspace or any of its elements allows you to control the extent to which the user can modify it. For instance, you may want to prevent the user from removing or extracting a window from the Workspace, but at the same time allow them to resize the Workspace contents, or you may want to disable any Workspace modifications whatsoever.

The `lock()` method accepts as an optional argument either a [`WorkspaceLockConfig`](../../../../reference/core/latest/workspaces/index.html#WorkspaceLockConfig) object or a callback that will receive the current [`WorkspaceLockConfig`](../../../../reference/core/latest/workspaces/index.html#WorkspaceLockConfig) as an argument and must return an object. If you don't provide a locking configuration, all locking properties (applicable to the respective element) will be automatically set to `false`:

```javascript
const myWorkspace = await glue.workspaces.getMyWorkspace();

// Will set all Workspace locking properties to `false`.
await myWorkspace.lock();
```

The following example demonstrates how to lock only specific properties:

```javascript
const lockConfig = { allowDrop: false };

await myWorkspace.lock(lockConfig);

// Or

const setLocking = (lockConfig) => {
    lockConfig.allowDrop = false;
    
    return lockConfig;
};

await myWorkspace.lock(setLocking);
```

*Note that passing a callback instead of an object with locking config to the `lock()` method is a more future proof approach because if new locking properties are introduced in the future, your app behavior won't be affected.*

To set all locking properties to `true`, pass an empty object as an argument:

```javascript
myWorkspace.lock({});
```

Locking properties for a [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace):

| Property | Description |
|----------|-------------|
| `allowSplitters` | If `false`, will prevent the splitters from being draggable, so the Workspace elements can't be resized . |
| `allowExtract` | If `false`, will prevent the user from extracting (or rearranging) windows inside the Workspace. |
| `showCloseButton` | If `false`, will hide the Close button on the Workspace tab. |
| `showSaveButton` | If `false`, will hide the Save Workspace button on the Workspace tab. |
| `showAddWindowButtons` | If `false`, will hide all Add Window buttons (the "+" buttons) in the headers of window groups. |
| `showEjectButtons` | If `false`, will hide all Eject buttons in the headers of window groups. |
| `showWindowCloseButtons` | If `false`, will hide all Close buttons on the window tabs. |

Locking properties for a [`Group`](../../../../reference/core/latest/workspaces/index.html#Group):

| Property | Description |
|----------|-------------|
| `allowExtract` | If `false`, will prevent the user from extracting windows from the window group. |
| `allowDrop` | If `false`, will prevent the user from adding windows by dropping them in the window group. |
| `showMaximizeButton` | If `false`, will hide the Maximize button in the header of the window group. |
| `showEjectButton` | If `false`, will hide the Eject button in the header of the window group. |
| `showAddWindowButton` | If `false`, will hide the Add Window button (the "+" button) in the header of the window group. |

Locking properties for a [`Row`](../../../../reference/core/latest/workspaces/index.html#Row):

| Property | Description |
|----------|-------------|
| `allowDrop` | If `false`, will prevent the user from adding windows by dropping them in the Workspace row. |

Locking properties for a [`Column`](../../../../reference/core/latest/workspaces/index.html#Column):

| Property | Description |
|----------|-------------|
| `allowDrop` | If `false`, will prevent the user from adding windows by dropping them in the Workspace column. |

Locking properties for a [`WorkspaceWindow`](../../../../reference/core/latest/workspaces/index.html#WorkspaceWindow):

| Property | Description |
|----------|-------------|
| `allowExtract` | If `false`, will prevent the user from extracting the window from the Workspace. |
| `showCloseButton` | If `false`, will hide the Close button on the window tab. |

To set the locking properties of a Workspace and any of its elements when creating it, use the `config` property of the [`WorkspaceDefinition`](../../../../reference/core/latest/workspaces/index.html#WorkspaceDefinition) object. The locking configuration of a Workspace element will override the locking configuration of the Workspace:

```javascript
const definition = {
    children: [
        {
            type: "column",
            children: [
                {
                    type: "group",
                    children: [{
                        type: "window",
                        appName: "app-two"
                    }],

                },
                {
                    type: "group",
                    children: [{
                        type: "window",
                        appName: "app-two",
                        config: {
                            // This will override the Workspace locking config.
                            allowExtract: true,
                            showCloseButton: true
                        }
                    }],

                }
            ]
        }],
    config: {
        title: "My Workspace",
        // Workspace locking config.
        allowExtract: false,
        showSaveButton: false,
        showCloseButton: false,
        allowSplitters: false,
        showEjectButtons: false,
        showAddWindowButtons: false,
        showWindowCloseButtons: false
    }
};

const workspace = await glue.workspaces.createWorkspace(definition);
```

You can set locking configuration for a Workspace and its elements also when using the [Workspaces Builder API](#workspaces_builder_api) or when adding Workspace elements using the `addRow()`, `addColumn()`, `addGroup()` or `addWindow()` methods of a [`Workspace`](../../../../reference/core/latest/workspaces/index.html#Workspace) instance or [box elements](#box_elements):

```javascript
const rowDefinition = {
    type: "row",
    children: [{
        type: "group",
        children: [{
            type: "window",
            appName: "app-two"
        }],

    }],
    config: {
        allowDrop: false
    }
};

await myWorkspace.addRow(rowDefinition);
```

### Workspace Layouts

Workspace Layouts are JSON objects that describe the content and arrangement of a Workspace.

#### Workspace Layout Summaries

You can get the summaries of all Workspace Layouts without the extensive JSON objects describing their structure. For example, you may need only the names of the available Layouts to list them in the UI:

```javascript
const layoutSummaries = await glue.workspaces.layouts.getSummaries();
const allLayoutNames = layoutSummaries.map(summary => summary.name);
```

#### Saving Workspace Layouts

You can save the Layout of a Workspace after you create it by using the [`saveLayout()`](../../../../reference/core/latest/workspaces/index.html#Workspace-saveLayout) method of a Workspace instance:

```javascript
// Saving the Layout of a previously created Workspace instance.
await workspace.saveLayout("my-workspace");
```

You can also save the Layout of any opened Workspace using the Workspaces Layouts API and the ID of the Workspace:

```javascript
await glue.workspaces.layouts.save({ name: "workspace-two", workspaceId: "workspace-id" });
```

#### Deleting Workspace Layouts

Deleting a Layout by name:

```javascript
await glue.workspaces.layouts.delete("workspace-one");
```

## Workspace Context

Each Workspace instance has a dedicated context (based on [Shared Contexts](../../../data-sharing-between-apps/shared-contexts/index.html)). Use the Workspace context to pass custom data to the Workspace applications when creating or restoring a Workspace.

### Initial

To specify initial context data when creating a Workspace, use the `context` property of the [`WorkspaceDefinition`](../../../../reference/core/latest/workspaces/index.html#WorkspaceDefinition) object:

```javascript
const definition = {
    context: { clientID: 1 }
};

const workspace = await glue.workspaces.createWorkspace(definition);
```

To specify initial context data when restoring a Workspace, use the `context` property of the [`RestoreWorkspaceConfig`](../../../../reference/core/latest/workspaces/index.html#RestoreWorkspaceConfig) object:

```javascript
const restoreOptions = {
    context: { clientID: 1 }
};

const workspace = await glue.workspaces.restoreWorkspace("myWorkspace", restoreOptions);
```

### Get

To get the Workspace context, use the [`getContext()`](../../../../reference/core/latest/workspaces/index.html#Workspace-getContext) method of a Workspace instance:

```javascript
const context = await myWorkspace.getContext();
```

### Set

To set the Workspace context, use the [`setContext()`](../../../../reference/core/latest/workspaces/index.html#Workspace-setContext) method of a Workspace instance. Using this method will overwrite entirely the existing context:

```javascript
const newContext = { instrument: "MSFT" };

await myWorkspace.setContext(newContext);
```

### Update

To update the Workspace context, use the [`updateContext()`](../../../../reference/core/latest/workspaces/index.html#Workspace-updateContext) method of a Workspace instance. Using this method will merge the update with the existing context:

```javascript
// Existing context: `{ clientID: 1 }`.
const update = { instrument: "MSFT" };

await myWorkspace.updateContext(update);
// Result: `{ clientID: 1, instrument: "MSFT" }`.
```

## Events

The Workspaces API exposes events at different levels allowing you to listen only for the events you are interested in.

### Global Events

Global events are accessible at top level of the API. Below is an example for an event which will fire every time a window has been added to any Workspace in any Frame:

```javascript
glue.workspaces.onWindowAdded((window) => {
    console.log(`Window added: ${window.id}`);
});
```

All event methods return an unsubscribe function which you can use to stop receiving notifications about the event:

```javascript
const unsubscribe = await glue.workspaces.onWindowAdded((window) => {
    console.log(`Window added: ${window.id}`);
});

unsubscribe();
```

*For more available global events, see the [Workspaces Reference](../../../../reference/core/latest/workspaces/index.html#API).*

### Frame Events

The Frame events provide notifications when a certain action has occurred within the Frame. Below is an example for an event which will fire every time a window has been added to the specified Frame instance: 

```javascript
const myFrame = await glue.workspaces.getMyFrame();

myFrame.onWindowAdded((window) => {
    console.log(`Window added to Frame: ${window.id}`);
});
```

*For more available Frame events, see the [Workspaces Reference](../../../../reference/core/latest/workspaces/index.html#Frame).*

### Workspace Events

The Workspace events provide notifications when a certain action has occurred within the Workspace. Below is an example for an event which will fire every time a window has been added to the specified Workspace instance:

```javascript
const workspace = await glue.workspaces.getMyWorkspace();

workspace.onWindowAdded((window) => {
    console.log(`Window added to Workspace: ${window.id}`);
});
```

*For more available Workspace events, see the [Workspaces Reference](../../../../reference/core/latest/workspaces/index.html#Workspace).*

### Window Events

The window level events provide notifications when a certain action related to the window has occurred. Below is an example for an event which will fire when the window has been removed from the Workspace:

```javascript
const workspaceWindow = await glue.workspaces.getWindow(window => window.id === "my-window-id");

workspaceWindow.onRemoved((window) => {
    console.log(`Window removed from Workspace: ${window.id}`);
});
```

*For more available window events, see the [Workspaces Reference](../../../../reference/core/latest/workspaces/index.html#WorkspaceWindow).* 

## Live Examples

### Restoring and Closing Workspaces

The application below demonstrates how to restore and close programmatically already defined Workspace Layouts. Click the "Open" button of either of the two defined Workspaces to open an instance of it. The application will log the ID of the newly opened instance and provide a "Close" button for closing this particular Workspace instance. You can also define a custom context which the restored Workspace will pass to all applications participating in it. You can manipulate freely the restored Workspaces, as in the previous example. 

*Keep in mind that if you create and save a new Workspace, you will have to refresh the app to see the newly saved Workspace Layout. If you close a restored Workspace directly from its frame and then try to close it from the "Close" button for its instance, the app will show an error that this Workspace has already been closed.*

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/workspaces/workspaces-listing" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://jc4z0.csb.app" style="border: none;"></iframe>
</div>

### Manipulating a Workspace

The application above opens a fully functioning Workspace. There are multiple registered apps which you can use to customize the Workspace Layout. You can:

- drag and drop the already opened apps to form new rows, columns or window groups;
- maximize and restore a window or window group;
- eject a window from a Workspace;
- reorder the window and Workspace tabs;
- add new application instances to the current Workspace (in the current column, row or group);
- resize the windows in the Workspace by dragging their borders;
- close and restore a Workspace within the same Frame;
- create a new Workspace, customize its Layout and save it;

## Reference

[Workspaces API Reference](../../../../reference/core/latest/workspaces/index.html) 