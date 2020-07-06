## Overview

A **Shared Context** is a named object (holding a `map` of `key`/`value` pairs) that stores cross application data. The context object can hold any cross-application data on your domain. Any application can update a context or subscribe for context update notifications (by using the name of the context). Apps can also react to context changes (by subscribing for context updates) or update the context at runtime.

The [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) offers a simple and effective solution for sharing data between the applications on the same domain. For instance, you have an application showing a list of clients (served at `/clients`) and an application showing a list of stocks (served at `/stocks`). You need your "Stocks" app to show all stocks by default, but if the "Clients" app is also opened (in a different window) and the user selects a client, then you want the "Stocks" app to only show stocks owned by the selected client. You can easily achieve this in a few simple steps by using the [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) API:

- instruct the "Clients" app to publish updates to a context object holding the `id` of the currently selected client;
- instruct the "Stocks" app to subscribe for updates of that same context object and specify how the "Stocks" app should handle the received data in order to update its current state;

*For detailed information on the Shared Contexts API, see the [**Shared Contexts**](../../../glue42-concepts/data-sharing-between-apps/shared-contexts/javascript/index.html) documentation.*

In the next sections, you can see examples of using the Shared Contexts API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it. 

## Setting and Getting Context

The applications below demonstrate how to set and get context using the [`get()`](../../../reference/core/latest/shared%20contexts/index.html#!API-get) and [`set()`](../../../reference/core/latest/shared%20contexts/index.html#!API-set) methods of the Shared Contexts API. 

Create a value in Application B (any string) that will be assigned to a pre-defined property of the context object and set the "G42Core" context by clicking the "Set Context" button. Click "Get Context" in Application A to print the current value of the shared context object.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-get-set" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://k6fn5.csb.app/app-a/index.html"></iframe>
    <iframe src="https://k6fn5.csb.app/app-b/index.html"></iframe>
</div>

## Subscribing for Context Updates

The applications below demonstrate how to update a shared context object and how to subscribe for updates of a context by using the [`update()`](../../../reference/core/latest/shared%20contexts/index.html#!API-update) and [`subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#!API-subscribe) methods of the Shared Contexts API. 

Click the "Subscribe" button in Application A to subscribe for updates of the "G42Core" context. Every time the "G42Core" context changes, the context value will be printed. Create a context value and click the "Update Context" button in Application B to update the "G42Core" context.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-subscription" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://8df8e.csb.app/app-a/index.html"></iframe>
    <iframe src="https://8df8e.csb.app/app-b/index.html"></iframe>
</div>

## Discovering Contexts

The applications below demonstrate how to get a list of all contexts and find a specific context by name. 

Create several contexts with different names from Application B. Input the name of the context you want to find in Application A and click the "Find Context" button to print the context.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-discovery" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex mb-3">
    <iframe src="https://wpdr7.csb.app/app-a/index.html"></iframe>
    <iframe src="https://wpdr7.csb.app/app-b/index.html"></iframe>
</div>