## Introduction

This tutorial will to show you how to use Glue42 Core in an Angular application using the `@glue42/ng` package. If you haven't checked out the [Vanilla JS](../vanilla-js/index.html) tutorial, we recommend going through that one first, as there you will get a better understanding of Glue42 Core without the added complexity level of a web framework. 

The goal now is to show how you can integrate and extend a couple of existing Angular applications into an awesome Glue42 Core project. We will cover all major aspects of Glue42 Core, including **interop**, **windows** and **contexts**.

The business scenario and requirements are identical to the the [Vanilla JS](../vanilla-js/index.html) tutorial. We are part of the IT department of a big multi-national bank and our task is to create an application which will be used by the bank's asset management team. This will be a multi-app project consisting of two applications:
- **clients** - displays a full list of clients and their details
- **stocks** - displays a full list of stocks with prices; whenever a stock is clicked the user should see that stock's details

Those two applications must be hosted on the same domain where
- /clients resolves to **clients**
- /stocks resolves to **stocks**

As an end result our users want to be able to run the two apps as Progressive Web Apps in separate windows, in order to take advantage of their multi-monitor setups. Also, our users want those apps, even though in separate windows, to be able to communicate with each other. For example, whenever a client is selected, the stocks app should show only that client's stocks and more, which you will learn along the way.

## Prerequisites

Before we get into the interesting part, there are few things you need to be comfortable with:
- Angular 2+ - this tutorial assumes that you have general Angular knowledge.
- JS array methods.
- Asynchronous programming with Promises.

It is also a good idea to keep our [**Glue42 Core CLI**](../../core/what-is-glue42-core/core-concepts/cli/index.html), [**Glue42 Client**](../../core/what-is-glue42-core/core-concepts/glue42-client/index.html) and [**Glue42 Web Reference API**](../../reference/core/latest/glue42%20web/index.html) sections close by for reference.

## Tutorial Structure

