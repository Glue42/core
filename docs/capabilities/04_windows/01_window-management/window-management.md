## Overview

Using the [Window Management API](../../../reference/core/latest/windows/index.html), your application can easily open and manipulate browser windows. This allows you to transform your traditional single-window web app into a multi-window native-like web application. The Window Management API enables applications to:

- open multiple windows;
- manipulate the position and size of opened windows;
- pass context data upon opening new windows;
- listen for and handle events related to opening and closing windows;

## Configuration

Use the `windows` property of the configuration object when initializing the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the [Main application](../../../developers/core-concepts/web-platform/overview/index.html) to specify custom settings for the Window Management library:

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    windows: {
        windowResponseTimeoutMs: 10000,
        defaultWindowOpenBounds: {
            top: 0,
            left: 0,
            width: 600,
            height: 600
        }
    }
};

const { glue } = await GlueWebPlatform(config);
```

 Configuring the Window Management library is optional. The configuration object for the `windows` property has the following optional properties:

| Property | Description |
|----------|-------------|
| `windowResponseTimeout` | Sets the timeout (in ms) that the Glue42 library will wait for a valid success response from the target window after the Glue42 library has been initialized and a window operation is being executed on the window object (e.g., `myWindow.moveTo(200, 200)`). If no response has been received within this period, the Glue42 library will assume that either the window is not Glue42 enabled, or Glue42 has not been initialized yet. *Note that this timeout is valid only for operations on the window object - it doesn't affect a `glue.windows.open()` call, for example.*  |
| `defaultWindowOpenBounds` | Default bounds for opening a new window or an application instance. |

The [Live Examples](#live_examples) section demonstrates using the Window Management API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

## Opening Windows

The Window Management API is accessible through the [`glue.windows`](../../../reference/core/latest/windows/index.html) object.

To open a new Glue42 Window, use the [`open()`](../../../reference/core/latest/windows/index.html#API-open) method:

```javascript
const name = "glue42-docs";
const url = "https://docs.glue42.com";
// Specify location for the new window.
const options = {
    top: 200,
    left: 200
};

const g42Window = await glue.windows.open(name, url, options);
```

The `name` and `url` parameters are required. The window `name` must be unique. The third parameter is an optional [`Settings`](../../../reference/core/latest/windows/index.html#Settings) object which specifies various settings for the new Glue42 Window - bounds, relative position and context.

*For all available settings when opening a new Glue42 Window, see the [Window Settings](#window_settings) section.*

### Opening PDF Files

To open a PDF file in a Glue42 Window, use the [`open()`](../../../reference/core/latest/windows/index.html#API-open) method. Pass the URL to the PDF file and optionally specify parameters in the URL for opening the PDF file:

```javascript
// This will open the PDF file with the PDF toolbar turned off.
const PDF_URL = "https://url-to-pdf.com/file-name.pdf#toolbar=0";

await glue.windows.open("PDF File", PDF_URL);
```

To specify parameters in the URL, use the following template:

```cmd
<URL to PDF file>#<parameter>=<value>
```

To specify multiple parameters in the URL, use `&` to separate them:

```cmd
<URL to PDF file>#<parameter>=<value>&<parameter>=<value>&<parameter>=<value>
```

*Note that `#`, `&` and `=` are special characters which you must not use in parameter values because they can't be escaped.*

The following example will display page 3 of the PDF file, hide the PDF toolbar, set the zoom factor to 150% and scroll the page vertically and horizontally by 100px (pixels are relative to the zoom factor):

```javascript
const PDF_URL = "https://url-to-pdf.com/file-name.pdf#page=3&toolbar=0&zoom=150,100,100";

await glue.windows.open("PDF File", PDF_URL);
```

The following table lists all supported URL parameters for opening PDF files:

