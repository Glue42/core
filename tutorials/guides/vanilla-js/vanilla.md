## Introduction

This tutorial is designed to walk you through every aspect of Glue42 Core. Starting from a project setup with the [**Glue42 Core CLI**](../../glue42-core/what-is-glue42-core/core-concepts/cli/index.html), initiating [**Glue42 Clients**](../../glue42-core/what-is-glue42-core/core-concepts/glue42-client/index.html), extending the applications with Interop capabilities, window management functionality and shared contexts integration.

The following guide is going to use Vanilla JS and keep everything as simple as possible. The goal here is not to make perfect production-ready applications, but to get a feel for Glue42 Core and how you can use the platform to make awesome applications.

We also have a React tutorial, but we recommend going through this one first in order to learn Glue42 Core without the distractions of additional libraries and frameworks.

So what are we building? We are part of the IT department of a big multi-national bank and we have been tasked to create an application, which will be used by the bank's asset management department. This will be a multi-app project consisting of two applications:
- **clients** - displays a full list of clients and their details
- **stocks** - displays a full list of stocks with prices and when a stock is clicked the user should see that stock's details

Those two applications must be hosted on the same domain where
- /clients resolves to clients
- /stocks resolves to stocks

As an end result our users want to be able to run two apps as Progressive Web Apps in separate windows, in order to take advantage of their multi-monitor setups. Also, our users want those apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected, the stocks app should show only that client's stocks and more, which you will learn along the way.

## Prerequisites

Before we continue there are few things that you need to be comfortable with
- Basic JavaScript
- JS array methods
- Asynchronous programming with Promises

It is also a good idea to keep our [**Glue42 Core CLI**](../../glue42-core/what-is-glue42-core/core-concepts/cli/index.html), [**Glue42 Client**](../../glue42-core/what-is-glue42-core/core-concepts/glue42-client/index.html) and [**Glue42 Web Reference API**](../../reference/core/latest/glue42%20web/index.html) sections close by for reference.

## Tutorial Structure