The tutorial code is located in our [**GitHub repo**](https://github.com/Glue42/core). Inside the repo you wil find a directory `/tutorials` with the following structure:

```cmd
/tutorials
  /guides
    /vanilla-js
    /react
    /angular
  /rest-server
  /vanilla-js
    /solution
    /start
  /react
    /solution
    /start
  /angular
    /solution
    /start
```

The `/guides` directory holds the `.md` files used to display this text information that you are reading right now.
The `/vanilla-js`, `/react` and `/angular` directories hold the **start** files for each respective tutorial. This is your starting point. There is also **solution** directories, in case you would like to see our approach to the problems ahead.
The `/rest-server` is a simple server which we use in the tutorials to serve us the `json` data that we need.

As you know Glue42 Core is an open-source project, so we welcome all feedback and contributions both to our code base and tutorials.


## 1. Setting Up

### 1.1. Getting Started with the Tutorial Files

First you need to get the tutorial code and get your self familiar with it. Clone our GitHub repo at `https://github.com/Glue42/core` and navigate to `/tutorials/rest-server`. This server is going to serve the data for our applications. All you need to do is:

```cmd
npm i

npm start
```

This will launch the server at port **8080** and that's it, we will not be touching it any more.

Now, go to `/tutorials/angular/start`. There are the start files for you project. You can either work directly there or you can copy-paste then somewhere else. To keep it simple, we will be working with the start files directly.

Let's have a brief overview of the files inside the start directory:
- `/clients` - this is the clients app. It is a standalone Angular application and was scaffolded with the Angular CLI without any custom settings.
- `/stock` - this is the stocks app. It is also a standalone Angular application, also scaffolded with the Angular CLI with one one custom setting: inside `angular.json` we have set `port: 4100`. The reason is that we can't run both our apps using the default `ng serve` command, because both listen to port **4200** by default.

Both start applications are configured as **installable** [**PWA**](https://developer.mozilla.org/nl/docs/Web/Progressive_web_apps). Therefore you can see in both a `manifest.json` and `service-worker.js` files inside the respective `src` directories.

Now, let's launch the apps and see what we have. To do that go to both `/clients` and `/stocks`, open a terminal and:

```cmd
npm i

npm start
```

This will execute `ng serve` as is the default from Angular CLI.

Open the browser at `localhost:4200` and check out the app. It is pretty straight forward - just a list of clients, fetched from the **rest server** we started before. Clicking on a client does nothing right now. But more importantly, if you look at the right side of the address bar, you will see an `install` icon, allowing you to install the app. Once installed you can launch it by going to `chrome://apps` (if you use Google Chrome) and clicking on the icon.

Repeat this process with `localhost:4100`. Again, this is straight forward, nothing special, just a list of stocks. Once again we have the `install` icon, go ahead and install the app, just like the you did for `clients`. The only difference here is that whenever you click on a stock, you are redirected to the stock details view of the app.

Great! So far we have gotten ourselves acquainted with the start files, we launched all the apps and installed them as PWAs. Next, we are now going to set up our Glue42 Core Environment using the CLI.


### 1.2. Getting Started with the Glue42 Core CLI

The first step in building our project is to set up our development environment for a Glue42 Core project. As a prerequisite for Glue42 Core, our apps should be located at the same origin (protocol, host and port) in order for them to communicate with each other. This means that we should access the clients app from **/clients** and the stocks app from **/stocks**. Furthermore we need to set up the [**Glue42 Core Environment**](../../core/what-is-glue42-core/core-concepts/environment/index.html). All of this is very straight-forward with the [**Glue42 Core CLI**](../../core/what-is-glue42-core/core-concepts/cli/index.html).

First, we need to install the Glue42 Core CLI. You can do that globally:

```cmd
npm install --global @glue42/cli-core
```

Alternatively you can use `npx` to call CLI commands. It is up to you, but for consistency in this tutorial, we will assume that we have it globally.

Next, we go to `/start` and call the `init` command:

```cmd
gluec init
```

This command fetched all the necessary packages and scaffolded all the config files we need with the default settings. Next, we need to somehow serve our existing apps under the same origin. The built-in dev server in the Glue42 Core CLI allows us to not only serve our apps under the same origin, but also maintain the automatic bundle rebuild and page refresh when we make a change (standard for `ng serve`). To do all of that, we need to open `glue.config.dev.json` and register our apps. Your config file should look like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/clients/",
                "localhost": {
                    "port": 4200
                }
            },
            {
                "route": "/stocks/",
                "localhost": {
                    "port": 4100
                }
            }
        ],
        "sharedAssets": []
    },
    "logging": "default"
}
```

We are effectively using the Glue42 Core CLI as a reverse proxy to the original Angular servers that we have running from `npm start` (`ng serve`).

Finally, we need to tell our Angular apps that they are no longer served from `root`, but from a specific route. By default all Angular apps resolve their assets and client-side routing relative to `root`, but since our apps are not longer served from root, we need to make one small change. Go to each `angular.json` and set the `baseHref` property, like this:

```json
{
    "projects": {
        ...
        "stocks":{ // or "clients"
            ...
            "architect": {
                ...
                "build": {
                    ...
                    "options": {
                        ...
                        "baseHref": "/stocks/" // or "/clients/"
                        ...
                    }
                }
            }
        }
    }
}
```

**NOTE!** You need to have a slash both at the end and at the start of the base href, otherwise it will not be registered.

**NOTE!** The value you give to the `baseHref` must be identical to the value used in as `route` in `glue.config.dev.json`. Otherwise, the client-side routing will not work correctly.

Let's serve our apps. To do that go to each app's root and start the default Angular servers

```cmd
npm start
```

Then go to our project root (at `/start`) and call the `serve` command of the CLI:

```cmd
gluec serve
```

Now all the necessary Glue42 Core Environment assets are served at the default locations and our apps are accessible from a single origin:
- `localhost:4242/clients`
- `localhost:4242/stocks`

Even better, because the default Angular servers are used to build, watch and refresh the apps, we have file-watching, auto-refresh and any other setting we like from the Angular dev arsenal.

Now it is a good moment ot remove the PWAs you installed in the previous section, because they point to the default `:4100` and `:4200` apps and install the new ones.

### 1.3. Getting Started with the Solution files

Before we continue with the fun part, we will take a look at how to run the solution. You have a full solution at your disposal as a reference point in case you what to see the end result beforehand, or if you get lost somewhere along the way.

First install all dependencies - run `npm i` at `/solution`, `/solution/clients` and `/solution/stocks`. Next start both apps by running `npm start` inside `/solution/clients` and `/solution/stocks`. Finally, (assuming that you have the Glue42 Core CLI globally installed) go to `/solution` and run `gluec serve`.

You can open your browser of choice and access the apps at:
- `localhost:4242/clients`
- `localhost:4242/stocks`

## 2. Initializing Glue Web For Angular

Now we need to set up both our apps as Glue42 Clients by initializing the `@glue42/ng` library. Go to `/clients` and `/stocks` and:

```cmd
npm install --save @glue42/ng
```

The `@glue42/ng` library comes with the latest `@glue42/web` and `@glue42/desktop` packages, so you don't have to add any additional dependencies.

Next we need to import the `Glue42Ng` module provided by `@glue42/ng` in both our apps, in their respective root AppModules. We do that by calling the `.forRoot()` method of `Glue42Ng` and passing in the factory function of `@glue42/web`. The root AppModules should look like this:


```javascript
// ...previous imports...
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
    Glue42Ng.forRoot({ factory: GlueWeb })
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

