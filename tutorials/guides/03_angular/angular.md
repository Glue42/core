## Overview

This tutorial is designed to walk you through every aspect of [**Glue42 Core**](https://glue42.com/core/) - setting up a project, initializing a [Main Application](../../developers/core-concepts/web-platform/overview/index.html), multiple [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps and extending your applications with [Shared Contexts](../../capabilities/data-sharing-between-apps/shared-contexts/index.html), [Interop](../../capabilities/data-sharing-between-apps/interop/index.html), [Window Management](../../capabilities/windows/window-management/index.html), [Channels](../../capabilities/data-sharing-between-apps/channels/index.html), [Application Management](../../capabilities/application-management/index.html) and [Workspaces](../../capabilities/windows/workspaces/overview/index.html) capabilities.

This guide will show you how to use [**Glue42 Core**](https://glue42.com/core/) in an Angular application using the [`@glue42/ng`](https://www.npmjs.com/package/@glue42/ng) library. If you haven't checked out the [Vanilla JS](../javascript/index.html) tutorial, we recommend going through that one first, as there you will get a better understanding of [**Glue42 Core**](https://glue42.com/core/) without the added complexity level of a web framework. 

## Introduction

You are a part of the IT department of a big multi-national bank and you have been tasked to create an application which will be used by the Asset Management department of the bank. The project will consist of two applications:
- **Clients** - displays a full list of clients and details about them;
- **Stocks** - displays a full list of stocks with prices. When the user clicks on a stock, details about the selected stock should be displayed.

All applications are being developed by different teams within the organizations and therefore are being hosted at different origins. 

As an end result, the users want to be able to run two apps as Progressive Web Apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

This tutorial assumes that you are familiar with Angular 2+ and the concepts of JavaScript and asynchronous programming.

It is also recommended to have the [Web Platform](../../developers/core-concepts/web-platform/overview/index.html), [Web Client](../../developers/core-concepts/web-client/overview/index.html) and [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) documentation available for reference.

## Tutorial Structure

The tutorial code is located in the [**Glue42 Core**](https://glue42.com/core/) [**GitHub repo**](https://github.com/Glue42/core). There you will find a `/tutorials` directory with the following structure:

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

Clone the [**Glue42 Core**](https://glue42.com/core/) [**GitHub repo**](https://github.com/Glue42/core) to get the tutorial files.

### 1.1. Start Files

Next, go to the `/tutorials/angular/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:

| Directory | Description |
|-----------|-------------|
| `/clients` | This is the **Clients** app. This is a standalone Angular application and is scaffolded with the Angular CLI without any custom settings. |
| `/stocks` | the **Stocks** app. Also a standalone Angular application scaffolded with the Angular CLI with one one custom setting - the `port` property in the `angular.json` file is set to 4100, because the two apps cannot run on the same port simultaneously. |

Both applications are configured as installable [**Progressive Web Apps**](https://developer.mozilla.org/nl/docs/Web/Progressive_web_apps). Therefore, the `src` directory of both apps contains a `manifest.json` and a `service-worker.js` file.

Go to the directories of both apps (`start/clients` and `start/stocks`), open a command prompt and run:

```cmd
npm install

npm start
```

This will install all necessary dependencies and will run apps as follows:

| URL | Application |
|-----|-------------|
| `http://localhost:4200/` | **Clients** |
| `http://localhost:4100/` | **Stocks** |

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#setup-rest_server) chapter).  

Install all dependencies in `angular/solution/clients` and `angular/solution/stocks` and start both apps by running the following commands: 

```cmd
npm install

npm start
```

You can now access the entry point of the project (the **Clients** app) at `http://localhost:4200/`.

### 1.3. REST Server

Before starting with the project, go to the `/tutorials/rest-server` directory and start the REST server that will host the necessary data for the applications:

```cmd
npm install

npm start
```

This will launch the server at port 8080.

## 2. Project Setup

### 2.1. Main Application

Every [**Glue42 Core**](https://glue42.com/core/) project *must have a single* central application called [Main Application](../../developers/core-concepts/web-platform/overview/index.html) or Web Platform app. In a real-world scenario this would be an application used for discovering and listing available applications, Workspaces, handling notifications and much more. However, your goal now is to learn about all these aspects with as little complexity as possible. That's why the **Clients** app will serve as your Main application. The users will open the **Clients** app and from there they will be able to click on a client and see their stocks and so on.

Setting up a Main application is just as simple as installing a new npm package and calling a function. Go to the **Clients** app base directory and run:

```cmd
npm install --save @glue42/ng
```

The `@glue42/ng` library comes with the latest [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) and [`@glue42/web-platform`](https://www.npmjs.com/package/@glue42/web-platform) packages, so you don't have to add any additional dependencies.

Next, import the `Glue42Ng` module and the `GlueWebPlatform` factory function in the **Clients**'s root `AppModule`. Call the `forRoot()` method of `Glue42Ng` and define a config object with a single property `webPlatform` and pass the `GlueWebPlatform` factory function:

```javascript
...
import { Glue42Ng } from "@glue42/ng";
import GlueWebPlatform from "@glue42/web-platform";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        HttpClientModule,
        Glue42Ng.forRoot({ webPlatform: { factory: GlueWebPlatform } }),
    ],
    providers: [DataService, GlueService],
    bootstrap: [AppComponent]
})

export class AppModule { }
```

Note that you should import `Glue42Ng` only once in your root `AppModule`.

This is everything you need to do to define your Angular applications as a `Main Glue42 Core` application.

### 2.2. Web Clients

Now that you have a fully functional Main application, you need to initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library in the **Stocks** app. This will allow both apps to connect and communicate with each other.

This process is almost identical to setting up a Main application. The only difference is that you need to import the `GlueWeb` factory function and the config object must have a single property `web`, not `webPlatform`.

```javascript
...
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        HttpClientModule,
        Glue42Ng.forRoot({ web: { factory: GlueWeb } }),
    ],
    providers: [DataService, GlueService],
    bootstrap: [AppComponent]
})

export class AppModule { }
```

When the apps are accessed, the Glue42 Web library will be initialized on app bootstrap. In order to gain access to the Glue42 API or to any errors during the initialization, you have to use the `Glue42Store` service. You could inject the `Glue42Store` directly in your components, but a better practice is to define a service that will inject the `Glue42Store`, perform all specific operations you need and expose only the functionality needed by your components.

In both apps there is an empty `glue.service.ts` which is already provided in the respective root modules and injected in the components. There you will inject the `Glue42Store` and expose the functionality you need.  

The Glue42 Web library has been initialized, so now you will provide a visual indicator for the state of Glue42 in case of an initialization error. Go to the `glue.service.ts` file of the **Clients** and **Stocks** apps and define a public getter called `glueStatus` that should return either `"available"` or `"unavailable"` depending on whether there have been any initialization errors:

```javascript
    constructor(private readonly glueStore: Glue42Store) {
        // setting the glue API to the window object makes it easier to just launch the app, open the console and experiment
        (window as any).glue = this.glueStore.getGlue();
    }

    public get glueStatus(): GlueStatus {
        return this.glueStore.getInitError() ? "unavailable" : "available";
    }
```

Now, go to the `app.component.ts` file of the **Clients** app and the `stocks.component.ts` and `stock-details.component.ts` files of the **Stocks** app. In `ngOnInit()` assign `this.glueService.glueStatus` to the `this.glueStatus` property:

```javascript
constructor(
    ...
    private readonly glueService: GlueService
) { }

public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    ...
}
```

If everything is correct, when you open the apps, you should see in the top left corner "Glue42 is available".

*Note that when you refresh the Stocks app on it's own, you will see that the Glue42 initialization is unsuccessful. This is because it cannot currently connect to the Glue42 environment provided by the [Main application](../../developers/core-concepts/web-platform/overview/index.html) and therefore cannot discover the Main app. To be able to connect to Glue42, all [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps **must** be opened by the [Web Platform application](../../developers/core-concepts/web-platform/overview/index.html)) or by another [Web Client](../../developers/core-concepts/web-client/overview/index.html) application already connected to the Glue42 environment.*

To verify that the initializations are correct, open the browser console of the **Clients** app (press `F12`) and execute the following:

```javascript
await glue.windows.open("stocks", "http://localhost:4100/").catch(console.error);
```

This will instruct the **Clients** app to open the **Stocks** app using the Glue42 [Window Management API](../../capabilities/windows/window-management/index.html). The **Stocks** app will now be able to connect to the Glue42 environment and initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library correctly.

Next, you will begin to add Glue42 functionalities to the apps.

## 3. Window Management

The goal of this chapter is to stat building the user flow of the entire project. The end users will open the **Clients** app and will be able to open the **Stocks** app from the "Stocks" button in it. Clicking on a stock in the **Stocks** app will open the **Stock Details** app.

Currently, the only way for the user to open the **Stocks** app is to manually enter its URL in the address bar. This, however, prevents the app from connecting to the Glue42 environment. Also, the **Stock Details** app is currently a separate view of the **Stocks** app. The end users have multiple monitors and would like to take advantage of that - they want clicking on a stock to open a new window with the respective app. The new window for the selected stock must also have specific dimensions and position. To achieve all this, you will use the [Window Management API](../../reference/core/latest/windows/index.html).

### 3.1. Opening Windows at Runtime

Instruct the **Clients** app to open the **Stocks** app in a new window when the user clicks on the "Stocks" button. Go to the `GlueService` of the **Clients** app and define a new method `openStockWindow()` which returns a `Promise<void>`. Use the `glue.windows.open()` method to open a new Glue42 Window at runtime by providing a unique name and a URL:

```javascript
public async openStockWindow(): Promise<void> {
    const name = `Stocks-${this.getNextCounter()}`;
    await this.glueStore.getGlue().windows.open(name, "http://localhost:4100");
}
```

The `getNextCounter()` function is a simple function, which stores in session storage a counter an increments it for each time `openStockWindow` is called. This is necessary, because the `name` argument in the `open()` function must be unique.

To complete the user flow, instruct the **Stocks** app to open a new window each time a the user clicks on a stock. Remember that each Glue42 Window *must have a unique name*. To avoid errors resulting from attempting to open Glue42 Windows with conflicting names, check whether the clicked stock has already been opened in a new window.

Go to the `GlueService` of the **Stocks** app and define a new method `openStockDetails()` which accepts a `stock` object as a parameter. Use the `glue.windows.open()` method to open a new Glue42 Window at runtime by providing a unique name and a URL:

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";

    // Check whether the clicked stock has already been opened in a new window.
    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        // Open a new window by providing a name and URL. The name must be unique.
        await this.glueStore.getGlue().windows.open(windowName, URL);
    }
}
```

Next, go to `stocks.component.ts` and call `openStockDetails()` from the `handleStockClick()` method. Check if Glue42 is available and open a new window. In case Glue42 is unavailable, preserve the original behavior:

```javascript
public handleStockClick(stock: Stock): void {
    if (this.glueService.glueStatus === "available") {
        this.glueService.openStockDetails(stock).catch(console.error);
    } else {
        this.data.selectedStock = stock;
        this.router.navigate(["/details"]);
    }
}
```

*Note that you must allow popups in the browser and/or remove any popup blockers to allow the windows to open.*

### 4.2. Window Settings

Next, define settings for the new window position (`top` and `left`) and size (`width` and `height`):

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";
    // Optional object with settings for the new window.
    const windowSettings: Glue42Web.Windows.CreateOptions = {
        width: 600,
        height: 600
    };

    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        await this.glueStore.getGlue().windows.open(windowName, URL, windowSettings);
    }
}
```

### 4.3. Window Context

Every Glue42 Window has its own `context` property (its value can be any object) which can be defined when opening the window and can be updated later. You will pass the stock selected from the **Stocks** app as a window context for the new **Stock Details** window:

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";
    // Optional object with settings for the new window.
    const windowSettings: Glue42Web.Windows.CreateOptions = {
        width: 600,
        height: 600,
        // Pass the selected stock as a context for the new window.
        context: stock
    };

    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        await this.glueStore.getGlue().windows.open(windowName, URL, windowSettings);
    }
}
```

Next, the **Stock Details** app needs to get this context. Since this is actually a window of the **Stocks** Angular app, you will simply extend the `GlueService` with a `getMyContext()` method, which will return the context of the current window:

```javascript
public async getMyContext() {
    // Getting the context of the current window.
    return await this.glueStore.getGlue().windows.my().getContext();
}
```

Finally, go to `stock-details.component.ts` and extend the `this.stock` assignment to take either the selected stock in the data service (if set) or get it from the window context:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    this.stock = this.dataService.selectedStock;

    if (this.glueStatus === "available") {
        this.stock = await this.glueService.getMyContext();
    }
}
```

Now, when you click on a stock, the new window will open with the specified position and size and will display the details of the selected stock. 

## 4. Interop

In this section you will use some of the functionalities provided by the [**Glue42 Core**](https://glue42.com/core/) [**Interop API**](../../reference/core/latest/interop/index.html).

### 4.1. Registering Interop Methods and Streams

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which it will push the new stock prices. Subscribers to the stream will get notified when new prices have been generated.

Go to the `GlueService` file of the **Stocks** app and define a method that will register an Interop method called `SelectClient`. The method will expect to receive an object with a property `client` which will contain the entire object of the selected client:

```javascript
...
constructor(private readonly glueStore: Glue42Store, private _zone: NgZone) { }
...
public async registerClientSelect() {
    const methodName = "SelectClient";
    const handler = (args) => {
        this._zone.run(() => this.selectedClientSource.next(args.client))
    };
    // Registering an Interop method by providing a name and callback
    // that will be called when the method is invoked.
    await this.glueStore.getGlue().interop.register(methodName, handler);
}
```

*Note that the `next` invocation is wrapped in `NgZone.run`, because the custom event is executed outside the Angular Zone and therefore will not trigger change detection, unless explicitly ran inside the zone.*

Next, you need to create an Interop stream called `LivePrices`, inject the `DataService`, subscribe to new price updates and push to the stream:

```javascript
...
constructor(private readonly glueStore: Glue42Store, private _zone: NgZone, private readonly dataService: DataService) { }
...
public async createPriceStream() {
    const streamName = "LivePrices";
    // Creating an Interop stream.
    const priceStream = await this.glueStore.getGlue().interop.createStream(streamName);
    // Pushing data to the stream.
    this.dataService.onStockPrices().subscribe(priceUpdate => priceStream.push(priceUpdate));
}
```

Now, go to `stocks.component.ts`, call these methods from the `GlueService` and subscribe to the `onClientSelected()` `Observable`. The best place to do that is in the `ngOnInit()` method where you will check if Glue42 is ready and only then attempt to register the Interop method and stream:

```javascript
public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    // Checking the Glue42 status.
    if (this.glueService.glueStatus === "available") {
        // Registering the Interop method.
        this.glueService.registerClientSelect().catch(console.log);
        // Creating the Interop stream.
        this.glueService.createPriceStream().catch(console.log);
        // Subscribing for notifications when the selected client changes.
        this.glueService.onClientSelected()
            .subscribe((client) => {
                this.stocks = this.allStocks.filter(stock => client.portfolio.includes(stock.RIC));
            });
    }
    ...
}
```

Note that in a real production application you may need to unregister the Interop method and close the Interop stream in the `ngOnDestroy()` hook. This depends on your business case, but here it is safe to leave it as it is. Also, note that the `registerClientSelect()` and `createPriceStream()` invocations are not awaited, because in this particular case it is not important when they will resolve, but this may be different in a real production application.

You also don't need to wrap the callback which pushes updates to the stream, because internally the `DataService` uses `setInterval()` that by default triggers a change detection.

### 4.2. Method Discovery

Go to the **Clients** app and define a `sendSelectedClient()` method in the `GlueService` that first will check whether the `SelectClient` method has been registered (i.e., whether the **Stocks** app is running):

```javascript
public sendSelectedClient(client: Client): void {
    // Finding an Interop method by name.
    const interopMethod = this.glueStore.getGlue().interop.methods().find(method => method.name === "SelectClient");
}
``` 

### 4.3. Method Invocation

Now, you have to invoke `SelectClient` if it exists. Extend the `sendSelectedClient()` method:

```javascript
// Now the method is `async` because `glue.interop.invoke()` returns a `Promise`.
public async sendSelectedClient(client: Client): Promise<void> {
    const interopMethod = this.glueStore.getGlue().interop.methods().find(method => method.name === "SelectClient");

    if (interopMethod) {
        const args = { client };
        // Invoking an Interop method by name and providing arguments for the invocation.
        await this.glueStore.getGlue().interop.invoke(foundMethod, args);
    }
}
```

Go to the `app.component.ts` of the **Clients** app and define a `handleClientClick()` method from which you will invoke `sendSelectedClient()`:

```javascript
public handleClientClick(client: Client): void {
    this.glueService.sendSelectedClient(client);
}
```

Now when you click on a client in the **Clients** app, the **Stocks** app should display only the stocks that are in the portfolio of the selected client.

### 4.4. Stream Subscription

Now, you need to subscribe the **Stock Details** app to the previously created Interop stream so that it can receive real time price updates about the selected stock.

First, go to the `GlueService` of the **Stocks** app and define a method that will receive the selected stock as an argument and will subscribe to the stream:

```javascript
public async subscribeToLivePrices(stock: Stock): Promise<Glue42Web.Interop.Subscription> {

    // Interop streams are special Interop methods that have a property `supportsStreaming: true`.
    // You can filter Interop methods by name and that property to find the stream you are interested in.
    const stream = this.glueStore.getGlue().interop.methods().find(method => method.name === "LivePrices" && method.supportsStreaming);

    if (!stream) {
        return;
    }

    // Creating a stream subscription.
    const subscription = await this.glueStore.getGlue().interop.subscribe(stream);

    // Use the `onData()` method of the `subscription` object to define
    // a handler for the received stream data.
    subscription.onData((streamData) => {
        const newPrices = streamData.data.stocks;
        // Extract only the stock you are interested in.
        const selectedStockPrice = newPrices.find(prices => prices.RIC === stock.RIC);

        this._zone.run(() => this.priceUpdateSource.next({
            Ask: Number(selectedStockPrice.Ask),
            Bid: Number(selectedStockPrice.Bid)
        }));

    });

    return subscription;
}
```

Go to the `stock-details.component.ts`, check if Glue42 is available and only then subscribe to the `LivePrices` Interop stream. Uncomment the private `glueSubscription` variable. Subscribe to the `onPriceUpdate()` `Observable` provided by the `GlueService` and handle the new prices. Define a `ngOnDestroy()` method where you have to close the subscription if it exists:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    this.stock = this.dataService.selectedStock;

    if (this.glueStatus === "available") {
        // Subscribing to the stream.
        this.glueSubscription = await this.glueService.subscribeToLivePrices(this.stock);    
    }

    this.glueService.onPriceUpdate().subscribe((newPrices) => {
        this.stock.Ask = newPrices.Ask;
        this.stock.Bid = newPrices.Bid;
    });
}

public ngOnDestroy(): void {
    if (this.glueSubscription) {
        // Closing the stream subscription.
        this.glueSubscription.close();
    }
}
```

Now the **Stocks Details** should display live price updates for the selected stock.

## 5. Shared Contexts

The next request of the users is to be able to see in the **Stock Details** app whether the selected client has the selected stock in their portfolio. This time, you will use the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html) to connect the **Clients**, **Stocks** and **Stock Details** apps.

### 5.1. Updating a Context

First, go to the **Clients** app and extend the `sendSelectedClient()` method in the `GlueService`. Comment out or delete the existing logic that uses the Interop API, and, instead, update the shared context object called `SelectedClient` (if the context does not exist, it will be created first) with the `client` object:

```javascript
public async sendSelectedClient(client: Client): Promise<void> {
    // Updating a shared context by name with a provided value (any object).
    await this.glueStore.getGlue().contexts.update("SelectedClient", client);
}
```

### 5.2. Subscribing for Context Updates

Now, go to the **Stocks** app and define a method `subscribeToSharedContext()` in the `GlueService`. Subscribe to the shared context called `SelectedClient`:

```javascript
public async subscribeToSharedContext() {
    // Subscribing for updates to a shared context by specifying
    // context name and providing a handler for the updates.
    this.glueStore.getGlue().contexts.subscribe("SelectedClient", (client) => {
        this._zone.run(() => this.selectedClientSource.next(client));
    });
}
```

Next, go to `stocks.component.ts` and comment out or delete the call to the `registerClientSelect()` method that uses the Interop API. Call `subscribeToSharedContext()` instead:

```javascript
public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "available") {
        ...
        this.glueService.subscribeToSharedContext().catch(console.log);
        ...
    }
    ...
}
```

Now **Clients** and **Stocks** communicate via Shared Contexts. 

Finally, go to `stock-details.component.ts`, call the same `subscribeToSharedContext()` function and subscribe to `onClientSelected()`. When a new client has been selected, you need to check if that client has the current stock in their portfolio and set the `this.clientMessage` property to the appropriate value:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    ...

    if (this.glueStatus === "available") {
        ...
        this.glueService.subscribeToSharedContext().catch(console.log);
    }

    this.glueService.onClientSelected()
        .subscribe((client) => {
            this.clientMessage = client.portfolio.includes(this.stock.RIC) ?
                `${client.name} has this stock in their portfolio` :
                `${client.name} does NOT have this stock in their portfolio`;
        });
    ...
}
```