The tutorial code is located in our [**github repo**](https://github.com/Glue42/core). Inside the repo you wil find a directory `/tutorials` with the following structure:

```text
/tutorials
  /guides
    /vanilla-js
    /react
  /rest-server
  /vanilla-js
    /solution
    /start
  /react
    /solution
    /start
```

The `/guides` directory holds the `.md` files used to display this text information that you are reading now.
The `/vanilla-js` and `/react` directories hold the **start** files for each respective tutorial. This is your starting point. There is also **solution** directories, in case you would like to see our approach to the problems ahead.
The `/rest-server` is a simple server which we use in the tutorials to serve us the `json` data that we need.

As you know Glue42 Core is an open-source project, so we welcome all feedback and contributions both to our code base and tutorials.

## 1. Setting Up

Okay, enough with the introduction, let's get started with the fun part.

### 1.1. Getting Started with the Tutorial Files

First you need to get the tutorial code and get your self familiar with it. Clone our github repo at `https://github.com/Glue42/core` and navigate to `/tutorials/rest-server`. This server is going to serve the data for our applications. All you need to do is:

```javascript
npm i
npm start
```

This will launch the server at port **8080** and that's it, we will not be touching it any more.

Next head over to `/tutorials/vanilla-js/start`. There are the start files for your project. You can either work directly here, or you can copy-paste the directory somewhere else, it is up to you. For simplicity, we will assume that we will be working in the start directory.

Let's go through the resources we have there:
- `/assets` - holds shared assets for both applications like icons and `.css`.
- `lib` - hold common libraries used by both applications. Actually there you will find only one library - the built Glue42 Web script.
- `/clients` - this is our clients app, which consists of only an `index.html`, one script file and one `manifest.json`.
- `/stocks` - this is our stocks app, it has the same elements as `clients`, with the addition of `/stocks/details`, which holds the `.html` and `.js` file for the stock details view.
- `favicon.ico` - this is a standard favicon.
- `package.json` - currently has one dependency - a simple http server to serve our start files.
- `service-worker.js` - used by both applications in conjunction with the manifests in order to classify as **installable** PWA, but doesn't contain any meaningful logic.

Now, let launch the apps and see what we have. To do that:

```javascript
npm i
npm start
```

This will launch a simple http-serve which will host the entire `/start` directory at port **:4000**.

Open the browser at `localhost:4000/clients` and check out the app. It is pretty straight forward - just a list of clients, fetched from the **rest server** we started before. Clicking on a client does nothing right now. But more importantly, if you look at the right side of the address bar, you will see an `instal` icon, allowing you to install the app. You can do that and then you can access it by going to `chrome://apps` (if you use Google Chrome) and clicking on the icon.

Repeat this process with `localhost:4000/stocks`. Again, this is straight forward, nothing special, just a list of stocks. Once again we have the `install` icon, go ahead and install the app, just like the `clients`. The only difference here is that when you click on a stock, you are redirected to the stock details view of the app.

Great! So far we have gotten ourselves acquainted with the start files, we launched all the apps and installed them as PWAs. Next, we are going to set up our Glue42 Core Environment using the CLI. 

### 1.2. Getting Started with the Glue42 Core CLI

Now we are going to use the [**Glue42 Core CLI**](../../glue42-core/what-is-glue42-core/core-concepts/cli/index.html) to initiate our environment. For that you will need to install the Glue42 Core CLI first and then call the `init` command, which will set up your dev environment.

```javascript
npm install --global @glue42/cli-core
gluec init
```

This command will get the necessary dependencies and scaffold the necessary config files for us. Next, we are going to stop using the simple http server that comes with the start files and utilize the CLI's serve functionality. This is very useful, as it allows us to serve or proxy to our apps, define shared resources and serve the [**Glue42 Core Environment**](../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) correctly.

To do all of that open the `glue.config.dev.json` file. Then add the shared resources, the clients and stocks apps. You can check out how to do that in the Getting Started **TODO: Link** section. Your file should look something like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/clients",
                "file": {
                    "path": "./clients/"
                }
            },
            {
                "route": "/stocks",
                "file": {
                    "path": "./stocks/"
                }
            }
        ],
        "sharedAssets": [
            {
                "route": "/assets",
                "path": "./assets/"
            },
            {
                "route": "/lib",
                "path": "./lib/"
            },
            {
                "route": "/favicon.ico",
                "path": "./favicon.ico"
            },
            {
                "route": "/service-worker.js",
                "path": "./service-worker.js"
            }
        ]
    },
    "logging": "default"
}
```

Next we open a terminal and:

```javascript
gluec serve
```

This command will launch a dev server at port **:4242** and will serve everything we defined, together with the [**Glue42 Core Environment**](../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html).

Now you can once again open your apps, but this time at `localhost:4242` and see that nothing really changed, at least that's how it seems. Do **note** that you will need to install the apps again and preferably remove the old onces, because the old once will route to port **:4000**.

So far, so good, we have a Glue42 Core project up and running, now let's transform our two apps into [**Glue42 Clients**](../../glue42-core/what-is-glue42-core/core-concepts/glue42-client/index.html), by initializing the Glue42 Web library in each of them.

### 1.3. Getting Started with the Solution files

Before we start coding, let's take a moment to talk about running the **solution**. You are free to use it as you like - you can check after each section to see what we have done to solve the problem, or you can use it as an example in case you get stuck somewhere.

First, launch the `/rest-server` (if you have stopped it), then go to the `/vanilla-js/solution` directory, open a terminal, install the node dependencies and launch your project with the CLI:

```javascript
npm i
gluec serve
```

The fully completed project is available at `localhost:4242`.

## 2. Initializing Glue Web

Go over to each one of the three `.html` pages - clients, stocks and details and include a new `<script>` which references the Glue42 Web script in the lib directory:

```html
<script src="/lib/web.umd.min.js"></script>
```

Next go to each one of the scripts at:
- `/clients/index.js`
- `/stocks/index.js`
- `/stocks/details/details.js`

Look for the **TODO: Chapter 2** comment. There you should initialize [**Glue42 Web**](../../reference/core/latest/glue42%20web/index.html), without any configs. Once the factory function resolves, uncomment the `toggleGlueAvailable` function from `/clients/index.js` and `/stocks/index.js` and call it.

```javascript
window.glue = await GlueWeb();
toggleGlueAvailable()
```

Let's just assign the `glue` object to the global `window` object for easy use. Now when you restart the dev server and refresh the browser pages, you should see in the top left corners of the **stocks** and **clients** apps text indicating that Glue is available. This means that you can successfully connected to the [**Glue42 Core Environment**](../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html).

Good job, we have everything we need to start adding more functionality.

## 3. Interop

### 3.1. Overview

In this section we will take a look at some functionality provided by our [**Interop API**](../../reference/core/latest/interop/index.html).

### 3.2. Methods and Streams registration

When a user clicks on a client, we would like the **stocks** app to show only stocks owned by this client. We will achieve that by `stocks` registering an interop method, which when invoked will receive the selected client's portfolio and re-render the table with the stocks. We also want the **stocks** app to create a stream and every time new prices are generated, we wil push to that stream, so that all subscribers can be notified.

Head over to `/stocks/index.js`.  Right below where you invoked `toggleGlueAvailable`, we will register a method called `SelectClient`. This method will expect as an argument an object with property `client`, with property `portfolio`. Next we need to filter all the stocks and pass only the correct ones to the function `setupStocks`, which will re-build our stocks table. After that we will create a stream called `LivePrices`, which once created we will assign to the global `window` object for easy access. Finally we will go over to the `newPricesHandler` function which is invoked every time new prices are generated and push the `priceUpdate` object to the stream. When you are done, you code should look something like this:

```javascript

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
    if (window.priceStream) {
        window.priceStream.push(priceUpdate);
    }
};

