## Overview

This tutorial is designed to walk you through every aspect of [**Glue42 Core**](https://glue42.com/core/) - setting up a project, initializing a [Main Application](../../developers/core-concepts/web-platform/overview/index.html), multiple [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps and extending your applications with [Shared Contexts](../../capabilities/data-sharing-between-apps/shared-contexts/index.html), [Interop](../../capabilities/data-sharing-between-apps/interop/index.html), [Window Management](../../capabilities/windows/window-management/index.html), [Channels](../../capabilities/data-sharing-between-apps/channels/index.html), [Application Management](../../capabilities/application-management/index.html) and [Workspaces](../../capabilities/windows/workspaces/overview/index.html) capabilities.

This guide uses plain JavaScript and its goal is to allow you to put the basic concepts of [**Glue42 Core**](https://glue42.com/core/) to practice. There are also [React](../react/index.html) and [Angular](../angular/index.html) tutorials for [**Glue42 Core**](https://glue42.com/core/), but it is recommended that you go through the JavaScript tutorial first in order to get acquainted with [**Glue42 Core**](https://glue42.com/core/) without the distractions of additional libraries and frameworks.

## Introduction

You are a part of the IT department of a big multi-national bank and you have been tasked to lead the creation of a project which will be used by the Asset Management department of the bank. The project will consist of two applications:
- **Clients** - displays a full list of clients and details about them;
- **Stocks** - displays a full list of stocks with prices. When the user clicks on a stock, details about the selected stock should be displayed.

All applications are being developed by different teams within the organizations and therefore are being hosted at different origins. 

As an end result, the users want to be able to run two apps as Progressive Web Apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

This tutorial assumes that you are familiar with the concepts of JavaScript and asynchronous programming.

It is also recommended to have the [Web Platform](../../developers/core-concepts/web-platform/overview/index.html), [Web Client](../../developers/core-concepts/web-client/overview/index.html) and [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) documentation available for reference.

## Tutorial Structure

The tutorial code is located in the [**Glue42 Core**](https://glue42.com/core/) [GitHub repo](https://github.com/Glue42/core). There you will find a `/tutorials` directory with the following structure:

```cmd
/tutorials
    /angular
        /solution
        /start
    /guides
        /01_javascript
        /02_react
        /03_angular
    /javascript
        /solution
        /start
    /react
        /solution
        /start
    /rest-server
```

| Directory | Description |
|-----------|-------------|
| `/guides` | Contains the text files of the tutorials. |
| `/javascript`, `/react` and `/angular` | Contain the starting files for the tutorials and also a full solution for each of them. |
| `/rest-server` | A simple server used in the tutorials to serve the necessary `JSON` data. |

[**Glue42 Core**](https://glue42.com/core/) is an open-source project, so all feedback and contributions, both to the code base and the tutorials, are welcome.

## 1. Initial Setup

Clone the [**Glue42 Core**](https://glue42.com/core/) [GitHub repo](https://github.com/Glue42/core) to get the tutorial files.

### 1.1. Start Files

Next, go to the `/tutorials/javascript/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:

| Directory | Description |
|-----------|-------------|
| `/clients` | This is the **Clients** app.  The directory contains everything necessary for this app to be a standalone PWA:  an `index.html` file, a script file, a `manifest.json` file, `lib` directory, `assets` directory, a `service-worker.js` and a favicon. |
| `/stocks` | This is the **Stocks** app. The directory contains everything necessary for this app to be a standalone PWA:  an `index.html` file, a script file, a `manifest.json` file, `lib` directory, `assets` directory, a `service-worker.js` and a favicon. It also contains a **Stock Details** view in the `/stock/details` directory. |
| `/client-details` | This is the **Client Details** app which will be used later in the tutorial (in the [Workspaces](#8_workspaces) chapter) to display detailed information about a selected client. The directory contains everything necessary for this app to be a standalone PWA:  an `index.html` file, a script file, a `manifest.json` file, `lib` directory, `assets` directory, a `service-worker.js` and a favicon. |
| `package.json` | Standard `package.json` file. |
| `/workspace` | This is a **Workspaces App**, which will be used in the [Workspaces](#8_workspaces) chapter. |

All three apps are fully functional. To run them, execute the following commands:

```cmd
npm install
npm start
```

This will install the necessary dependencies and launch separate servers hosting the three apps (and the **Workspaces App**) as follows:

| URL | Application |
|-----|-------------|
| `http://localhost:9000/` | **Clients** |
| `http://localhost:9100/` | **Stocks** |
| `http://localhost:9200/` | **Client Details** |
| `http://localhost:9200/` | **Workspaces App** |

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#initial_setup-rest_server) chapter). Go to the `/javascript/solution` directory, open a command prompt and run the following commands to install the necessary dependencies and run the project:

```cmd
npm install
npm start
```

You can now access the entry point of the project (the **Clients** app) at `http://localhost:9000/`.

### 1.3. REST Server

Before starting with the project, go to the `/rest-server` directory and start the REST server that will host the necessary data for the applications:

```cmd
npm install
npm start
```

This will launch the server at port 8080.

## 2. Project Setup

### 2.1. Main Application

Every [**Glue42 Core**](https://glue42.com/core/) project *must have a single* central application called [Main Application](../../developers/core-concepts/web-platform/overview/index.html) or Web Platform app. In a real-world scenario this would be an application used for discovering and listing available applications, Workspaces, handling notifications and much more. However, your goal now is to learn about all these aspects with as little complexity as possible. That's why the **Clients** app will serve as your Main application. The users will open the **Clients** app and from there they will be able to click on a client and see their stocks and so on.

Setting up a Main application is just as simple as calling a function. First, reference the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) script in the **Clients** app and then initialize the library. The Web Platform library handles the entire Glue42 environment, which is necessary for the [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps to be able to connect to the Main application and to each other.

Open the `index.html` of the **Clients** app, add a new `<script>` tag below the `TODO: Chapter 2` comment and reference the Glue42 Web Platform script from the `/clients/lib` directory:

```html
<script src="/lib/platform.web.umd.js"></script>
```

Next, open the `index.js` file of the **Clients** app and find the `TODO: Chapter 2` comment inside the `start()` function. [Initialize](../../developers/core-concepts/web-platform/setup/index.html#initialization) the Web Platform library by using the `GlueWebPlatform()` factory function attached to the global `window` object. Assign the `glue` property of the returned object as a property of the global `window` object for easy use later:

```javascript
// In `start()`.
const { glue } = await GlueWebPlatform();
window.glue = glue;
```

Find the `toggleGlueAvailable()` function marked with a `TODO: Chapter 2` comment and uncomment it. Call it once the `GlueWebPlatform()` factory function has resolved.

```javascript
// In `start()`.
toggleGlueAvailable();
```

After refreshing the app, you should see in the top left corner that Glue42 is available. This means that you have successfully initialized the [Main Application](../../developers/core-concepts/web-platform/overview/index.html).

Next, you need to initialize the rest of the apps to connect them to Glue42 as Web Clients.

### 2.2. Web Clients

Now that you have a fully functional Main application, you need to initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library in the rest of the applications. This will allow them to connect to the **Clients** app and communicate with each other.

Open the `index.html` files of the **Stocks**, **Stock Details** and **Client Details** apps, add a new `<script>` tag below the `TODO: Chapter 2` comment and reference the Glue42 Web script from the `/lib` directory:

```html
<script src="/lib/web.umd.js"></script>
```

Next, open the `index.js` files of the **Stocks**, **Stock Details** and **Client Details** apps and find the `TODO: Chapter 2` comment inside the `start()` function. Initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library by using the `GlueWeb()` factory function attached to the global `window` object. Assign the returned object as a property of the global `window` object for easy use:

```javascript
// In `start()`.
window.glue = await GlueWeb();
```

*Note that the `GlueWeb()` factory function returns directly a `glue` object unlike the `GlueWebPlatform()` factory function, which returns it wrapped in an object.*

Find the `toggleGlueAvailable()` function marked with a `TODO: Chapter 2` comment and uncomment it. Call it once the `GlueWeb()` factory function has resolved.

```javascript
// In `start()`.
toggleGlueAvailable();
```

*Note that when you refresh these apps, you will see that the Glue42 initialization is unsuccessful. This is because they cannot currently connect to the Glue42 environment provided by the [Main application](../../developers/core-concepts/web-platform/overview/index.html) and therefore cannot discover the Main app or each other. To be able to connect to Glue42, all [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps **must** be opened by the [Web Platform application](../../developers/core-concepts/web-platform/overview/index.html)) or by another [Web Client](../../developers/core-concepts/web-client/overview/index.html) application already connected to the Glue42 environment.*

To verify that the initializations are correct, open the browser console of the **Clients** app (press `F12`) and execute the following:

```javascript
await glue.windows.open("stocks", "http://localhost:9100/").catch(console.error);
```

This will instruct the **Clients** app to open the **Stocks** app using the Glue42 [Window Management API](../../capabilities/windows/window-management/index.html). The **Stocks** app will now be able to connect to the Glue42 environment and initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library correctly. Repeat this for the rest of the apps by changing the values of the `name` and the `url` parameters when calling the [`open()`](../../capabilities/windows/window-management/index.html#API-open) method.

Next, you will begin to add Glue42 functionalities to the apps.

## 3. Window Management

The goal of this chapter is to stat building the user flow of the entire project. The end users will open the **Clients** app and will be able to open the **Stocks** app from the "Stocks" button in it. Clicking on a stock in the **Stocks** app will open the **Stock Details** app.

Currently, the only way for the user to open the **Stocks** app is to manually enter its URL in the address bar. This, however, prevents the app from connecting to the Glue42 environment. Also, the **Stock Details** app is currently a separate view of the **Stocks** app. The end users have multiple monitors and would like to take advantage of that - they want clicking on a stock to open a new window with the respective app. The new window for the selected stock must also have specific dimensions and position. To achieve all this, you will use the [Window Management API](../../reference/core/latest/windows/index.html).

### 3.1. Opening Windows at Runtime

Instruct the **Clients** app to open the **Stocks** app in a new window when the user clicks on the "Stocks" button. Locate the `TODO: Chapter 3.1` comment inside the `stocksButtonHandler()` function. Use the [`open()`](../../reference/core/latest/windows/index.html#API-open) method to open the **Stocks** app in a new window. The `instanceID` and `counter` variables ensure that the name of each new **Stocks** instance will be unique:

```javascript
const stocksButtonHandler = (client) => {

    // The `name` and `url` parameters are required. The window name must be unique.
    const name = `Stocks-${instanceID || counter}`;
    const URL = "http://localhost:9100/";

    glue.windows.open(name, URL).catch(console.error);
};
```

To complete the user flow, instruct the **Stocks** app to open a new window each time a the user clicks on a stock. Remember that each Glue42 Window *must have a unique name*. To avoid errors resulting from attempting to open Glue42 Windows with conflicting names, check whether the clicked stock has already been opened in a new window.

Go to the **Stocks** app and find the `TODO: Chapter 3.1` comment in the `stockClickedHandler()` function. Currently, it rewrites the value of `window.location.href` to redirect to the **Stock Details** view. Remove that and use the [`open()`](../../reference/core/latest/windows/index.html#API-open) method instead. Use the [`list()`](../../reference/core/latest/windows/index.html#API-list) method to get a collection of all Glue42 Windows and check whether the clicked stock is already open in a window. It is safe to search by `name`, because all Glue42 Window instances must have a unique `name` property:

```javascript
const stockClickedHandler = (stock) => {
    const name = `${stock.BPOD} Details`;
    const URL = "http://localhost:9100/details/";

    // Check whether the clicked stock has already been opened in a new window.
    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL).catch(console.error);
    };
};
```

After refreshing, when you click on a stock, a separate **Stock Details** window will be opened. The selected stock will be passed later as a window context - all fields in the **Stock Details** app currently display "undefined" values.

*Note that you must allow popups in the browser and/or remove any popup blockers to allow the **Stock Details** window to open.*

### 3.2. Window Settings

To position the new **Stock Details** window, extend the logic in the [`open()`](../../reference/core/latest/windows/index.html#API-open) method by passing an optional [`Settings`](../../reference/core/latest/windows/index.html#Settings) object containing specific values for the window size (`width` and `height`) and position (`top` and `left`):

```javascript
const stockClickedHandler = (stock) => {
    const name = `${stock.BPOD} Details`;
    const URL = "http://localhost:9100/details/";
    // Optional configuration object for the newly opened window.
    const config = {
        left: 100,
        top: 100,
        width: 550,
        height: 550
    };

    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL, config).catch(console.error);
    };
};
```

### 3.3. Window Context

To allow the **Stock Details** app to display information about the selected stock, pass the `stock` object in the **Stocks** app as a context to the newly opened **Stock Details** window. The **Stock Details** window will then access its context and extract the necessary stock information.

Add a `context` property to the window configuration object and assign the `stock` object as its value:

```javascript
const stockClickedHandler = (stock) => {
    const name = `${stock.BPOD} Details`;
    const URL = "http://localhost:9100/details/";
    const config = {
        left: 100,
        top: 100,
        width: 550,
        height: 550,
        // Set the `stock` object as a context for the new window.
        context: stock
    };

    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL, config).catch(console.error);
    };
};
```

Update the **Stock Details** app to get the `stock` object. Find the `TODO: Chapter 3.3` comment in the **Stock Details** app. Get a reference to the current window using the [`my()`](../../reference/core/latest/windows/index.html#API-my) method and get its context with the [`getContext()`](../../reference/core/latest/windows/index.html#WebWindow-getContext) method of the Glue42 Window object:

```javascript
// In `start()`.
const currentWindow = glue.windows.my();
const stock = await currentWindow.getContext();
```

Next, you will use the [Interop API](../../reference/core/latest/interop/index.html) to pass the portfolio of the selected client to the **Stocks** app and show only the stocks present in their portfolio.

## 4. Interop

### 4.1. Registering Interop Methods and Streams

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which it will push the new stock prices. Subscribers to the stream will get notified when new prices have been generated.

Go to the **Stocks** app and find the `TODO: Chapter 4.1` comment. Use the [`register()`](../../reference/core/latest/interop/index.html#API-register) method to register an Interop method in the `start()` function. Pass a method name (`"SelectClient"`) and a callback for handling method invocations to `register()`. The callback will expect as an argument an object with a `client` property, which in turn holds an object with a `portfolio` property. Filter all stocks and pass only the ones present in the portfolio of the client to the `setupStocks()` function. After that, use [`createStream()`](../../reference/core/latest/interop/index.html#API-createStream) to create a stream called `"LivePrices"` and assign it to the global `window` object for easy access:

```javascript
// In `start()`.

// Define a method name and a callback that will handle method invocations.
const methodName = "SelectClient";
const methodHandler = (args) => {
    const clientPortfolio = args.client.portfolio;
    const stockToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));
    setupStocks(stockToShow);
};

// Register an Interop method.
glue.interop.register(methodName, methodHandler);

// Create an Interop stream.
window.priceStream = await glue.interop.createStream("LivePrices");
```
Finally, go to the `newPricesHandler()` function and find the `TODO: Chapter 4.1` comment in it. This function is invoked every time new prices are generated. Push the updated prices to the stream if it exists:

```javascript
// Update the `newPricesHandler()` to push the new prices to the stream.
const newPricesHandler = (priceUpdate) => {
    priceUpdate.stocks.forEach((stock) => {
        const row = document.querySelectorAll(`[data-ric='${stock.RIC}']`)[0];

        if (!row) {
            return;
        }

        const bidElement = row.children[2];
        bidElement.innerText = stock.Bid;

        const askElement = row.children[3];
        askElement.innerText = stock.Ask;
    });

    // Check whether the stream exists and push the new prices to it.
    if (priceStream) {
        priceStream.push(priceUpdate);
    };
};
```

Next, you will find and invoke the registered method from the **Clients** app.

### 4.2. Method Discovery

Go to the **Clients** app, find the `TODO: Chapter 4.2.` comment and extend the `clientClickedHandler()`. This function is invoked every time the user clicks on a client. Use [`methods()`](../../reference/core/latest/interop/index.html#API-methods) to check for a registered Interop method with the name `"SelectClient"`:

```javascript
// In `clientClickedHandler()`.

// Get a list of all registered Interop methods and filter them by name.
const selectClientStocks = glue.interop.methods().find(method => method.name === "SelectClient");
```

### 4.3. Method Invocation

Next, invoke the `"SelectClient"` Interop method if present.

Find the `TODO: Chapter 4.3.` comment and invoke the method if it has been registered. Use [`invoke()`](../../reference/core/latest/interop/index.html#API-invoke) and pass the previously found method object to it as a first argument. Wrap the `client` object received by the `clientClickedHandler()` in another object and pass it as a second argument to [`invoke()`](../../reference/core/latest/interop/index.html#API-invoke):

```javascript
// In `clientClickedHandler()`.

// Check if the method exists and invoke it.
if (selectClientStocks) {
    glue.interop.invoke(selectClientStocks, { client });
};
```

The updated handler should now look something like this:

```javascript
const clientClickedHandler = (client) => {
    const selectClientStocks = glue.interop.methods().find((method) => method.name === "SelectClient");

    if (selectClientStocks) {
        glue.interop.invoke(selectClientStocks, { client });
    };
};
```

### 4.4. Stream Subscription

Use the Interop API to subscribe the **Stock Details** app to the previously created `"LivePrices"` stream.

Go to the **Stock Details** app and find the `TODO: Chapter 4.4` comment in the `start()` function. Use the [`subscribe()`](../../reference/core/latest/interop/index.html#API-subscribe) method to subscribe to the `"LivePrices"` stream and use the [`onData()`](../../reference/core/latest/interop/index.html#Subscription-onData) method of the returned subscription object to assign a handler for the received stream data:

```javascript
// In `start()`.

// Create a stream subscription.
const subscription = await glue.interop.subscribe("LivePrices");
// Define a handler for the received stream data.
const streamDataHandler = (streamData) => {
    const updatedStocks = streamData.data.stocks;
    const selectedStock = updatedStocks.find(updatedStock => updatedStock.RIC === stock.RIC);

    updateStockPrices(selectedStock.Bid, selectedStock.Ask);
};

// Handle the received stream data.
subscription.onData(streamDataHandler);
```

*Note that each new instance of the **Stocks** app will create a new stream instance. In real world scenarios, this should be handled differently - e.g., by a system app acting as a designated data provider. For more details, see [Plugins](../../capabilities/plugins/index.html).*

## 5. Shared Contexts

The next request of the users is to be able to see in the **Stock Details** app whether the selected client has the selected stock in their portfolio. This time you will use the [Shared Contexts API](../../reference/core/latest/shared%20contexts/index.html) to connect the **Clients**, **Stocks** and **Stock Details** apps through shared context objects.

### 5.1. Updating a Context

Go to the **Clients** app and find the `TODO: Chapter 5.1.` comment in the `clientClickedHandler()` function. Comment out or delete the existing code that uses the Interop API. Use the [`update()`](../../reference/core/latest/shared%20contexts/index.html#API-update) method to create and set a shared context object by providing a name and value - it will hold the selected client object. Other applications will be able to subscribe for updates to this context and be notified when its value changes:

```javascript
const clientClickedHandler = (client) => {
    // The `update()` method updates the value of a specified context object.
    // If the specified context does not exist, it is created.
    glue.contexts.update("SelectedClient", client).catch(console.error);
};
```

### 5.2. Subscribing for Context Updates

Next, go to the **Stocks** app and find the `TODO: Chapter 5.2` comment in the `start()` function. Comment out or delete the code that uses the Interop API to register the method `"SelectClient"` (but leave the code that registers the `"LivePrices"` stream). Use the [`subscribe()`](../../reference/core/latest/shared%20contexts/index.html#API-subscribe) method to subscribe for updates to the `"SelectedClient"` context object:

```javascript
// In `start()`.

// Define a function that will handle the context updates.
const updateHandler = (client) => {
    const clientPortfolio = client.portfolio;
    const stockToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));

    setupStocks(stockToShow);
};

// Subscribe for updates to the context.
glue.contexts.subscribe("SelectedClient", updateHandler);
```

Go to the `index.html` file of the **Stock Details** app, find the `TODO: Chapter 5.2` comment and uncomment the `<div>` that will hold the client status. Go to the `index.js` file and uncomment the `updateClientStatus()` function. Find the `TODO: Chapter 5.2` comment in the `start()` function and subscribe for the `"SelectedClient"` context. Invoke the `updateClientStatus()` function and pass the selected client and stock to it:

```javascript
// In `start()`.

// Define a function that will handle the context updates.
const updateHandler = (client) => {
    updateClientStatus(client, stock);
};

// Subscribe for updates to the context.
glue.contexts.subscribe("SelectedClient", updateHandler);
```

Now the **Stock Details** app will show whether the client selected from the **Clients** app has the the displayed stock in their portfolio.

## 6. Channels

The latest requirement from the users is to be able work with multiple clients at a time by having multiple instances of the **Stocks** app show the portfolios of different clients. Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here you will use the [Channels API](../../reference/core/latest/channels/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a different Channel. The different Channels are color coded and the user will be able to select a Channel from a Channel Selector UI. The **Clients** app will update the context of the currently selected Channel when the user clicks on a client.

### 6.1. Channels Configuration

The [Main Application](../../developers/core-concepts/web-platform/overview/index.html) (the **Clients** app in this project) handles the configuration of the Glue42 environment. The `GlueWebPlatform()` factory function accepts an optional configuration object that allows you to enable, disable and configure various Glue42 features. Here you will use it to define the available Glue42 Channels.

Find the `TODO: Chapter 6.1` comment in the **Clients** app, define a configuration object and pass it to `GlueWebPlatform()`:

```javascript
// In start().

// Define Glue42 Channels.
const channels = {
    definitions: [
        {
            name: "Red",
            meta: {
                color: "red"
            }
        },
        {
            name: "Green",
            meta: {
                color: "green"
            }
        },
        {
            name: "Blue",
            meta: {
                color: "#66ABFF"
            }
        },
        {
            name: "Pink",
            meta: {
                color: "#F328BB"
            }
        },
        {
            name: "Yellow",
            meta: {
                color: "#FFE733"
            }
        },
        {
            name: "Dark Yellow",
            meta: {
                color: "#b09b00"
            }
        },
        {
            name: "Orange",
            meta: {
                color: "#fa5a28"
            }
        },
        {
            name: "Purple",
            meta: {
                color: "#c873ff"
            }
        },
        {
            name: "Lime",
            meta: {
                color: "#8af59e"
            }
        },
        {
            name: "Cyan",
            meta: {
                color: "#80f3ff"
            }
        }
    ]
};

// Define the configuration object and pass it to the factory function.
const config = { channels };
const { glue } = await GlueWebPlatform(config);
window.glue = glue;
```

When **Clients** starts, the defined Channels will be initialized and ready for interaction.

### 6.2. Channel Selector Widget

The users have to be able to navigate through the Channels for which they will need some sort of user interface. You can create your own Channel selector widget by using the Channels API, but for the purpose of the tutorial there is a jQuery Channel widget included. To add it to the **Clients** and **Stocks** apps, follow these steps:

1. Go the `index.html` files of both apps and find the `TODO: Chapter 6.2` comments in the `<head>` tag. Reference the `channelSelectorWidget.js` file located in the `/lib` folder:

```html
<script src="/lib/channelSelectorWidget.js"></script>
```

2. Next, find the other `TODO: Chapter 6.2` comment in the `<body>` tag and uncomment the `<select>` element. It will be populated by the Channel selector widget script.

3. Find the `TODO: Chapter 6.2` comment in the `index.js` files of both apps and call the globally exposed `createChannelSelectorWidget()` function to populate the Channel selector widget. The `createChannelSelectorWidget()` method expects three arguments:

- `NO_CHANNEL_VALUE` - a string for the default value to be displayed in the widget. The users will use it to leave the current Channel:

```javascript
// In `start()`.

// Define and initialize the variable that will be used as a first argument.
const NO_CHANNEL_VALUE = "No channel";
```

- `channelNamesAndColors` - an array of objects with `name` and `color` properties holding the name and the color code of each Channel. You will get them using the [`list()`](../../reference/core/latest/channels/index.html#API-list) method of the Channels API:

```javascript
// In `start()`.

// Get the contexts of all available Channels.
const channelContexts = await window.glue.channels.list();
// Extract only the names and colors of the Channels.
const channelNamesAndColors = channelContexts.map((channelContext) => {
    const channelInfo = {
        name: channelContext.name,
        color: channelContext.meta.color
    };

    return channelInfo;
});
```

- `onChannelSelected` - a callback that will be called when the user selects a Channel from the widget. Use the [`my()`](../../reference/core/latest/channels/index.html#API-my) method to get a reference to the current Channel and the [`join()`](../../reference/core/latest/channels/index.html#API-join) and [`leave()`](../../reference/core/latest/channels/index.html#API-leave) methods to switch between Channels:

```javascript
// In `start()`.

const onChannelSelected = (channelName) => {
    // Leave the current Channel when the user selects "No Channel".
    if (channelName === NO_CHANNEL_VALUE) {
        if (glue.channels.my()) {
            glue.channels.leave().catch(console.error);
        }
    } else {
        // Join the Channel selected by the user.
        glue.channels.join(channelName).catch(console.error);
    };
};
```

Finally, pass these arguments to `createChannelSelectorWidget()`:

```javascript
// In `start()`.

createChannelSelectorWidget(
    NO_CHANNEL_VALUE,
    channelNamesAndColors,
    onChannelSelected
);
```

Refresh both apps to see the Channel selector widget.

### 6.3. Publishing and Subscribing

Find the `TODO: Chapter 6.3.` comment in the `clientClickedHandler()` function of the **Clients** app. Use the [`publish()`](../../reference/core/latest/channels/index.html#API-publish) method and pass the selected client as an argument to update the Channel context when a new client is selected. Note that `publish()` will throw an error if the app tries to publish data but is not on a Channel. Use the `my()` method to check for the current Channel:

```javascript
// In `clientClickedHandler()`.

const currentChannel = glue.channels.my();

if (currentChannel) {
    glue.channels.publish(client).catch(console.error);
};
```

Next, go to the **Stocks** app and comment out or delete the code in the `start()` function that uses the Shared Contexts API to listen for updates of the `"SelectedClient"` context. Find the `TODO: Chapter 6.3` comment and use the [`subscribe()`](../../reference/core/latest/channels/index.html#API-subscribe) method instead to enable the **Stocks** app to listen for updates of the current Channel context. Provide the same callback you used in Chapter 5.2. to handle context updates, but modify it to check for the client portfolio. This is necessary in order to avoid errors if the user decides to change the Channel of the **Stocks** app manually - the context of the new Channel will most likely be an empty object, which will lead to undefined values:

```javascript
// In `start()`.

const updateHandler = (client) => {
    if (client.portfolio) {
        const clientPortfolio = client.portfolio;
        const stockToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));

        setupStocks(stockToShow);
    };
};

glue.channels.subscribe(updateHandler);
```

Now when the **Clients** and the **Stocks** apps are on the same Channel, the **Stocks** app will be updated with the portfolio of the selected client.

## 7. Application Management

Up until now you had to use the Window Management API to open new windows when the user clicks on the "Stocks" button in the **Clients** app or on a stock in the **Stocks** app. This works fine for small projects, but does not scale well for larger ones, because this way each app has to know all details (URL, start position, initial context, etc.) about every application it needs to start. In this chapter you will replace the Window Management API with the [Application Management API](../../reference/core/latest/appmanager/index.html) which will allow you to predefine all available applications when initializing the [Main Application](../../developers/core-concepts/web-platform/overview/index.html). The **Clients** app will be decoupled from the **Stocks** app and the **Stocks** app will be decoupled from **Stock Details** - you will need only the names of the apps to be able to start them.

### 7.1. Application Configuration

To take advantage of the [Application Management API](../../reference/core/latest/appmanager/index.html), define configurations for your applications. Go to the **Clients** app and, similarly to Channels, define an `applications` property in the configuration object passed to `GlueWebPlatform()` containing all required definitions:

```javascript
// In `start()`.

// Define application configurations.
const applications = {
    local: [
        {
            name: "Clients",
            type: "window",
            details: {
                url: "http://localhost:9000/"
            }
        },
        {
            name: "Stocks",
            type: "window",
            details: {
                url: "http://localhost:9100/",
                left: 0,
                top: 0,
                width: 860,
                height: 600
            }
        },
        {
            name: "Stock Details",
            type: "window",
            details: {
                url: "http://localhost:9100/details",
                left: 100,
                top: 100,
                width: 400,
                height: 400
            }
        },
        {
            name: "Client Details",
            type: "window",
            details: {
                url: "http://localhost:9200/"
            }
        }
    ]
};
const config = { channels, applications };
const { glue } = await GlueWebPlatform(config);
window.glue = glue;
```

The `name` and `url` properties are required when defining an application configuration object. As you see, the position and size of the app windows is now defined in their configuration.

### 7.2. Starting Applications

Go the the **Clients** app and remove the code in the `stocksButtonHandler()` using the Window Management API (including the code related to the `counter` and `instanceID` variable, as it won't be necessary to create unique window names). Find the `TODO: Chapter 7.2` comment, get the **Stocks** application object with the [`application()`](../../reference/core/latest/appmanager/index.html#API-application) method and use its [`start()`](../../reference/core/latest/appmanager/index.html#Application-start) method to start the **Stocks** app when the user clicks the "Stocks" button. Pass the current Channel as a context to the started instance:

```javascript
// In `stocksButtonHandler()`.

const stocksApp = glue.appManager.application("Stocks")
const currentChannel = glue.channels.my();

stocksApp.start({ channel: currentChannel }).catch(console.error);
```

Now go to the **Stocks** application, find the `TODO: Chapter 7.2` comment and use the following to receive and join the Channel:

```javascript
// In `start()`.

const appContext = await glue.appManager.myInstance.getContext();
const channelToJoin = appContext.channel;

if (channelToJoin) {
    await glue.channels.join(channelToJoin);
};
```

This, however, will not re-render the Channel selector widget in the **Stocks** app with the newly programmatically joined Channel. To make the Channel selector react to calls to [`join()`](../../reference/core/latest/channels/index.html#API-join) and [`leave()`](../../reference/core/latest/channels/index.html#API-leave), define a method which will re-render the widget every time the current Channel has changed. Use the [`onChanged()`](../../reference/core/latest/channels/index.html#API-onChanged) method to subscribe for changes of the current Channel:

```javascript
// In `start()`.

// The `createChannelSelectorWidget()` function returns a function which
// accepts the new Channel name as a parameter and updates the widget. 
const updateChannelSelectorWidget = createChannelSelectorWidget(
    NO_CHANNEL_VALUE,
    channelNamesAndColors,
    onChannelSelected
);

// Re-render the Channel selector each time the Channel changes.
const handleChannelChanges = (channelName) => {
    updateChannelSelectorWidget(channelName || NO_CHANNEL_VALUE);
};

glue.channels.onChanged(handleChannelChanges);
```

### 7.3. Application Instances

Finally, find the `TODO: Chapter 7.3` comment in the `stockClickedHandler()`. Comment out or delete the code that uses the Window Management API to open the **Stock Details** app. Use the [`application()`](../../reference/core/latest/appmanager/index.html#API-application) method to get the **Stock Details** app. Check whether an instance with the selected stock has already been started by iterating over the contexts of the existing **Stock Details** instances. If there is no instance with the selected stock, call the `start()` method on the application object and pass the selected stock as a context:

```javascript
// In `stockClickedHandler()`.

const detailsApplication = glue.appManager.application("Stock Details");

// Check whether an instance with the selected stock is already running.
const contexts = await Promise.all(
    // Use the `instances` property to get all running application instances.
    detailsApplication.instances.map(instance => instance.getContext())
);
const isRunning = contexts.find(context => context.RIC === stock.RIC);

if (!isRunning) {
    // Start the app and pass the `stock` as context.
    detailsApplication.start(stock).catch(console.error);
};
```

To get the `stock` from the starting context in the **Stock Details** application:

```javascript
// In `start()`.

const stock = await glue.appManager.myInstance.getContext();

setFields(stock);
```

Everything should work as before, the difference being that the apps now use the Application Management API instead of the Window Management API.

## 8. Workspaces

The latest feedback from the users is that their desktops very quickly become cluttered with multiple floating windows. The [**Glue42 Core**](https://glue42.com/core/) [Workspaces](../../capabilities/windows/workspaces/overview/index.html) feature solves exactly that problem.

The new requirement is that when a user clicks on a client in the **Clients** application, a new Workspace should open displaying detailed information about the selected client in one app and his stocks portfolio in another. When the user clicks on a stock, a third application should appear in the same Workspace displaying more details about the selected stock. You will use the **Client Details** application for displaying information about the selected client.

Go to the `index.html` and `index.js` files of the **Clients** app and comment out or delete the "Stocks" button and the `stocksButtonHandler()`. Also remove all logic and references related to Channels from the **Clients** and **Stocks** apps that was introduced in a previous chapter. Instead, you will use Workspaces to allow the users to work with multiple clients at once and organize their desktop at the same time. Channels and Workspaces can, of course, be used together to provide extremely enhanced user experience, but in order to focus entirely on working with Workspaces, the Channels functionality will be ignored.

Use the [Workspaces API](../../reference/core/latest/workspaces/index.html) documentation as a reference when working on this chapter. 

### 8.1. Setup

All Workspaces are contained in a specialized standalone web application called [Workspaces App](../../capabilities/windows/workspaces/overview/index.html#workspaces_concepts-frame). It is outside the scope of this tutorial to cover building and customizing this application, so you have a ready-to-go application located at `/workspace`. The Workspaces App is already being hosted at `http://localhost:9300/` by the server you started in Chapter 1.

### 8.2. Workspace Layouts

Next, create a Workspace layout which will be the blueprint for the Workspace that the **Clients** app will restore when the user clicks on a client. You already have all necessary application definitions from the Application Management section. To allow the users to select the apps from the "Add Application" menu of the Workspaces App, add a `customProperties` top-level key to their configuration and define its `includeInWorkspaces` property:

```javascript
const applications = [
    ...
    {
        name: "Client Details",
        details: {
            url: "http://localhost:9200/"
        },
        customProperties: {
            // Allow the app to appear in the "Add Application" menu.
            includeInWorkspaces: true
        }
    }
]
```

Modify accordingly the configurations of the **Stocks**, **Stock Details** and **Client Details** apps to allow them to appear in the "Add Application" menu of the Workspaces App.

Next, go to the **Clients** app and define a `layouts` property inside the `GlueWebPlatform()` configuration object. This property must be an object containing the operation mode and a collection of layouts, similarly to `applications` and `channels`:

```javascript
const layouts = {
    mode: "idb",
    local: [
        {
            name: "client-space",
            type: "Workspace",
            metadata: {},
            components: [
                {
                    type: "Workspace",
                    state: {
                        children: [
                            {
                                type: "column",
                                children: [
                                    {
                                        type: "row",
                                        children: [
                                            {
                                                type: "group",
                                                children: [
                                                    {
                                                        type: "window",
                                                        config: {
                                                            appName: "Client Details",
                                                            title: "Client Details"
                                                        }
                                                    }
                                                ],
                                                config: {}
                                            },
                                            {
                                                type: "column",
                                                children: [
                                                    {
                                                        type: "group",
                                                        children: [
                                                            {
                                                                type: "window",
                                                                config: {
                                                                    appName: "Stocks",
                                                                    title: "Stocks"
                                                                }
                                                            }
                                                        ],
                                                        config: {}
                                                    }
                                                ],
                                                config: {}
                                            }
                                        ],
                                        config: {}
                                    }
                                ],
                                config: {}
                            }
                        ],
                        config: {
                            name: "Client Space",
                            title: "Untitled 1"
                        },
                        context: {}
                    }
                }
            ]
        }
    ]
};

const config = {
    applications,
    layouts
};

const { glue } = await GlueWebPlatform(config);
window.glue = glue;
```

The layouts mode is `"idb"`, which means that the layouts will be persisted using the browser's `IndexedDB` API. This is very convenient for demos and tutorials, because it allows layouts persistence without coding a specialized server.

Now this Workspace layout can be restored by name using the [Workspaces API](../../reference/core/latest/workspaces/index.html).

### 8.3. Initializing Workspaces

To be able to use Workspaces functionalities, initialize the [Workspaces API](../../reference/core/latest/workspaces/index.html) in the **Clients**, **Client Details** and **Stocks** apps. The **Stock Details** app will participate in the Workspace, but will not need to use any Workspaces functionality. Find the `TODO: Chapter 8.3` comment in the `index.html` files of the **Clients**, **Client Details** and **Stocks** apps and reference the Workspaces library:

```html
<script src="/lib/workspaces.umd.js"></script>
```

The Workspaces script attaches the `GlueWorkspaces()` factory function to the global `window` object. Go to the `index.js` files of the **Clients**, **Client Details** and **Stocks** apps and add `GlueWorkspaces` to the `libraries` array of the configuration object when initializing the Glue42 Web library:

In **Clients**:

```javascript
// In `start()`.

const config = {
    // Pass the Workspaces factory function.
    glue: { libraries: [GlueWorkspaces] },
    // Define where the Workspaces App is located.
    workspaces: { src: "http://localhost:9300/" },
    channels,
    applications,
    layouts
};

const { glue } = await GlueWebPlatform(config);
window.glue = glue;
```

The **Clients** app is the [Main Application](../../developers/core-concepts/web-platform/overview/index.html) and besides the `GlueWorkspaces()` factory function, its configuration object requires also a `workspaces` property defining where the Workspaces App is located.

In **Client Details** and **Stocks**:

```javascript
// In `start()`.

const config = {
    // Pass the Workspaces factory function.
    libraries: [GlueWorkspaces]
};

window.glue = await GlueWeb(config);
```

### 8.4. Opening Workspaces

Next, you have to implement opening a new Workspace when the user clicks on a client in the **Clients** app. Find the `TODO: Chapter 8.4` comment in the `clientClickedHandler()` function in the **Clients** app, restore by name the Workspace layout you created earlier and pass the selected client as a starting context. The specified context will be attached as a window context to all windows participating in the Workspace:

```javascript
const clientClickedHandler = (client) => {
    const restoreConfig = { 
        context: { client } 
    };

    glue.workspaces.restoreWorkspace("Client Space", restoreConfig).catch(console.error);
};
```

If everything is correct, a new Workspace should now open every time you click a client. 

### 8.5. Starting Context

Handle the starting Workspace context to show the details and the portfolio of the selected client in the **Client Details** and **Stocks** apps. Also, set the Workspace title to the name of the selected client.

Go to the **Client Details** app, find the `TODO: Chapter 8.5` comment in the `start()` function and use the [`onContextUpdated()`](../../reference/core/latest/workspaces/index.html#Workspace-onContextUpdated) method of the current Workspace to subscribe for context updates. Invoke the `setFields()` function passing the `client` property of the updated context and set the title of the Workspace to the `name` of the selected client:

```javascript
// In `start()`.

const myWorkspace = await glue.workspaces.getMyWorkspace();

if (myWorkspace) {
    myWorkspace.onContextUpdated((context) => {
        if (context.client) {
            setFields(context.client);
            myWorkspace.setTitle(context.client.name);
        };
    });
};
```

Go to the **Stocks** app, find the `TODO: Chapter 8.5` comment, use the [`onContextUpdated()`](../../reference/core/latest/workspaces/index.html#Workspace-onContextUpdated) Workspace method and set up the stocks for the selected client:

```javascript
// In `start()`.

const myWorkspace = await glue.workspaces.getMyWorkspace();

if (myWorkspace) {
    myWorkspace.onContextUpdated((context) => {
        if (context.client) {
            const clientPortfolio = context.client.portfolio;
            const stockToShow = stocks.filter((stock) => clientPortfolio.includes(stock.RIC));
            
            setupStocks(stockToShow);
        };
    });
};
```

Now when you select a client in the **Clients** app, a new Workspace will open with the **Client Details** and **Stocks** apps showing the relevant client information.

### 8.6. Modifying Workspaces

Next, you have to make the **Stock Details** app appear in the same Workspace as a sibling of the **Stocks** app when the user clicks on a stock. You have to check whether the **Stock Details** app has already been added to the Workspace, and if not - add it and update its context with the selected stock, otherwise - only update its context.

*To achieve this functionality, you will have to manipulate a Workspace and its elements. It is recommended that you familiarize yourself with the Workspaces terminology to fully understand the concepts and steps below. Use the available documentation about [Workspaces Concepts](../../capabilities/windows/workspaces/overview/index.html#workspaces_concepts), [Workspace Box Elements](../../capabilities/windows/workspaces/workspaces-api/index.html#box_elements) and the [Workspaces API](../../reference/core/latest/workspaces/index.html).*

The **Stocks** app is a [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow) that is the only child of a [`Group`](../../reference/core/latest/workspaces/index.html#Group) element. If you add the **Stock Details** app as a child to that `Group`, it will be added as a second tab window and the user will have to manually switch between both apps. The **Stock Details** has to be a sibling of the **Stocks** app, but both apps have to be visible within the same parent element. That is why, you have to add a new `Group` element as a sibling of the existing `Group` that contains the **Stocks** app, and then load the **Stock Details** app in it.

After the **Stocks Details** app has been opened in the Workspace as a [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow), you have to pass the selected stock as its context. To do that, get a reference to the underlying [Glue42 Window](../../reference/core/latest/windows/index.html#WebWindow) object of the **Stock Details** window using the [`getGdWindow()`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow-getGdWindow) method of the [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow) instance and update its context with the [`updateContext()`](../../reference/core/latest/windows/index.html#WebWindow-updateContext) method.

Go to the `stockClickedHandler()` function of the **Stocks** app, find the `TODO: Chapter 8.6` comment in it, comment out or delete the code for starting the **Stock Details** app with the Application Management API and add the following:

```javascript
// In `stockClickedHandler()`.

// Reference to the Glue42 Window object of the Stock Details instance.
let detailsGlue42Window;

const myWorkspace = await glue.workspaces.getMyWorkspace();

// Reference to the `WorkspaceWindow` object of the Stock Details instance.
let detailsWorkspaceWindow = myWorkspace.getWindow(window => window.appName === "Stock Details");

// Check whether the Stock Details has already been opened.
if (detailsWorkspaceWindow) {
    detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
} else {
    // Reference to the current window.
    const myId = glue.windows.my().id;
    // Reference to the immediate parent element of the Stocks window.
    const myImmediateParent = myWorkspace.getWindow(window => window.id === myId).parent;
    // Add a `Group` element as a sibling of the immediate parent of the Stocks window.
    const group = await myImmediateParent.parent.addGroup();

    // Open the Stock Details window in the newly create `Group` element.
    detailsWorkspaceWindow = await group.addWindow({ appName: "Stock Details" });
    await detailsWorkspaceWindow.forceLoad();
    detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
};

// Update the window context with the selected stock.
detailsGlue42Window.updateContext({ stock });
```

*Note that [`forceLoad()`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow-forceLoad) is used to make sure that the **Stock Details** app is loaded and a [Glue42 Window](../../reference/core/latest/windows/index.html#WebWindow) instance is available. This is necessary, because [`addWindow()`](../../reference/core/latest/workspaces/index.html#Group-addWindow) adds a new window to the [`Group`](../../reference/core/latest/workspaces/index.html#Group) (meaning that it exists as an element in the Workspace), but it does not guarantee that the content has loaded.*

Now, go to the **Stock Details** app, find the `TODO: Chapter 8.6` comment in the `start()` function, check for the selected stock in the window context and subscribe for context updates. Comment out or delete the existing code for setting the stock details and listening for context and subscription updates and replace it with the following:

```javascript
// In `start()`.

const myWindow = glue.windows.my();
const context = await myWindow.getContext();
let selectedStock;

subscription.onData((streamData) => {
    if (!selectedStock) {
        return;
    };
    const newPrices = streamData.data.stocks;
    const selectedStockPrice = newPrices.find(prices => prices.RIC === selectedStock.RIC);
    updateStockPrices(selectedStockPrice.Bid, selectedStockPrice.Ask);
});

if (context && context.stock) {
    selectedStock = context.stock;
    setFields(selectedStock);
};

myWindow.onContextUpdated((context) => {
    if (context.stock) {
        selectedStock = context.stock;
        setFields(selectedStock);
    };
});
```

## Congratulations!

You have successfully completed the [**Glue42 Core**](https://glue42.com/core/) JavaScript tutorial! If you are a React or an Angular developer, try also the [React](../react/index.html) and [Angular](../angular/index.html) tutorials for [**Glue42 Core**](https://glue42.com/core/).