| Parameter | Description | Examples |
|-----------|-------------|----------|
| `page` | Specifies which page to display. Accepts an integer as a value. The first page of the document has a value of 1. | To open the PDF file to page 3, use `page=3`. |
| `toolbar` | Whether to enable or disable the PDF toolbar. Accepts 0 or 1 as values. | To hide the PDF toolbar, use `toolbar=0`. |
| `zoom` | Specifies the zoom factor and also the vertical and horizontal scroll position of the page in regard to the top left corner of the window. Accepts integer or floating point values. | To set the zoom factor to 150.5%, use `zoom=150.5`. To set the zoom factor to 120% and scroll the page 200px vertically and 100px horizontally, use `zoom=120,200,100`. 
| `view` | Specifies the view mode of the page using values defined in the PDF language specification. See the possible values in the next table. Use the `page` parameter before `view`. | To fit the page in the window, use `view=Fit`. To fit the page vertically, use `view=FitV`. To fit the page horizontally and scroll it 200px vertically, use `view=FitH,200`. |

The following table lists the possible values for the `view` parameter:

| Value | Description | Example |
|-------|-------------|---------|
| `Fit` | Fits the entire page horizontally and vertically in the window. If the vertical and horizontal magnification factors are different, the smaller one will be used for fitting the page. In the other dimension the page will be centered. | `view=Fit` |
| `FitV` | Fits the page vertically in the window. | `view=FitV` |
| `FitH` | Fits the page horizontally in the window. | `view=FitH` |
| `FitV,<left>` | Fits the page vertically and scrolls it horizontally from the left edge of the window with the specified integer or floating point value. | `view=FitV,200` |
| `FitH,<top>` | Fits the page horizontally and scrolls it vertically from the top edge of the window with the specified integer or floating point value. | `view=FitH,200` |

## Finding Windows

All functions for finding Glue42 Windows return a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) object (or a collection of such objects).

### Listing