Now all three apps are connected through the same shared context object and a single action in one of them can trigger changes in all.

## 6. Channels

The latest requirement from the users is to be able work with multiple clients at a time by having multiple instances of the **Stocks** app show the portfolios of different clients. Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here, you will use the [Channels API](../../reference/core/latest/channels/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a selected channel. The different channels are color coded and the user will be able to select a channel from a Channel Selector UI. The **Clients** app will update the context of the currently selected channel when the user clicks on a client.

### 6.1. Channels Configuration

The [Main Application](../../developers/core-concepts/web-platform/overview/index.html) (the **Clients** app in this project) handles the configuration of the Glue42 environment. The `webPlatform` property of the config object in `Glue42Ng` accepts an optional configuration object that allows you to enable, disable and configure various Glue42 features. Here you will use it to define the available Glue42 Channels.

```javascript
// in app.module.ts

const config: Glue42WebPlatform.Config = {
  channels: {
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
  }
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpClientModule,
    Glue42Ng.forRoot({ webPlatform: { factory: GlueWebPlatform, config } }),
    ChannelSelectModule
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 6.2. Channel Selector Widget

The next step is to add a dropdown select component to **Clients** and **Stocks** that will allow the users to pick a channel for the applications. The steps below are for the **Clients** app, but the procedure is identical for both apps.

For the purpose of this tutorial, there is a simple and fully functional material select component already prepared. All you have to do, is import it in the `app.module.ts` of the **Clients** app: 

```javascript
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        HttpClientModule,
        Glue42Ng.forRoot({ factory: GlueWeb }),
        ChannelSelectModule
    ],
    providers: [DataService, GlueService],
    bootstrap: [AppComponent]
})