// previous code in start()
generateStockPrices(newPricesHandler);

window.glue = await Glue();

toggleGlueAvailable();

window.glue.interop.register('SelectClient', (args) => {
    const clientPortfolio = args.client.portfolio;
    const stockToShow = stocks.filter((stock) => clientPortfolio.includes(stock.RIC));
    setupStocks(stockToShow);
});

window.priceStream = await glue.interop.createStream('LivePrices');
```

Right now we can see anything different in the browser, but have done a lot. Next we will find and use the method from the `clients` app.

### 3.2. Methods discovery

Now, let's go over to `/clients/index.js` and extend our client click functionality. Locate the `clientClickedHandler` function, which is invoked every time a client is clicked and extend it's logic to find if there is a registered method by the name `SelectClient`. We will use `glue.interop.methods()` to check if we have a match. Your code should look something like this:

```javascript
// clientClickedHandler
const selectClientStocks = window.glue.interop.methods().find((method) => method.name === 'SelectClient');
```

### 3.3. Methods invocation

Let's finish this client select functionality by invoking the method we found, if we found it. Remember that the **Clients** and **Stocks** apps are designed to be launched an used on their own, so if there is no stocks app open, there will be no method to invoke.

```javascript
const clientClickedHandler = (client) => {
  const selectClientStocks = window.glue.interop.methods().find((method) => method.name === 'SelectClient');

  if (selectClientStocks) {
      window.glue.interop.invoke(selectClientStocks, { client });
  }
};
```

Awesome work! Now, let's see how we can extend the client details functionality.

## 4. Window Management

### 4.1. Overview

Currently when you click on a stock, you are redirected to a new view. This works fine, but our users use multiple monitors and want to take advantage of that. To do that, they wish that on stock click we do **not** redirect, but open a new window with the stock details. They also want to have the new window opened with specific dimensions and position. To do all of that we will utilize the [**Window Management API**](../../reference/core/latest/windows/index.html).

### 4.2. Opening windows at runtime

Head over to the **Stocks** app and locate the `stockClickedHandler` function. It handles the stock click logic, which currently just rewrites the `window.location.href`. Let's remove that and use `glue.windows.open` to open a new window with the same URL. You code should look like this:

```javascript
const stockClickedHandler = (stock) => {
    window.glue.windows.open(`${stock.BPOD} Details`, 'http://localhost:4242/stocks/details/').catch(console.error);
    sessionStorage.setItem('stock', JSON.stringify(stock));
};
```

Now, when we click on a stock, we stay on the same page and open a stock details window. However, it seems like the stocks details data is done, because everything is `undefined`. This is expected, because we are currently using `sessionStorage` to save the selected stock. Later will fix that and use Glue42 Core to send the data for us.

### 4.3. Window Settings

Before we fix the stocks data transfer, let's extend our `windows.open` logic so that the new window has exactly 550 pixels width and height and it's top/left coordinates are 100/100. We can easily do that by passing a config object to `windows.open`. Here is how that looks like:

```javascript
const stockClickedHandler = (stock) => {
    const openConfig = {
        left: 100,
        top: 100,
        width: 550,
        height: 550
    };
    window.glue.windows.open(`${stock.BPOD} Details`, 'http://localhost:4242/stocks/details/').catch(console.error);
    sessionStorage.setItem('stock', JSON.stringify(stock));
};
```

### 4.4. Window Context

Let's wrap this requirement up by passing our selected stock to the stock details window. Once again, this is very easy and all we need to do is pass a context object to `window.open`. This context object is just a normal JS object. The final version of our `stockClickedHandler` should look like this:

```javascript
const stockClickedHandler = (stock) => {
    const openConfig = {
        left: 100,
        top: 100,
        width: 400,
        height: 400,
        context: stock
    };

    window.glue.windows.open(`${stock.BPOD} Details`, 'http://localhost:4242/stocks/details/', openConfig).catch(console.error);
};
```

Next, we need to update our `/stocks/details` to correctly get the stock object. To do that we need to be the context of our window and pass it to the `setFields` function, which renders the page:

```javascript
const start = async () => {

    window.glue = await Glue();

    const stock = window.glue.windows.my().context;

    setFields(stock);
};
```

Now, that looks much better. Let's wrap this section up, by subscribing to our price stream we created previously, so that both our `/stocks` and `/stocks/details` can display live price data. Right below `setFields` in `/stocks/details` use the [**Interop API**](../../reference/core/latest/interop/index.html) to subscribe to stream `LivePrices`. When the subscription resolves, set the `onData` callback to receive the stream data, find the correct price of our selected stock and pass the **Ask** and **Bid** prices to the `updateStockPrices` function. The end result, should look like this:

```javascript
setFields(stock);