**Note!** You should import `Glue42Ng` only once in your root AppModule.

When we access our apps, Glue42 Web will initialize on app bootstrap. In order to get access to any errors during the initialization of Glue JS or the API itself, we will use the `Glue42Store` service. You could inject the `Glue42Store` directly in your components and use it like that, but a better practice is to define a service which would inject the `Glue42Store`, do all the custom operations we need and expose only the functionality used by our components. We will do just that.

In both `/clients` and `/stocks` you will see an empty `glue.service.ts` which is already provided in the respective root modules and injected in the components. There we will inject the `Glue42Store` and expose the functionality we need. `Glue42Ng.forRoot` did all the Glue JS initiation for us, so all we need to do now is to provide some visual indicator that Glue is ready or not in case of an initiation error.

To do that, go to each `glue.service.ts` and define a public getter called `glueStatus`, which should return either `"failed"` or `"ready"` depending on whether there were any initiation errors. The services should look like this:

```javascript
    constructor(private readonly glueStore: Glue42Store) { }

    public get glueStatus(): GlueStatus {
        return this.glueStore.initError ? "failed" : "ready";
    }
```

Now head over to the `app.component.ts` in `/clients` and in `ngOnInit()` assign the `this.glueStatus` property to `this.glueService.glueStatus`. Your component should look like this:

```javascript
  constructor(
    private readonly data: DataService,
    private readonly glueService: GlueService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    this.clients = await this.data.getClients();
  }
```

Now, repeat the same steps inside `stocks.component.ts` and `stock-details.component.ts` inside `/stocks`.

If you have done everything correctly, when you open the apps you should see in the top left corner a text saying that Glue is ready.

This visual representation of the glue state is very basic, in a production-level application you could pass the `initError` to a logging service and provide a more user-friendly notification. 

## 3. Interop

### 3.1. Overview

In this section we will explore some of the functionality provided by our [**Interop API**](../../reference/core/latest/interop/index.html).

### 3.2. Methods and Streams registration

The target functionality for the moment is when a user clicks on a client in the **Clients** app, the **Stocks** app should display only stocks owned by the selected client. We will achieve this functionality using interop methods. The **Stocks** app will register an interop method and when that method is invoked, the app will receive the selected client and filter the displayed list of stocks. In this sub-chapter we will take a look at how and where to register that method and in the following couple of chapters we will see how to discover the method from the **Clients** app and how to invoke it.

We will also prepare another functionality. Right now the **Stocks** app has some basic fake live price generation logic, we will extend it so that when new prices are created, we will update the view of the app, but also push on the interop stream. In future chapters we will subscribe for the live data from another app.

Okay, let's start with the interop method. Naturally the logic for the method registration will be placed in the `GlueService`. We will call the interop method `"SelectClient"` and we will expect to receive an object with a property `client`, which will be the full selected client object. Then we will use the `onClientSelected` observable to emit the selected client. Your code should look something like this:

```javascript
    // previous code
    constructor(private readonly glueStore: Glue42Store, private _zone: NgZone) { }

    // other code

    public async registerClientSelect() {
        await this.glueStore.glue.interop.register("SelectClient", (args) => {
            this._zone.run(() => this.selectedClientSource.next(args.client))
        });
    }
```

**Note!** We are wrapping the `next` invocation in `NgZone.run`, because our custom event is executed outsize the Angular Zone and therefore will not trigger change detection unless explicitly ran inside the zone.

Next we need to create a stream called `"LivePrices"`, inject the `DataService` and subscribe to new prices update and push to the stream. The result should look like this:

```javascript
    // previous code
    constructor(private readonly glueStore: Glue42Store, private _zone: NgZone, private readonly dataService: DataService) { }

    // other code

    public async createPriceStream() {
        const priceStream = await this.glueStore.glue.interop.createStream("LivePrices");
        this.dataService.onStockPrices().subscribe((priceUpdate) => priceStream.push(priceUpdate));
    }
```