export class AppModule { }
```

Next, go to `app.component.html`, locate the `<!-- Chapter 6 -->` comment and add the dropdown selector:

```html
<div class="col-md-2">
    <!-- Chapter 6 -->
    <channel-select [channels]="channels" (channelLeaveEmitter)="handleLeaveChannel()" (channelJoinEmitter)="handleJoinChannel($event)"></channel-select>
</div>
```

Now, go to the `GlueService` and extend it with the channel methods that will be used in the component:

```javascript
public getAllChannels(): Promise<Channel[]> {
    // Returns a list of all channel contexts.
    return this.glueStore.getGlue().channels.list();
}

public joinChannel(name: string): Promise<void> {
    // Joins a channel by name.
    return this.glueStore.getGlue().channels.join(name);
}

public leaveChannel(): Promise<void> {
    // Leaves the current channel.
    return this.glueStore.getGlue().channels.leave();
}
```

Go to the `app.component.ts` and handle the logic for the `channels` property and the `handleLeaveChannel()` and `handleJoinChannel()` methods. The Channel Selector component accepts a list of channels to display and outputs commands to join a specific channel or leave the current channel. Fetch all channels in `ngOnInit()` and define public methods for the two operations:

```javascript
public async ngOnInit(): Promise<void> {
    ...
    [this.clients, this.channels] = await Promise.all([
        this.data.getClients(),
        this.glueService.getAllChannels()
    ]);
}

