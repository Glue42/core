*RAW*

All windows functionality is enabled by default. However, when initializing @glue42/web-platform there are couple of settings:

These are pretty self-explanatory. The windowResponseTimeoutMs is important to know - when a window operation is being issued (like moving a window), this is the amount of time in MS we will wait for a valid success response from the target window. If we do not get a response in this time, we will assume that this window either does NOT have glue OR has not yet initialized it. There is no way for us to be sure which window upon opening has glue and which doesn't. The other property is clear - we will default to these bounds when opening a window OR an application

```javascript
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
}
```

*END*


## Overview

Using the [Window Management API](../../../reference/core/latest/windows/index.html), your application can easily open and manipulate browser windows. This allows you to transform your traditional single-window web app into a multi-window native-like PWA application. The Window Management API enables applications to:

- open multiple windows;
- manipulate the position and size of opened windows;
- pass context data upon opening new windows;
- listen for and handle events related to opening and closing windows;
- automatically save and restore the positions and contexts of your application windows;

*For detailed information on the Window Management API, see the [Window Management](../../../glue42-concepts/windows/window-management/javascript/index.html) documentation.*

The examples in the next sections demonstrate using the Window Management API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io). 

## Opening Windows

The application below demonstrates opening a new window with basic configuration (context and size) by using the [`open()`](../../../reference/core/latest/windows/index.html#!API-open) method of the Window Management API.

Use the input fields in Application A to assign a name (required) to the new window and set the window context and size. Click the "Open Window" button to open a new window.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/windows/window-opening" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://jp8hk.csb.app/app-a/index.html"></iframe>
</div>

<!-- ## Window Discovery

The application below demonstrates discovering a window by name.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Input the name of the window you want to search for and click the search button. If a window with the specified name is found, its ID and context (if available) will be printed on the page.

example 11 -->

## Window Events

The applications below demonstrate handling window events - opening and closing windows.

On load, Application A and Application B subscribe for the [`onWindowAdded()`](../../../reference/core/latest/windows/index.html#!API-onWindowAdded) and the [`onWindowRemoved()`](../../../reference/core/latest/windows/index.html#!API-onWindowRemoved) events of the Window Management API and will print to the page every time a new window is opened or an existing window is closed. 

Open several new windows by using the input fields in Application A to assign a name (required) to the new window and set the window context and size. Click the "Open Window" button to open a new window.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/windows/window-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex mb-3">
    <iframe src="https://6wgpf.csb.app/app-a/index.html"></iframe>
    <iframe src="https://6wgpf.csb.app/app-b/index.html"></iframe>
</div>

<!-- ## Window Operations

The application below demonstrates manipulating already opened windows.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Use the "Open Window" and "Update Window" radio buttons to toggle between the options for creating new windows and updating existing ones. Select the "Update Window" option, select from the dropdown menu a window to update and set new position, size and/or context for the selected window. Click "Update Window" button to update the selected window.

example 13 -->