Now, let's head over to `stocks.component.ts`, call those `GlueService` methods and subscribe to the `onClientSelected` observable. The best place to do that is the `ngOnInit` method, where we will check if glue is ready and only then attempt to register the interop method and the stream. Your `ngOnInit` should look like this:

```javascript
  public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "ready") {
      this.glueService.registerClientSelect().catch(console.log);
      this.glueService.createPriceStream().catch(console.log);

      this.glueService.onClientSelected()
      .subscribe((client) => {
        this.stocks = this.allStocks.filter((stock) => client.portfolio.includes(stock.RIC));
      });
    }

    this.allStocks = await this.data.getStocks();
    this.stocks = this.allStocks;

    this.data.onStockPrices()
      .subscribe((update) => {
        this.stocks.forEach((stock) => {
          const matchingStock = update.stocks.find((stockUpdate) => stockUpdate.RIC === stock.RIC);
          stock.Ask = matchingStock.Ask;
          stock.Bid = matchingStock.Bid;
        })
      });
  }
```

**Note!** In a real production application you might need to un-register the interop method and the stream in the `ngOnDestroy` hook. It depends on your business case, but in our apps, we are safe to leave it as is. Also, pay attention that we are not waiting for the `registerClientSelect` and `createPriceStream` promises, because in our particular case we don't care when they will resolve, we just fire and forget, but that might not be the case in your application.

Both the method registration and the stream creation are async operations and rejections should be handled appropriately. For simplicity we just log them to the console, but in a production-level app this should be handled better.

We don't need to wrap the price stream push, because internally the `DataService` uses `setInterval`, which by default triggers the change detection.

### 3.3. Methods discovery

Going back to **Clients**, let's build the second part of the client selection logic. In this chapter we will define a method `sendSelectedClient` in `GlueService`. We will call this method from `app.component.ts` from the `handleClientClick` method. `sendSelectedClient` will first check to see if a method with the name `"SelectClient"` exists and if it does, in the next chapter we will invoke it. You code in `GlueService` should look like this:

```javascript
    public sendSelectedClient(client: Client): void {
        const foundMethod = this.glueStore.glue.interop.methods().find((method) => method.name === "SelectClient");
    }
``` 

In `app.component.ts` we just call the method:

```javascript
  public handleClientClick(client: Client): void {
    this.glueService.sendSelectedClient(client);
  }
```

### 3.4. Methods invocation

Finally we have arrived to the invocation moment. All we need to do is invoke `"SelectClient"` if it exists, if not we do nothing:

```javascript
    public async sendSelectedClient(client: Client): Promise<void> {
        const foundMethod = this.glueStore.glue.interop.methods().find((method) => method.name === "SelectClient");

        if (foundMethod) {
            await this.glueStore.glue.interop.invoke(foundMethod, { client });
        }
    }
```

**Note!** The method is now marked as `async`, because `glue.interop.invoke` returns a promise.

Nice work, we already transformed two pretty boring apps into a little bit more exciting Glue42 Core project.

## 4. Window Management

### 4.1. Overview

Currently if you open the **Stocks** app and click on a stock, you will be redirected to a different view within that app using the standard Angular routing. Our users, however, have dual screen setups and would love to make use of them. Our task right now is to change the current stock selection behavior so that when a user click on a stock, the app stays on the same route, but a new window with the selected stock details view opens up.

Once our users heard that we can make that happen, they also requested to have the new window opened with specific dimensions and position. To do all of that we will utilize the [**Window Management API**](../../reference/core/latest/windows/index.html).

### 4.2. Opening windows at runtime

Head over to `GlueService` inside **Stocks** and define a new method `openStockDetails`, which accepts a `stock` object. This will handle the runtime window creation. `glue.windows.open` at minimum requires a unique window name and an url. For name we will use the `stock.BPOD` and the URL should be hard-coded to `""http://localhost:4242/stocks/details/"`. Your service's method should look like this:

```javascript
    public async openStockDetails(stock: Stock): Promise<void> {
        await this.glueStore.glue.windows.open(`${stock.BPOD} Details`, "http://localhost:4242/stocks/details/");
    }
```

Now, let's call that from the `handleStockClick` method of `stocks.component.ts`. Here we need to check the glue status, because we want to open a new window only if glue is ready. In case that glue was not initialized or failed during initialization, we want to preserve the original behavior. Your method should look like this:

```javascript
  public handleStockClick(stock: Stock): void {
    if (this.glueService.glueStatus === "ready") {
      this.glueService.openStockDetails(stock).catch(console.error);
    } else {
      this.data.selectedStock = stock;
      this.router.navigate(['/details']);
    }
  }
```