public handleJoinChannel({ name }: { name: string }) {
     this.glueService.joinChannel(name).catch(console.log);
}

public handleLeaveChannel() {
    this.glueService.leaveChannel().catch(console.log);
}
```

Repeat the exact same steps for the **Stocks** app. As a result, both applications should have a selector in the top right corner that allows the user to pick a channel.

### 6.3. Publishing and Subscribing

The **Clients** app will publish to the current channel. All client selection logic is handled by the `handleClientClick()` method of the `app.component.ts` which in turn delegates it to the `sendSelectedClient()` of the `glue.service.ts`. All you have to do, is extend that method to also update the current channel context:

```javascript
public async sendSelectedClient(client: Client): Promise<void> {
    await Promise.all([
        this.glueStore.getGlue().contexts.update("SelectedClient", client),
        // Publishing data to the current channel.s
        this.glueStore.getGlue().channels.publish(client)
    ]);
}
```

You have to leave the logic for updating the shared context object, because the **Stocks Details** functionality has to remain the same. 

Next, the **Stocks** app has to subscribe for updates to the current channel. Go to the `glue.service.ts` of the **Stocks** app and define a method for subscribing to the channel context:

```javascript
public subscribeToChannelContext() {
    // Subscribing for updates to the current channel and
    // providing a handler for the udpates.
    this.glueStore.getGlue().channels.subscribe((client) => {
        this._zone.run(() => this.selectedClientSource.next(client));
    });
}
```

Go to the `stocks.component.ts` and modify `ngOnInit()` by calling `subscribeToChannelContext()` and removing the call to `subscribeToSharedContext()`:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "available") {
        ...
        this.glueService.subscribeToChannelContext();
        this.glueService.onClientSelected()
            .subscribe((client) => {
                if (client.portfolio) {
                    this.stocks = this.allStocks.filter((stock) => client.portfolio.includes(stock.RIC));
                    return;
                }
                this.stocks = this.allStocks;
            });
        ...
    }
    ...
}
```

Note that you have to check for the presence of a client portfolio, because when the app joins a new channel, it will always receive initial channel context. And if nothing has been published to that specific channel, the context will be an empty object. In this case, the app has to display all stocks.

Now, when you can open several instances of the **Stocks** app and keep them on different channels. The **Clients** app will update the context of its current channel when a client has been selected, and only the **Stocks** instance that is on the same color channel should update.

## Congratulations

You have successfully completed the [**Glue42 Core**](https://glue42.com/core/) Angular tutorial! See also the [JavaScript](../javascript/index.html) and [React](../react/index.html) tutorials for [**Glue42 Core**](https://glue42.com/core/).