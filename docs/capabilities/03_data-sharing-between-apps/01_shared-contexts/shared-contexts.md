## Overview

A shared context is a named object (holding a `map` of key/value pairs) that stores cross application data. The context object can hold any cross-application data. Any application can update a context or subscribe for context updates and react to them by using the name of the context.

The [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) offers a simple and effective solution for sharing data between your applications. Imagine you have an application showing a list of clients and an application showing client portfolios. What you need, is your "Portfolio" app to show the portfolio of a specific client that the user has selected from the "Clients" app. You can easily achieve this in a few simple steps by using the Shared Contexts API:

- instruct the "Clients" app to publish updates to a context object holding the `id` of the currently selected client;
- instruct the "Portfolio" app to subscribe for updates of that same context object and specify how the "Portfolio" app should handle the received data in order to update its current state;

The [Live Examples](#live_examples) section demonstrates using the Shared Contexts API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

## Retrieving Context Data

The Shared Contexts API is accessible through the [`glue.contexts`](../../../reference/core/latest/shared%20contexts/index.html) object.

To get the names of all currently available shared contexts, use the [`all()`](../../../reference/core/latest/shared%20contexts/index.html#API-all) method:

```javascript
// Returns a string array with the available context names.
const availableContexts = glue.contexts.all();
```

To get the value of a specific context object, use the [`get()`](../../../reference/core/latest/shared%20contexts/index.html#API-get) method:

```javascript
const data = await glue.contexts.get("app-styling");
```

## Updating a Context

Use the [`update()`](../../../reference/core/latest/shared%20contexts/index.html#API-update) method to create a new shared context or update the properties of an existing shared context. New properties (context keys) will be added, existing ones will be updated, and you can also remove context keys by setting them to `null`.

```javascript
const contextUpdate = {
    backgroundColor: "red",
    alternativeColor: "green"
};

await glue.contexts.update("app-styling", contextUpdate);
```

To remove keys, send a context update and set them to `null`:

```javascript
const keysToRemove = { alternativeColor: null };

await glue.contexts.update("app-styling", keysToRemove);
```

## Replacing a Context

Other than updating a context, you have the option to replace its value completely by using the [`set()`](../../../reference/core/latest/shared%20contexts/index.html#API-set) method:

```javascript
const newContext = { backgroundColor: "purple" };

// This will completely overwrite the existing context value.
await glue.contexts.set("app-styling", newContext);
```

The [`set()`](../../../reference/core/latest/shared%20contexts/index.html#API-set) method overwrites the existing context object, as opposed to the [`update()`](../../../reference/core/latest/shared%20contexts/index.html#API-update) method, which only updates the values of its properties.

## Subscribing for Context Updates

To subscribe for context updates, use the [`subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#API-subscribe) method. It accepts the name of the context as a first required parameter and a function that will handle the context updates as a second required parameter:

```javascript
const handler = (context, delta, removed) => {
    const bgColor = context.backgroundColor;

    console.log(bgColor);
});

await glue.contexts.subscribe("app-styling", handler); 
```

## Unsubscribing

The [`subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#API-subscribe) method returns a `Promise` which resolves with a function you can use to unsubscribe from context updates:

```javascript
const unsubscribe = await glue.contexts.subscribe("app-styling", handler);

unsubscribe();
```

## Destroying a Context

To destroy a context object, use the [`destroy()`](../../../reference/core/latest/shared%20contexts/index.html#API-destroy) method:

```javascript
await glue.contexts.destroy("app-styling");
```

## Live Examples

### Setting and Getting Context

The applications below demonstrate how to set and get context using the [`get()`](../../../reference/core/latest/shared%20contexts/index.html#API-get) and [`set()`](../../../reference/core/latest/shared%20contexts/index.html#API-set) methods of the Shared Contexts API. 

Create a value in Application B (any string) that will be assigned to a pre-defined property of the context object and set the "G42Core" context by clicking the "Set Context" button. Click "Get Context" in Application A to print the current value of the shared context object.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-get-set" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://k6fn5.csb.app" style="border: none;"></iframe>
</div>

### Subscribing for Context Updates

The applications below demonstrate how to update a shared context object and how to subscribe for updates of a context by using the [`update()`](../../../reference/core/latest/shared%20contexts/index.html#API-update) and [`subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#API-subscribe) methods of the Shared Contexts API. 

Click the "Subscribe" button in Application A to subscribe for updates of the "G42Core" context. Every time the "G42Core" context changes, the context value will be printed. Create a context value and click the "Update Context" button in Application B to update the "G42Core" context.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-subscription" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://8df8e.csb.app" style="border: none;"></iframe>
</div>

### Discovering Contexts

The applications below demonstrate how to get a list of all contexts and find a specific context by name. 

Create several contexts with different names from Application B. Input the name of the context you want to find in Application A and click the "Find Context" button to print the context.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/contexts/context-discovery" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex mb-3">
    <iframe src="https://wpdr7.csb.app" style="border: none;"></iframe>
</div>

## Reference

[Shared Contexts API Reference](../../../reference/core/latest/shared%20contexts/index.html) 