Once again, we just dump errors to the console for simplicity.

Okay, we open a new window, but it has some default size and shows no data. This is to be expected, because the new stock details window has a different instance of the `DataService` and therefore the `selectedStock` is not set there. We will address all of this step by step.

### 4.3. Window Settings

First, let's pass some settings to the `open` call so that the window is a little bit bigger. Let's make it exactly 600 pixels in height and width:

```javascript
    public async openStockDetails(stock: Stock): Promise<void> {
        const openSettings: Glue42Web.Windows.CreateOptions = {
            width: 600,
            height: 600
        };

        await this.glueStore.glue.windows.open(`${stock.BPOD} Details`, "http://localhost:4242/stocks/details/", openSettings);
    }
```

Great, the new window now has an adequate size, let's solve the content problem next.

### 4.4. Window Context

As we can see, this new stock details window is a new instance of the **Stocks** Angular app and therefore the selected stocks state is not shared. We can easily fix that by passing a context object to the `glue.windows.open` call:

```javascript
    public async openStockDetails(stock: Stock): Promise<void> {
        const openSettings: Glue42Web.Windows.CreateOptions = {
            width: 600,
            height: 600
        };

        openSettings.context = stock;

        await this.glueStore.glue.windows.open(`${stock.BPOD} Details`, "http://localhost:4242/stocks/details/", openSettings);
    }
```

Next, the stock details window needs to get this context. Since this is actually a window of the **Stocks** Angular app, we will simply extend that `GlueService` with a `getMyContext` method, which will return the window's own context:

```javascript
    public async getMyContext() {
        return await this.glueStore.glue.windows.my().getContext();
    }
```

Finally, we go to `stock-details.component.ts` and extend the `this.stock` assignment to take either the selected stock in the data service (if set) or get it from the window context. However, keep in mind that we should first make sure glue was initialized correctly before trying to fetch the context:

```javascript
    public async ngOnInit(): Promise<void> {
        this.glueStatus = this.glueService.glueStatus;
        this.stock = this.dataService.selectedStock;

        if (this.glueStatus === "ready") {
            this.stock = await this.glueService.getMyContext();
        }
    }
```

Now, when we click on a stock, the new window has adequate size and displays the details of the stock we clicked on. However, if we take a closer look, we will see that the new window does not receive live price updates like the **Stocks** app. Let's solve this really quickly.

First in `GlueService` of the **Stocks** app we need to create a method which when called will subscribe to the `"LivePrices"` stream. Let's break down what this method should do:
- it will be called `subscribeToLivePrices` and will accept a stock - we need to know which is the selected stock
- it will find the stream using `glue.interop.methods()` and filtering
- if it is not found we will just return (although throwing an error might also be an option)
- we will subscribe to the stream
- in the `onData` method of the interop subscription we will find the new prices for the selected stock
- we will emit the new prices for the selected stock using the `onPriceUpdate` observable
- finally we will return the interop subscription

If you have done all of that, your `subscribeToLivePrices` method should look like this:

```javascript
    public async subscribeToLivePrices(stock: Stock): Promise<Glue42Web.Interop.Subscription> {

        const stream = this.glueStore.glue.interop.methods().find((method) => method.name === "LivePrices" && method.supportsStreaming);

        if (!stream) {
            return;
        }

        const subscription = await this.glueStore.glue.interop.subscribe(stream);

        subscription.onData((streamData) => {
            const newPrices = streamData.data.stocks;

            const selectedStockPrice = newPrices.find((prices) => prices.RIC === stock.RIC);

            this._zone.run(() => this.priceUpdateSource.next({
                Ask: Number(selectedStockPrice.Ask),
                Bid: Number(selectedStockPrice.Bid)
            }));

        });

        return subscription;
    }
```

Now, let's go back to the `stock-details.component.ts`. We need to check if glue is ready and only then subscribe to the `"LivePrices"` stream, also subscribe to the `onPriceUpdate` observable provided by the `GlueService` and handle the new prices. We should also define a `ngOnDestroy` where we close the subscription if it exists:

