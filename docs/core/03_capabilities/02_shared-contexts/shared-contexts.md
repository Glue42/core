## Overview

A **Shared Context** is a named object (holding a `map` of `key`/`value` pairs) that stores cross application data. The context object can hold any cross-application data on your domain. Any application can update a context or subscribe for context update notifications (by using the name of the context). Apps can also react to context changes (by subscribing for context updates) or update the context at runtime.

The [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) offers a simple and effective solution for sharing data between the applications on the same domain. For instance, you have an application showing a list of clients (served at `/clients`) and an application showing a list of stocks (served at `/stocks`). You need your "Stocks" app to show all stocks by default, but if the "Clients" app is also opened (in a different window) and the user selects a client, then you want the "Stocks" app to only show stocks owned by the selected client. You can easily achieve this in a few simple steps by using the [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) API:

- instruct the "Clients" app to publish updates to a context object holding the `id` of the currently selected client;
- instruct the "Stocks" app to subscribe for updates of that same context object and specify how the "Stocks" app should handle the received data in order to update its current state;

*For detailed information on the Shared Contexts API, see the [**Shared Contexts**](../../../glue42-concepts/data-sharing-between-apps/shared-contexts/javascript/index.html) documentation.*

In the next sections, you can see examples of using the Shared Contexts API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it. 

## Setting and Getting Context

The applications below demonstrate how to set and get context using the [`get()`](../../../reference/core/latest/shared%20contexts/index.html#!API-get) and [`set()`](../../../reference/core/latest/shared%20contexts/index.html#!API-set) methods of the Shared Contexts API. 

Create a value in App B (any string) that will be assigned to a pre-defined property in the context object and set the "G42Core" context by clicking the "Set Context" button. Click "Get Context" in App A to print the current value of the shared context object.

<div style="display: flex;border: 1px solid #ccc;border-radius: 4px;">
    <iframe src="https://k6fn5.csb.app/app-a/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
    <iframe src="https://k6fn5.csb.app/app-b/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
</div>

## Subscribing for Context Updates

The applications below demonstrate how to update a shared context object and how to subscribe for updates of a context by using the [`update()`](../../../reference/core/latest/shared%20contexts/index.html#!API-update) and [`subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#!API-subscribe) methods of the Shared Contexts API. 

Click the "Subscribe" button in App A to subscribe for updates of the "G42Core" context. Every time the "G42Core" context changes, the context value will be printed. Create a context value and click the "Update Context" button to update the "G42Core" context.

<div style="display: flex;border: 1px solid #ccc;border-radius: 4px;">
    <iframe src="https://8df8e.csb.app/app-a/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
    <iframe src="https://8df8e.csb.app/app-b/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
</div>

## Discovering Contexts

The applications below demonstrate how to get a list of all contexts and find a specific context by name. 

Create several contexts with different names from App B. Input the name of the context you want to find in App A and click the "Find Context" button to print the context.

<div style="display: flex;border: 1px solid #ccc;border-radius: 4px;">
    <iframe src="https://wpdr7.csb.app/app-a/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
    <iframe src="https://wpdr7.csb.app/app-b/index.html" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"></iframe>
</div>