To obtain a collection of all Glue42 Windows, use the [`list()`](../../../reference/core/latest/windows/index.html#API-list) method:

```javascript
const allG42Windows = glue.windows.list();
```

### Current Window

To get a reference to the current window, use the [`my()`](../../../reference/core/latest/windows/index.html#API-my) method:

```javascript
const currentWindow = glue.windows.my();
```

### By ID

To find a window by ID, use the [`findById()`](../../../reference/core/latest/windows/index.html#API-findById) method:

```javascript
const ID = "2506_04";
const g42Window = glue.windows.findById(ID);
```

## Window Settings

Provide window settings per window by passing a [`Settings`](../../../reference/core/latest/windows/index.html#Settings) object to the [`open()`](../../../reference/core/latest/windows/index.html#API-open) method:

```javascript
const name = "glue42-docs";
const url = "https://docs.glue42.com";
// Specify location for the new window.
const options = {
    height: 640,
    width: 560,
    left: 100,
    top: 100,
    context: { glue: 42 }
};

const g42Window = await glue.windows.open(name, url, options);
```

The table below shows all available window settings:

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `height` | `number` | Window height (in pixels). | `400` |
| `left` | `number` | Distance of the top left window corner from the left edge of the screen (in pixels). | `0` |
| `relativeDirection` | `string` | Direction (`"bottom"`, `"top"`, `"left"`, `"right"`) of positioning the window relatively to the `relativeTo` window. Considered only if `relativeTo` is supplied. | `"right"` |
| `relativeTo` | `string` | The ID of the window that will be used to relatively position the new window. Can be combined with `relativeDirection`. | `-` |
| `top` | `number` | Distance of the top left window corner from the top edge of the screen (in pixels). | `0` |
| `width` | `number` | Window width (in pixels). | `400` |

### Relative Position

Position a new Glue42 Window relatively to an already existing Glue42 Window by providing the ID of the existing window and the relative direction:

```javascript
const clientsWindow = glue.windows.findById("3HI0hHjdSq");

const name = "clientportfolio";
const url = "http://localhost:22080/clientportfolio/index.html";
// Provide the existing window ID and the relative direction.
const options = {
    relativeTo: clientsWindow.id,
    relativeDirection: "right"
};

await glue.windows.open(name, url, options);
```

## Window Operations

The Window Management API enables you to control a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance programmatically. Access or change various window settings using the provided properties and methods.

### Title

To get the title of a Glue42 Window, use the [`getTitle()`](../../../reference/core/latest/windows/index.html#WebWindow-getTitle) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const winTitle = await myWindow.getTitle();
```

To set the title of a window, use the [`setTitle()`](../../../reference/core/latest/windows/index.html#WebWindow-setTitle) method:

```javascript
await myWindow.setTitle("New Title");
```

### URL

To get the URL of a Glue42 Window, use the [`getURL()`](../../../reference/core/latest/windows/index.html#WebWindow-getURL) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const winURL = await myWindow.getURL();
```

### Bounds

The bounds of a window describe its position (top and left coordinates) and size (width and height) on the screen.

To get the bounds of a Glue42 Window, use the [`getBounds()`](../../../reference/core/latest/windows/index.html#WebWindow-getBounds) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const winBounds = await myWindow.getBounds();
```

To move or resize a Glue42 Window, use the [`moveTo()`](../../../reference/core/latest/windows/index.html#WebWindow-moveTo), [`resizeTo()`](../../../reference/core/latest/windows/index.html#WebWindow-resizeTo) or [`moveResize()`](../../../reference/core/latest/windows/index.html#WebWindow-moveResize) methods.

To move a window:

```javascript
// Top and left coordinates (in pixels) for the top-left window corner.
await myWindow.moveTo(200, 300);
```

To resize a window:

```javascript
// Width and height (in pixels) for the window.
await myWindow.resizeTo(300, 400);
```

To move and/or resize a window:

```javascript
// New bounds for the window. All properties are optional.
const bounds = {
    top: 200,
    left: 300,
    width: 300,
    height: 400
};

await myWindow.moveResize(bounds);
```

*Note that programmatically moving and resizing the window of the [Main application](../../../developers/core-concepts/web-platform/overview/index.html) isn't possible.*

### Focus

To bring a window on focus, use the  [`focus()`](../../../reference/core/latest/windows/index.html#WebWindow-focus) method:

```javascript
await myWindow.focus();
```

*Note that programmatically focusing the window of the [Main application](../../../developers/core-concepts/web-platform/overview/index.html) isn't possible.*

### Close

To close a Glue42 Window, use the [`close()`](../../../reference/core/latest/windows/index.html#WebWindow-close) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
await myWindow.close();
```

*Note that programmatically closing the window of the [Main application](../../../developers/core-concepts/web-platform/overview/index.html) isn't possible.*

## Context

Each Glue42 Window has a dedicated [context](../../data-sharing-between-apps/shared-contexts/index.html). The window context is a JavaScript object which may contain any information regarding the window instance in the form of key/value pairs. 

Contexts can be set/passed initially on window creation and updated at runtime. Context changes can be tracked by subscribing to an event which fires when the window context has been updated (see [Window Events](#window_events)).

*Note that saving large volumes of custom data as window context (e.g., thousands of lines of table data) can lead to significant delays. A user usually has several (in some cases - many) running applications and/or Workspaces (which can also contain many apps) and if one or more of the apps saves large amounts of context data, this will significantly slow down the saving process (e.g., on shutdown or when saving a layout). Saving custom context works best with smaller amounts of data. If your application needs to save large amounts of data, you have to think about how to design this process better - for instance, you may store IDs, indices, etc., as context data, save the actual data to a database and when you restore the application, fetch the data using the data IDs saved as window context.*

### Get

To get the context of a Glue42 Window, use the [`getContext()`](../../../reference/core/latest/windows/index.html#WebWindow-getContext) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const winContext = await myWindow.getContext();
```

### Update

To update the context of a Glue42 Window, use the [`updateContext()`](../../../reference/core/latest/windows/index.html#WebWindow-updateContext) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const newContext = { glue: 42 };

await myWindow.udpateContext(newContext);
```

This method will update the current context object with the provided properties and values, adding any new properties and updating the values of existing ones.

### Set

To open a Glue42 Window with initially set context, use the `context` property of the [`Settings`](../../../reference/core/latest/windows/index.html#Settings) object:

```javascript
const name = "Glue42 Docs";
const url = "https://docs.glue42.com";
// Specify window context.
const options = {
    context: { glue: 42 }
};

const g42Window = await glue.windows.open(name, url, options);
```

To replace the current window context, use the [`setContext()`](../../../reference/core/latest/windows/index.html#WebWindow-setContext) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance:

```javascript
const newContext = { tick: 42 };
const winContext = await myWindow.setContext();
```

This method will completely overwrite the existing context object, replacing its current value with the specified one.

## Window Events

Methods for tracking Glue42 Window events are available at top-level of the Window Management API and on the [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance. Below are described the available window events with examples of how to handle them.

*The window event methods return an unsubscribe function which you can use to stop tracking the respective event.*

### Window Added/Removed

To track the opening and closing of Glue42 Windows, use the [`onWindowAdded()`](../../../reference/core/latest/windows/index.html#API-onWindowAdded) and [`onWindowRemoved()`](../../../reference/core/latest/windows/index.html#API-onWindowRemoved) methods of the Window Management API and pass handlers for the respective events:

```javascript
const handlers = {
    onAdded: (g42window) => {
        console.log(`Window added: ${g42window.name}`);
    },

    onRemoved: (g42window) => {
        console.log(`Window removed: ${g42window.name}`);
    }
};

glue.windows.onWindowAdded(handlers.onAdded);
glue.windows.onWindowRemoved(handlers.onRemoved);
```

### Context Update

To track updates of the context of a Glue42 Window, use the [`onContextUpdated()`](../../../reference/core/latest/windows/index.html#WebWindow-onContextUpdated) method of a [`WebWindow`](../../../reference/core/latest/windows/index.html#WebWindow) instance and pass an event handler:

```javascript
const contextUpdatedHandler = (context, g42window) => {
    console.log(`The context of "${g42window.name}" has been updated: ${JSON.stringify(context)}`);
};

myWindow.onContextUpdated(contextUpdatedHandler);
```

## Live Examples

### Opening Windows

The application below demonstrates opening a new window with basic configuration (context and size) by using the [`open()`](../../../reference/core/latest/windows/index.html#API-open) method of the Window Management API.

Use the input fields in Application A to assign a name (required) to the new window and set the window context and size. Click the "Open Window" button to open a new window.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/windows/window-opening" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://jp8hk.csb.app" style="border: none;"></iframe>
</div>

<!-- ### Window Discovery

The application below demonstrates discovering a window by name.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Input the name of the window you want to search for and click the search button. If a window with the specified name is found, its ID and context (if available) will be printed on the page.

example 11 -->

### Window Events

The applications below demonstrate handling window events - opening and closing windows.

On load, Application A and Application B subscribe for the [`onWindowAdded()`](../../../reference/core/latest/windows/index.html#API-onWindowAdded) and the [`onWindowRemoved()`](../../../reference/core/latest/windows/index.html#API-onWindowRemoved) events of the Window Management API and will print to the page every time a new window is opened or an existing window is closed. 

Open several new windows by using the input fields in Application A to assign a name (required) to the new window and set the window context and size. Click the "Open Window" button to open a new window.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/windows/window-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex mb-3">
    <iframe src="https://6wgpf.csb.app" style="border: none;"></iframe>
</div>

<!-- ### Window Operations

The application below demonstrates manipulating already opened windows.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Use the "Open Window" and "Update Window" radio buttons to toggle between the options for creating new windows and updating existing ones. Select the "Update Window" option, select from the dropdown menu a window to update and set new position, size and/or context for the selected window. Click "Update Window" button to update the selected window.

example 13 -->

## Reference

[Window Management API Reference](../../../reference/core/latest/windows/index.html) 