```javascript
    public async ngOnInit(): Promise<void> {
        this.glueStatus = this.glueService.glueStatus;
        this.stock = this.dataService.selectedStock;

        if (this.glueStatus === "ready") {
            this.stock = await this.glueService.getMyContext();
            this.glueSubscription = await this.glueService.subscribeToLivePrices(this.stock);    
        }

        this.glueService.onPriceUpdate().subscribe((newPrices) => {
            this.stock.Ask = newPrices.Ask;
            this.stock.Bid = newPrices.Bid;
        });
    }

    public ngOnDestroy(): void {
        if (this.glueSubscription) {
            this.glueSubscription.close();
        }
    }
```

## 5. Shared Contexts

So far we have meet all the requirements by our users using the [**Interop API**](../../reference/core/latest/interop/index.html) and the [**Window Management API**](../../reference/core/latest/windows/index.html). Our clients' final request is to be able to see in the `stock details` window if the selected client has the stock in their portfolio. So far `clients` and `stock details` have no interaction between each other, so let's change that.

We could use the same technique using an interop method, but we have a feeling that once the users start interacting with our app on a day-to-day basis, they will start requesting more and more integrations with other apps. So, let's solve the problem using the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html), which will give us more future-proofing. 

First we will head over to the **Clients** app and extend the `sendSelectedClient` inside `GlueService`. We will comment out the existing logic and will use the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html) to set a new context value for the name `"SelectedClient"`, like this:

```javascript
    public async sendSelectedClient(client: Client): Promise<void> {
        // const foundMethod = this.glueStore.glue.interop.methods().find((method) => method.name === "SelectClient");

        // if (foundMethod) {
        //     await this.glueStore.glue.interop.invoke(foundMethod, { client });
        // }

        await this.glueStore.glue.contexts.update('SelectedClient', client);
    }
```

Next we move over to **Clients** and define a method `subscribeToSharedContext` in `GlueService`, which subscribes to the shared context with name `"SelectedClient"` and emits the client to the `onClientSelected` observable just like we did with the interop method:

```javascript
    public async subscribeToSharedContext() {
        this.glueStore.glue.contexts.subscribe('SelectedClient', (client) => {
            this._zone.run(() => this.selectedClientSource.next(client));
        });
    }
```

Then we go over to `stocks.component.ts` and call this method alongside the other glue setup methods:

```javascript
  public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "ready") {
      // this.glueService.registerClientSelect().catch(console.log);
      this.glueService.createPriceStream().catch(console.log);
      this.glueService.subscribeToSharedContext().catch(console.log);

      this.glueService.onClientSelected()
        .subscribe((client) => {
          this.stocks = this.allStocks.filter((stock) => client.portfolio.includes(stock.RIC));
        });
    }

    this.allStocks = await this.data.getStocks();
    this.stocks = this.allStocks;

    this.data.onStockPrices()
      .subscribe((update) => {
        this.stocks.forEach((stock) => {
          const matchingStock = update.stocks.find((stockUpdate) => stockUpdate.RIC === stock.RIC);
          stock.Ask = matchingStock.Ask;
          stock.Bid = matchingStock.Bid;
        })
      });
  }
```

**Note!** We comment the call to `registerClientSelect`, because we want the app to receive "filter requests" only from the shared context. In your application, you could keep both and accept "filter requests" via an interop method and shared context.


Good, now **Clients** and **Stocks** communicate via Shared Contexts. Let's add the `stock details` logic by going to `stock-details.component.ts`. There we need to call the same `subscribeToSharedContext` function, subscribe to `onClientSelected` and when a new client is selected we need to check if that client has the current stock and set the `this.clientMessage` property to an appropriate value:

```javascript
    public async ngOnInit(): Promise<void> {
        this.glueStatus = this.glueService.glueStatus;
        this.stock = this.dataService.selectedStock;

        if (this.glueStatus === "ready") {
            this.stock = await this.glueService.getMyContext();
            this.glueSubscription = await this.glueService.subscribeToLivePrices(this.stock); 
            this.glueService.subscribeToSharedContext().catch(console.log);
        }

        this.glueService.onClientSelected()
            .subscribe((client) => {
                this.clientMessage = client.portfolio.includes(this.stock.RIC) ?
                    `${client.name} has this stock in the portfolio` :
                    `${client.name} does NOT have this stock in the portfolio`;
            });

        this.glueService.onPriceUpdate().subscribe((newPrices) => {
            this.stock.Ask = newPrices.Ask;
            this.stock.Bid = newPrices.Bid;
        });
    }
```

Awesome work! Now all three apps are connected and a single action in one of them can trigger changes in all.

## Congratulations

You have completed the Glue42 Core Angular tutorial! Now you have a good understanding of the core capabilities of the platform and are ready to delve deeper and build some awesome Angular applications!