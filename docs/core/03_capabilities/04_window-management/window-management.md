## Overview

Using the [Window Management API](../../../reference/core/latest/windows/index.html), your application can easily open and manipulate browser windows. This allows you to transform your traditional single-window web app into a multi-window native-like PWA application. The Window Management API enables applications to:

- **open multiple windows**;
- **manipulate the position and size** of opened windows;
- **pass context data upon opening new windows**;
- **listen for and handle events** related to opening and closing windows;
- **automatically save and restore** the positions and contexts of your application windows;

*For detailed information on the Window Management API, see the [**Window Management**](../../../glue42-concepts/windows/window-management/javascript/index.html) documentation.*

In the next sections, you can see examples of using the Interop API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Opening Windows

The application below demonstrates opening a new window with basic configuration (context, size, position) by using the [`open()`](../../../reference/core/latest/windows/index.html#!API-open) method of the Window Management API.

Use the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

<div style="display: flex;border: 1px solid #ccc;border-radius: 4px;">
    <iframe src="https://jp8hk.csb.app/app-a/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
</div>

<!-- ## Window Discovery

The application below demonstrates discovering a window by name.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Input the name of the window you want to search for and click the search button. If a window with the specified name is found, its ID and context (if available) will be printed on the page.

example 11 -->

## Window Events

The application below demonstrates handling window events - opening/closing windows.

On load, App A subscribes for the [`onWindowAdded()`](../../../reference/core/latest/windows/index.html#!API-onWindowAdded) and the [`onWindowRemoved()`](../../../reference/core/latest/windows/index.html#!API-onWindowRemoved) events of the Window Management API and will print to the page every time a new window is opened or an existing window is closed. 

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

<div style="display: flex;border: 1px solid #ccc;border-radius: 4px;">
    <iframe src="https://jwc9w.csb.app/app-a/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
    <iframe src="https://jwc9w.csb.app/app-b/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
</div>

<!-- ## Window Operations

The application below demonstrates manipulating already opened windows.

Open several new windows by using the input fields in App A to assign a name (required) to the new window and set the window context, size and position. Click the "Open Window" button to open a new window.

Use the "Open Window" and "Update Window" radio buttons to toggle between the options for creating new windows and updating existing ones. Select the "Update Window" option, select from the dropdown menu a window to update and set new position, size and/or context for the selected window. Click "Update Window" button to update the selected window.

example 13 -->