const subscription = await window.glue.interop.subscribe('LivePrices');
subscription.onData((streamData) => {
    const newPrices = streamData.data.stocks;
    const selectedStockPrice = newPrices.find((prices) => prices.RIC === stock.RIC);
    updateStockPrices(selectedStockPrice.Bid, selectedStockPrice.Ask);
});
```

If you have made it so far without checking out the solution, then awesome work! Let's continue to the last section where we will link all windows `clients`, `stocks` and `stock details` together.

## 5. Shared Contexts

Our clients love the project so far. They going wild taking full advantage of their multiple monitors thanks to our work with the [**Interop API**](../../reference/core/latest/interop/index.html) and the [**Window Management API**](../../reference/core/latest/windows/index.html). The users' final request is to be able to see in the `stock details` window if the selected client has the stock in their portfolio. So far `clients` and `stock details` had no interaction between each other, so let's change that. 

We could do the same like we did in `stocks` and register a method, but we have a feeling that once the clients start using our app, they will require more integrations with more apps. So, let's complete their request by also allowing us to easily hook more apps to this logic in the future, using the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html).

We begin by going back to the `clients` script file and inside the `clientClickedHandler` function. We will comment the current code and will use the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html) to update the shared context with the selected client. This will allow other applications to simple subscribe to changes to the shared context and get notified on client select.

```javascript
const clientClickedHandler = (client) => {
    // const selectClientStocks = window.glue.interop.methods().find((method) => method.name === 'SelectClient');

    // if (selectClientStocks) {
    //     window.glue.interop.invoke(selectClientStocks, { client });
    // }

    window.glue.contexts.update('SelectedClient', client).catch(console.error);
};
```

Now, let's head over to `stocks` script file and edit the `start` function. We want to subscribe to changes of the shared context with key `SelectedClient`, once there is a change, our callback will be invoked and a client object will be passed.

```javascript
// start func

window.glue.contexts.subscribe('SelectedClient', (client) => {
        const clientPortfolio = client.portfolio;
        const stockToShow = stocks.filter((stock) => clientPortfolio.includes(stock.RIC));
        setupStocks(stockToShow);
});

window.priceStream = await glue.interop.createStream('LivePrices');
```

There are a couple of things to mention here. As you will quickly see, we don't have any logic to remove a selected client from the shared context. This is something that we should definitely do before deploying to production and you have all the skills now to do it. You could add a button somewhere to deselect the client or anything else you desire. Also, if you notice, the `stocks` app listens for a selected client on both the method registered in the beginning and the shared contexts. This could be a desired functionality or maybe an overkill, again it is up to you.

One last thing we need to do, before we ship a beta version to our users is to make sure the `stock details` also subscribes to the shared context and displays whether or not the selected client has the displayed stock. Once we get the selected client from the shared context, we pass it to the `updateClientStatus` together with the stock object we have from before. Also, go over to `/stocks/details/index.html` and uncomment the section marked with **TODO: Chapter 5**.

```javascript
window.glue.contexts.subscribe('SelectedClient', (client) => {
    updateClientStatus(client, stock);
});
```

## Congratulations

You have completed the Glue42 Core Vanilla JS tutorial, awesome work! If you are a React developer, we recommend checkout our React tutorial. In the meantime go out there and make some awesome apps!