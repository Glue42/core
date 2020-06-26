## Overview

This tutorial will show you how to use **Glue42 Core** features in your applications using the [`@glue42/react-hooks`](https://www.npmjs.com/package/@glue42/react-hooks) package. The applications used in the tutorial are Progressive Web Apps which work both in the browser and on the desktop (after installation). The tutorial includes two applications, **Clients** and **Stocks**, bootstrapped with [Create React App](https://github.com/facebook/create-react-app). The applications have 3 views (windows):

- **Clients** - displays a list of clients. Will be accessible at `http://localhost:4242/clients`;
- **Stocks** - displays a list of stocks. Will be accessible at `http://localhost:4242/stocks`;
- **Stock Details** - displays details for a stock after the user clicks on a stock in the **Stocks** app. Will be accessible at `http://localhost:4242/details`;

As an end result, the users want to be able to run two apps as Progressive Web Apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

[Glue42 Core](../../../core/what-is-glue42-core/index.html)

[Glue42 Web library](../../../reference/core/latest/glue42%20web/index.html).

JavaScript (ECMAScript 6 or later)

[React Framework](https://reactjs.org)

[React Hooks](https://reactjs.org/docs/hooks-intro.html)

[Create React App](https://reactjs.org/docs/create-a-new-react-app.html) (CRA)

## Tutorial Structure

The tutorial code is located in the **Glue42 Core** [**GitHub repo**](https://github.com/Glue42/core). There you will find a `/tutorials` directory with the following structure:

```cmd
/tutorials
    /angular
        /solution
        /start
    /guides
        /02_core
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

- `/guides` - contains the text files of the tutorials;
- `/javascript`, `/react` and `/angular` - contain the starting files for the tutorials and also a full solution for each of them;
- `/rest-server` - a simple server used in the tutorials to serve the necessary `JSON` data;

**Glue42 Core** is an open-source project, so all feedback and contributions, both to the code base and the tutorials, are welcome.

The tutorial consists of several parts, each one demonstrating different **Glue42 Core** capabilities. Each part depends on completing the previous ones.

## 1. Setup

Clone the **Glue42 Core** [**GitHub repo**](https://github.com/Glue42/core) to get the tutorial files.

### 1.1. Start Files

The React tutorial files are located in the `tutorials/react` directory. Go to the `/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:

- `Clients` - the **Clients** app bootstrapped with CRA;
- `Stocks` - the **Stocks** app bootstrapped with CRA;
- `index.html` - the project landing page;

The **Clients** and **Stocks** apps contain the following resources:

- `/public` - holds static assets for each application, including a `manifest.json`, `sw.js` (Service Worker), icons and an `index.html` file;
- `/src` - holds the main entry point - `index.js`, and the `Clients.jsx`/`Stocks.jsx` react component. Also, a `glue.js` file (methods for interaction with the Glue42 framework), CSS files and a `serviceWorker` file which only registers the Service Worker for the app;
- `.env` - environment variables for CRA;
- `config-overrides.js` - defines additional WebPack configuration to resolve `react` and `react-dom` modules from within the `node_modules` in the current directory;

Go to the directories of both apps (`start/Clients` and `start/Stocks`), open a command prompt and run:

```cmd
npm install

npm start
```

This will install all necessary dependencies and will run the **Clients** app on port 3000 and the **Stocks** app on port 3001. The pages will reload whenever you make edits. You will also see any lint errors in the console.

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#setup-rest_server) chapter). 

Install all dependencies in `react/solution/Clients` and `react/solution/Stocks` and start both apps by running the following commands: 

```cmd
npm install

npm start
```

Go to the `/react/solution` directory, open a command prompt and run the following commands to install the necessary dependencies and run the project (assuming the Glue42 CLI is installed globally):

```cmd
npm install

gluec serve
```

You can now access the **Clients** app at `localhost:4242/clients` and the **Stocks** app at `localhost:4242/stocks`.

### 1.3. REST Server

Before starting with the project, go to the `/tutorials/rest-server` directory and start the REST server that will host the necessary data for the applications:

```cmd
npm install

npm start
```

This will launch the server at port 8080.

### 1.4. Glue42 Environment

Now, you will use the [**Glue42 CLI**](../../../core/core-concepts/cli/index.html) to set up the [Glue42 Environment](../../../core/core-concepts/environment/overview/index.html) files. For that purpose, you need to install the Glue42 CLI and run the `init` command which will automatically set up your development environment. Go to the `/tutorials/react/start` directory, open a command prompt and run the following:

```cmd
npm install --global @glue42/cli-core

gluec init
```
Or you can also do it this way:

```cmd
npm install --save-dev @glue42/cli-core

npx gluec init
```

The `init` command installs the necessary dependencies and creates the necessary configuration files with default settings. 

Next, you have to configure the development server that comes with the Glue42 CLI. It will allow you to serve or proxy to your apps, define shared resources and serve the [**Glue42 Environment**](../../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) files correctly. To do that, open the `glue.config.dev.json` file that was created with the `init` command and add the locations and routes for the shared resources and the **Clients** and **Stocks** apps. Your configuration should look something like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/",
                "file": {
                    "path": "./"
                }
            },
            {
                "route": "/clients",
                "localhost": {
                  "port": 3000
                }
            },
            {
                "route": "/stocks",
                "localhost": {
                  "port": 3001
                }
            }
        ]
    },
    "logging": "dev"
}
```

*For more information on how to configure the Glue42 CLI development server, see the [Glue42 CLI: Configuration](../../../core/core-concepts/cli/index.html#configuration) section.*

Now, go to the root directory of each app and run:

```cmd
npm start
```

Next, open a command prompt in the project base directory and run:

```cmd
gluec serve
```

The `serve` command launches a development server at port 4242 which will serve all defined apps and resources together with the [**Glue42 Environment**](../../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) files.

Now, you can open the apps at `localhost:4242/clients` for the **Clients** app and at `localhost:4242/stocks` for the **Stocks** app or access them directly from the project landing page at `localhost:4242/`.

Landing page:

![Landing Page](../../../images/tutorials/core-react/landing-page.png)

Clients:

![Clients](../../../images/tutorials/core-react/clients.png)

Stocks:

![Stocks](../../../images/tutorials/core-react/stocks.png)

At the right side of the address bar you will see an install icon from which you can install the app on your desktop:

![Install](../../../images/tutorials/core-js/install.png)

Once installed, you can launch it from the shortcut created on your desktop or by going to `chrome://apps` (if you are using Google Chrome) and clicking its icon.

#### Serving from the File System

Additionally, there are use cases where you may want to serve the apps from the file system instead of using the WebPack development servers. This is thoroughly covered in the [Glue42 CLI](../../../core/core-concepts/cli/index.html#configuration), but you can see the quick steps to do that below:

- Go to the directories of the **Clients** and **Stocks** applications, open a command prompt and run:

```cmd
npm run build
```

- In the `glue.config.dev.json` config file (that was generated by the `gluec init` command) replace the `localhost` property with `file`:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/clients",
                // Replace `localhost` with `file` and specify the path to the app.
                "file": {
                    "path": "./Clients/build/"
                }
            },
            {
                "route": "/stocks",
                "file": {
                    "path": "./Stocks/build/"
                }
            }
        ]
    },
    "logging": "dev"
}
```

- Restart the Glue42 CLI by quitting it and running the `gluec serve` command again.

Note that if you go with this approach, you will have to rebuild the **Clients** and **Stocks** applications every time you make changes.

## 2. Initializing the Glue42 Web Library

Now, you need to initialize the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library in each of the components. 

First, install the Glue42 React Hooks libraries for both applications:

```cmd
npm install --save @glue42/react-hooks
```

Next, in the `index.js` files of both apps import the factory function from `@glue42/web` and pass it to the `GlueProvider`:

```javascript
import GlueWeb from "@glue42/web";
import { GlueProvider } from "@glue42/react-hooks";
```

Wrap the `App` component with the `GlueProvider` component so you can consume the `glue` object later:

```javascript
ReactDOM.render(
    <GlueProvider glueFactory={GlueWeb}>
        <App />
    </GlueProvider>,
    document.getElementById("root")
);
```

In all three components (`Client.jsx`, `Stocks.jsx`, `StockDetails.jsx`), import `GlueContext` and `useGlue` from the `@glue42/react-hooks` library and the `useContext` React hook so that you can get the `glue` object from the context inside the components:

```javascript
import { useContext } from "react";
import { GlueContext, useGlue } from "@glue42/react-hooks";
```

The following JSX code will allow the components to show whether the Glue42 framework is available or not. Add the code in all three components and place it in the `return` statement inside the `<div className="container-fluid">` element:

```javascript
return(
    <div className="container-fluid">
        <div className="row">
            <div className="col-md-2">
                {!glue && (
                <span id="glueSpan" className="badge badge-warning">
                    Glue42 is unavailable
                </span>
                )}
                {glue && (
                <span id="glueSpan" className="badge badge-success">
                    Glue42 is available
                </span>
                )}
            </div>
            <div className="col-md-8">
                <h1 className="text-center">Clients</h1>
            </div>
        </div>
        ...
    </div>
);
```

Initialize the Glue42  Web library in all three components:

```javascript
// Clients.jsx
function Clients() {
    const glue = useContext(GlueContext);
};

// Stocks.jsx
function Stocks() {
    const glue = useContext(GlueContext);
};

// StockDetails.jsx
function StockDetails() {
    const glue = useContext(GlueContext);
};
```

You should now be able to see a small green label at the top left corner of your apps with the text "Glue42 is available".

## 3. Interop

In this section you will use some of the functionalities provided by the **Glue42 Core** [**Interop API**](../../../reference/core/latest/interop/index.html).

### 3.1. Method Registration

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which the new stock prices will be pushed. The **Stocks** and **Stock Details** apps will subscribe to the stream to get notified when new prices have been generated.

Define a callback for registering an Interop method in the `glue.js` file of the **Stocks** app:

```javascript
import { SET_CLIENT_METHOD } from "./constants";

export const registerSetClientMethod = (setClient) => (glue) => {
    // Register an Interop method by providing a name and a handler.
    glue.interop.register(SET_CLIENT_METHOD, setClient);
};
```
Import the callback in the `Stocks.jsx` component and use the `useGlue()` hook  to register the Interop method by passing the `setClient()` method from the `useState()` hook. The `useGlue()` hook will internally invoke the callback and will pass the `glue` object as an argument.

```javascript
import { useState } from "react";
import { registerSetClientMethod } from "./glue";

function Stocks() {
    const [{ clientId, clientName }, setClient] = useState({});
    useGlue(registerSetClientMethod(setClient));
};
```

Modify the `fetchPortfolio()` function inside the existing `useEffect()` hook to fetch the selected client portfolio. Pass `clientId` as a `useEffect()` dependency, so that `fetchPortfolio()` will be called whenever a new client is selected and the component is re-rendered:

```javascript
useEffect(() => {
    const fetchPortfolio = async () => {
        try {
            const url = `http://localhost:8080${clientId ? `/api/portfolio/${clientId}` : "/api/portfolio"}`;
            const response = await fetch(url, REQUEST_OPTIONS);
            const portfolio = await response.json();
            setPortfolio(portfolio);
        } catch (error) {
            console.error(error);
        };
    };
    fetchPortfolio();
}, [clientId]);
```

Finally, add an element to show the client name and ID above the stocks table in the `return` statement of the `Stocks` component.

```javascript
{clientId && (
    <h2 className="p-3">
        Client {clientName} - {clientId}
    </h2>
)}
```

### 3.2. Method Discovery and Invocation

Now, you need to invoke the registered Interop method from the **Clients** app every time the user clicks a client row in the clients table. Again, you will use the `useGlue()` hook to compose a handler which will invoke the Interop method. Before calling the method, you will also check if the method is has been registered (i.e., whether the **Stock** app is running).

In the `glue.js` file of the **Clients** app define a callback that will invoke the Interop method:

```javascript
import { SET_CLIENT_METHOD } from "./constants";

export const setClientPortfolioInterop = (glue) => ({ clientId, clientName }) => {
    // Check whether the method exists.
    const isMethodRegistered = glue.interop
        .methods()
        .some(({ name }) => name === SET_CLIENT_METHOD.name);
    if (isMethodRegistered) {
        // Invoke an Interop method by name and provide arguments for the invocation.
        glue.interop.invoke(SET_CLIENT_METHOD.name, { clientId, clientName });
    };
};
```

Import the callback in the `Clients.jsx` component and pass it to the `useGlue()` hook to define an `onClick()` handler function that you will attach to every client table row:

```javascript
import { setClientPortfolioInterop } from "./glue";

function Clients() {
    const onClick = useGlue(setClientPortfolioInterop);
};
```

In the `return` statement, attach the `onClick()` handler to every client row:

```javascript
<tbody>
    {clients.map(({ name, pId, gId, accountManager, portfolio }) => (
        <tr
            key={pId}
            onClick={() => onClick({ clientId: gId, clientName: name })}
        >
            <td>{name}</td>
            <td>{pId}</td>
            <td>{gId}</td>
            <td>{accountManager}</td>
        </tr>
    ))}
</tbody>
```

Now when you click on a client in the **Clients** app, the **Stocks** app should display only the stocks that are in the portfolio of the selected client.

### 3.3. Creating Streams and Publishing Data

Now, you will create an Interop stream from the **Stocks** app to which new stock prices will be published at a set interval. The **Stocks** and the **Stock Details** apps will subscribe to that stream to show real time stock price updates. The prices will be generated by the predefined `publishInstrumentPrice()` function in the `glue.js` file of the **Stocks** app.

First, go to the `glue.js` file of the **Stocks** app and define a callback that will create the Interop stream. The `glue.interop.createStream()` method returns a `Stream` object which will be passed to the `publishInstrumentPrice()` handler:

```javascript
import { SET_PRICES_STREAM } from "./constants";

export const createInstrumentStream = (glue) => {
    const stream = await glue.interop.createStream(SET_PRICES_STREAM);
    publishInstrumentPrice(stream);
};
```

Next, you have to modify the `publishInstrumentPrice()` callback to use the `push()` method of the `Stream` object to push the generated prices to the stream:

```javascript
export const publishInstrumentPrice = (stream) => {
    setInterval(() => {
        const stocks = {
            ...
        };

        // Push the stock prices to the stream.
        stream.push(stocks);
    }, 1500);
};
```

Finally, go to the `Stocks.jsx` component and create the stream with the `useGlue()` hook:

```javascript
import { useGlue } from "@glue42/react-hooks";
import { createInstrumentStream } from "./glue";

function Stocks() {
    useGlue(createInstrumentStream);
};
```

### 3.4. Stream Subscription

To consume the data from the created Interop stream, you have to create stream subscriptions in the **Stocks** and the **Stock Details** apps.

Go to the `glue.js` file of the **Stocks** app to define a callback that will create a stream subscription. This callback will receive as parameters a `handler` function responsible for updating the stock prices in the component context, and a stock `symbol`, which may be an array of stocks or a single stock depending on whether the callback has been invoked by the **Stocks** or the **Stock Details** app:

```javascript
export const subscribeForInstrumentStream = (handler) => async (glue, symbol) => {
    if (symbol) {
        // Create a stream subscription.
        const subscription = await glue.interop.subscribe(SET_PRICES_STREAM);
        const handleUpdates = ({ data: stocks }) => {
            if (stocks[symbol]) {
                handler(stocks[symbol]);
            } else if (Array.isArray(symbol)) {
                handler(stocks);
            };
        };
        // Specify a handler for new data.
        subscription.onData(handleUpdates);
        // Specify a handler if the subscription fails.
        subscription.onFailed(console.log);

        return subscription;
    }
};
```

Go to the `Stocks.jsx` component and create a stream subscription. The stream used in the tutorial publishes all possible stock prices and it is not necessary to close and renew the subscription when a new client has been selected. However, in a real project scenario, you will have to do exactly that. That is why, this is reflected in the code below. You have to pass the `portfolio` as a dependency of the `useGlue()` hook to trigger a new subscription every time the `portfolio` has been updated:

```javascript
import { subscribeForInstrumentStream } from "./glue";

function Stocks() {
    ...
    // The prices will be updated when new data is received from the stream.
    const [prices, setPrices] = useState({});
    // Create a stream subscription that will be renewed every time the `portfolio` changes.
    const subscription = useGlue(
        (glue, portfolio) => {
            if (portfolio.length > 0) {
                return subscribeForInstrumentStream(setPrices)(glue, portfolio);
            }
        },
        [portfolio]
    );

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                // Close the existing subscription when a new client has been selected.
                subscription &&
                typeof subscription.close === "function" &&
                subscription.close();

                const url = `http://localhost:8080${clientId ? `/api/portfolio/${clientId}` : "/api/portfolio"}`;
                const response = await fetch(url, REQUEST_OPTIONS);
                const portfolio = await response.json();
                setPortfolio(portfolio);
            } catch (error) {
                console.error(error);
            };
        };
        fetchPortfolio();
    }, [clientId]);
    ...
};
```

Update the code for displaying the `Ask` and `Bid` prices by taking their values from `prices` variable that is updated when new data is received from the stream:

```javascript
return (
    ...
        <tbody>
            {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
                <tr
                    onClick={() => showStockDetails({ RIC, Description, Bid, Ask, ...rest })}
                    key={RIC}
                >
                    <td>{RIC}</td>
                    <td>{Description && Description.toUpperCase()}</td>
                    <td className="text-right">
                        {prices[RIC] ? prices[RIC].Bid : Bid}
                    </td>
                    <td className="text-right">
                        {prices[RIC] ? prices[RIC].Ask : Ask}
                    </td>
                </tr>
            ))}
        </tbody>
    ...
);
```

Now you should see the stock prices (last 2 columns) update at regular intervals.

Finally, create a stream subscription in the **Stock Details** app as well by passing the `setPrices` method as a handler for the new stream data and the `RIC` to target the stock for which to get the prices: 

```javascript
import { subscribeForInstrumentStream } from "./glue";

function StockDetails() {
    ...
    const [{ Bid, Ask }, setPrices] = useState({});
    
    useGlue(subscribeForInstrumentStream(setPrices), [RIC]);    
    ...
};
```

You can now observe that **Stock Details** also displays a new value for the `Bid` and `Ask` prices at regular intervals.

## 4. Window Management

Now, you will extend the **Stocks** and **Stock Details** apps with new functionalities using the [**Window Management API**](../../../reference/core/latest/windows/index.html). When the user clicks on a stock in the **Stocks** app, the **Stock Details** app will open in a new window with specific dimensions. Also, the selected stock will be passed from from the **Stocks** app to the **Stock Details** app using the window context.

### 4.1. Opening Windows at Runtime

First, go to the `glue.js` file of the **Stocks** app and define a function that will open the **Stock Details** app in a new window. Use the `glue.windows.open()` method and pass a name and a URL for the new window. The name must be unique.

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetailsReact${++windowId}`;
    const URL = `http://${window.location.host}/details`;

    // Opening a new window by providing a name and a URL.
    glue.windows.open(name, URL);
};
```

### 4.2. Window Settings

Next, pass an object with settings for the new window as a third parameter. Define the position (`top`, `left`) and the size (`width`, `height`) of the new window:

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetailsReact${++windowId}`;
    const URL = `http://${window.location.host}/details`;

    // Optional object with settings for the new window.
    const windowSettings = {
        top: 100,
        left: 100,
        width: 660,
        height: 660
    };

    glue.windows.open(name, URL, windowSettings);
};
```

### 4.3. Window Context

Every Glue42 Window has its own `context` property (its value can be any object) which can be defined when opening the window and can be updated later. You will pass the stock selected from the **Stocks** app as a window context for the new **Stock Details** window:

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetailsReact${++windowId}`;
    const URL = `http://${window.location.host}/details`;
    const windowSettings = {
        top: 100,
        left: 100,
        width: 660,
        height: 660,
        // Pass the `symbol` as a context for the new window.
        context: { symbol }
    };

    glue.windows.open(name, URL, windowSettings);
};
```

Next, you also have to define a function that will get the **Stock Details** app will use to get the context:

```javascript
export const getMyWindowContext = glue => glue.windows.my().context;
```

Now, go to the **Stocks** app and comment out or delete the existing handler for showing stock details. Consume the `openStockDetails()` function with the help of the `useGlue()` hook:

```javascript
import { openStockDetails } from "./glue";

function Stocks() {
    const onClick = useGlue(openStockDetails);
};
```

In the `return` statement, update the event handler for each instrument row in the stocks table by replacing the existing `onClick` property:

```javascript
<tbody>
    {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
        <tr onClick={() => onClick({ ...rest, RIC, Description })} key={RIC}>
            <td>{RIC}</td>
            <td>{Description}</td>
            <td className="text-right">{Bid}</td>
            <td className="text-right">{Ask}</td>
        </tr>
    ))}
</tbody>
```

Finally, go to the **Stock Details** app to get the window context. Comment out or remove the existing code for getting the stock from the `sessionStorage`. Define the `glue` object using the `GlueContext` and pass the `getMyWindowContext()` function to the `useGlue()` hook to get the window context:

```javascript
import { getMyWindowContext } from "./glue";

function StockDetails() {
    const glue = useContext(GlueContext);
    // Get the window context.
    const windowContext = useGlue(getMyWindowContext);
    // Extract the selected stock from the window context.
    const {
        symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues, Bid, Ask } = {}
    } = windowContext || {};
};
```

Now, when you click on a stock in the **Stocks** app, the **Stock Details** app will open in a new window displaying information about the selected stock.

## 5. Shared Contexts

This section will show you how to update context objects and subscribe for context updates using the [**Shared Contexts API**](../../../reference/core/latest/shared%20contexts/index.html). You will extend the **Clients** app to update a context with information about the selected client, instead of using the Interop API to invoke a method. The **Stocks** app, instead of registering an Interop method, will subscribe for updates to the same context object to display the relevant client portfolio. You will add a "Show All" button to the **Stocks** app that will clear the context value in order to show information about all stocks. The **Stock Details** app will also subscribe for updates to this context in order to show whether the selected client has the selected stock in their portfolio.

### 5.1. Updating a Context

First, go to the `glue.js` file of the **Clients** and **Stocks** apps and define a function for updating the shared context object:

```javascript
import { SHARED_CONTEXT_NAME } from "./constants";

export const setClientPortfolioSharedContext = (glue) => (
    {
        clientId = "",
        clientName = "",
        portfolio = ""
    }
) => {
    glue.contexts.update(SHARED_CONTEXT_NAME, {
        clientId,
        clientName,
        portfolio
    });
};
```

Go to the **Clients** app and replace the `setClientPortfolioInterop()` handler for selecting a client with the `setClientPortfolioSharedContext()` one:

```javascript
import { setClientPortfolioSharedContext } from "./glue";

function Clients() {
    const onClick = useGlue(setClientPortfolioSharedContext);
};
```

Go to the **Stocks** app and define a handler for updating the shared context with the `useGlue()` hook. Also, add a "Show All" button in the `return` statement of the component that will invoke the handler on button click:

```javascript
import { setClientPortfolioSharedContext } from "./glue";

function Stocks() {
    ...
    const updateClientContext = useGlue(setClientPortfolioSharedContext);
    ...
    return (
        <div className="container-fluid">
        ...
            <button
                type="button"
                className="mb-3 btn btn-primary"
                onClick={() => updateClientContext({})}
            >
                Show All
            </button>
        ...
        </div>
    );
};
```

### 5.2. Subscribing for Context Updates

You have to subscribe the **Stocks** and **Stock Details** apps for updates to the same context object in order to update them accordingly when the user selects a new client.

First, go to the `glue.js` file of the **Stocks** app and define a function for subscribing to the context. Use the `glue.contexts.subscribe()` method:

```javascript
export const subscribeForSharedContext = (handler) => (glue) => {
    // Subscribing for the shared context by 
    // providing a context name and a handler for context updates.
    glue.contexts.subscribe(SHARED_CONTEXT_NAME, handler);
};
```

Go to the `Stocks.jsx` component and replace the `registerSetClientMethod()` handler with the `subscribeForSharedContext()` one:

```javascript
import { subscribeForSharedContext } from "./glue";

function Stocks() {
    ...
    useGlue(subscribeForSharedContext(setClient));
    ...
};
```

Finally, go to the `StockDetails.jsx` component and also subscribe for updates to the shared context. Add an element in the `return` statement that will display conditionally depending on whether the client has the selected stock in their portfolio. You will need to add the client information (`clientId`, `clientName`, `portfolio`) to the component state to be able to display data about the currently selected client and use the `portfolio` to determine whether the client has the selected stock in their portfolio. 

```javascript
import { subscribeForSharedContext } from "./glue";

function StockDetails() {
    ...
    const [{ clientId, clientName, portfolio }, setClient] = useState({});
    ...
    useGlue(subscribeForSharedContext(setClient));

    return (
        <div className="container-fluid">
        ...
            <div className="row">
                {clientId && (
                <>
                    <h2 className="p-3">
                    Client {clientName} - {clientId}{" "}
                    </h2>
                    {RIC && portfolio.length && !portfolio.includes(RIC) && (
                        <h4 className="p-3">
                            The client does not have this stock in their portfolio.
                        </h4>
                    )}
                </>
                )}
            ...
            </div>
        ...
        </div>
    );
};
```

## 6. Channels

Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here, you will use the [Channels API](../../../reference/core/latest/channels/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a selected channel. The different channels are color coded and the user will be able to select a channel from a Channel Selector UI. The **Clients** app will update the context of the currently selected channel when the user clicks on a client.

### 6.1. Channels Configuration

First, you need to add channel definitions to the [Glue42 Environment](../../../core/core-concepts/environment/overview/index.html). Add the following configuration to the `glue.config.json` file located at the base directory of your project. After that, restart the Glue42 CLI by quitting it and running the `gluec serve` command again for the changes to take effect:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": [
        {
            "name": "Red",
            "meta": {
                "color": "red"
            }
        },
        {
            "name": "Green",
            "meta": {
                "color": "green"
            }
        },
        {
            "name": "Blue",
            "meta": {
                "color": "#66ABFF"
            }
        },
        {
            "name": "Pink",
            "meta": {
                "color": "#F328BB"
            }
        },
        {
            "name": "Yellow",
            "meta": {
                "color": "#FFE733"
            }
        },
        {
            "name": "Dark Yellow",
            "meta": {
                "color": "#b09b00"
            }
        },
        {
            "name": "Orange",
            "meta": {
                "color": "#fa5a28"
            }
        },
        {
            "name": "Purple",
            "meta": {
                "color": "#c873ff"
            }
        },
        {
            "name": "Lime",
            "meta": {
                "color": "#8af59e"
            }
        },
        {
            "name": "Cyan",
            "meta": {
                "color": "#80f3ff"
            }
        }
    ]
}
```

To enable the Channels API, you need to pass a configuration object to the `GlueProvider` component:

```javascript
// Enabling the Channels API.
<GlueProvider config={{ channels: true }} glueFactory={GlueWeb}>
    ...
</GlueProvider>
```

The `GlueProvider` will initialize internally the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library and enable the Channels API.

### 6.2. Channel Selector Widget

The users have to be able to navigate through the channels for which they will need some sort of user interface. You can create your own channel selector widget by using the Channels API, but for the purpose of the tutorial there is a `ChannelSelectorWidget` component provided. To add it to the **Stocks** and **Clients** apps, follow these steps:

1.Import the Channel Selector widget in the `Clients.jsx` and `Stocks.jsx` components:

```javascript
import ChannelSelectorWidget from "./ChannelSelectorWidget";
```

2. To use the use the new component, you have to pass two props to it:
- `channelNamesAndColors` - the names and colors of all available channels; 
- `onChannelSelected` - handler that will be called when the channel changes; 

Go to the `glue.js` file of the **Clients** and **Stocks** apps and define the following functions:

```javascript
// This will be used to signify that the app is not connected to any channel.
import { NO_CHANNEL_VALUE } from "./constants";

// Returns all names and color codes of the avaialbale channels.
export const getChannelNamesAndColors = async (glue) => {
    // Getting a list of all channel contexts.
    const channelContexts = await glue.channels.list();

    // Extracting only the names and colors of the channels.
    const channelNamesAndColors = channelContexts.map((channelContext) => {
        const channelInfo = {
            name: channelContext.name,
            color: channelContext.meta.color
        };

        return channelInfo;
    });

    return channelNamesAndColors;
};

// This function will join a given channel.
export const joinChannel = (glue) => ({ value: channelName }) => {
    if (channelName === NO_CHANNEL_VALUE) {
        // Checking for the current channel.
        if (glue.channels.my()) {
            // Leaving a channel.
            glue.channels.leave();
        }
    } else {
        // Joining a channel.
        glue.channels.join(channelName);
    };
};
```

3. Now you need to setup the `ChannelSelectorWidget` in both apps. 

Go to the **Clients** app to set up the channels functionalities.

```javascript
import {
    getChannelNamesAndColors,
    joinChannel
} from "./glue";

function Clients() {
    ...
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    const onChannelSelected = useGlue(joinChannel);
    ...
};
```

You can now create the `ChannelWidgetSelector` component in the `return` statement. Pass the `channelNamesAndColors` and `onChannelSelected` as props to it:

```javascript
return (
    <div className="container-fluid">
        <div className="row">
            ...
            <div className="col-md-10">
                <h1 className="text-center">Clients</h1>
            </div>
            <div className="col-md-2 align-self-center">
                <ChannelSelectorWidget
                    channelNamesAndColors={channelNamesAndColors}
                    onChannelSelected={onChannelSelected}
                />
            </div>
            ...
        </div>
        ...
    </div>
);
```

4. Go to the **Stocks** app to set up the channels functionalities.

```javascript
import {
    getChannelNamesAndColors,
    joinChannel
} from "./glue";

function Stocks() {
    ...
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    const onChannelSelected = useGlue(joinChannel);
    ...
};
```

You can now create the `ChannelWidgetSelector` component in the `return` statement. Pass the `channelNamesAndColors` and `onChannelSelected` as props to it: 

```javascript
return (
    <div className="container-fluid">
        <div className="row">
            ...
            <div className="col-md-10">
                <h1 className="text-center">Clients</h1>
            </div>
            <div className="col-md-2 align-self-center">
                <ChannelSelectorWidget
                    channelNamesAndColors={channelNamesAndColors}
                    onChannelSelected={onChannelSelected}
                />
            </div>
            ...
        </div>
        ...
    </div>
);
```

Finally, add a `key` prop to the `ChannelSelectorWidget` component. It will hold the value of the `channelWidgetState` state variable which will be used to clear the state of the `ChannelSelectorWidget` when the user clicks the "Show All" button to clear the currently selected client. Update the code of the `onClick` handler in the button:

```javascript
function Stocks() {
    ...
    const [channelWidgetState, setChannelWidgetState] = useState(false);
    ...

    return (
        ...
        <button
            type="button"
            className="mb-3 btn btn-primary"
            onClick={() => {
                setChannelWidgetState(!channelWidgetState);
                setClient({ clientId: "", clientName: "" });
            }}
        >
            Show All
        </button>
        ...
    );
};
```

### 6.3. Publishing and Subscribing

Next, you need to enable the **Clients** app to publish updates to the current channel context and the **Stocks** app to subscribe for these updates.

Go to the `glue.js` file of the **Clients** app and define a function that will publish updates to the current channel: 

```javascript
export const setClientPortfolioChannels = (glue) => (
    {
        clientId = "",
        clientName = ""
    }
) => {
    // Checking for the current channel.
    if (glue.channels.my()) {
        // Publishing data to the channel.
        glue.channels.publish({ clientId, clientName });
    };
};
```

Go the `Clients.jsx` component to use this function to update the current channel.

*Note: Do not comment out `setClientPortfolioSharedContext()` code. The **Stock Details** app still uses the shared context to get the client information. Just rename the variable holding the click handler from `onClick` to `onClickContext` and use both handlers.*

```javascript
import { setClientPortfolioChannels } from "./glue";

function Clients() {
    ...
    // This is renamed from `onClick` to `onClickContext`.
    const onClickContext = useGlue(setClientPortfolioSharedContext);
    const onClick = useGlue(setClientPortfolioChannels);
    ...

    return (
        ...
        <tr
            key={pId}
            onClick={() => {
                    // Use both handlers.
                    onClickContext({ clientId: gId, clientName: name, portfolio })
                    onClick({ clientId: gId, clientName: name })
                }
            }
        >
        ...
    );
};
```

Next, go to the `glue.js` file of the **Stocks** app and define a function that will subscribe for channel updates:

```javascript
export const subscribeForChannels = (handler) => (glue) => {
    // Subscribing for updates to the current channel.
    glue.channels.subscribe(handler);
};
```

Go to the `Stocks.jsx` component and comment out or delete the code that uses the Shared Contexts API to listen for updates to the shared context. Instead, subscribe for channel updates:

```javascript
import { subscribeForChannels } from "./glue";

function Stocks() {
    ...
    useGlue(subscribeForChannels(setClient));
    ...
};
```

Now, you can open multiple instances of the **Stocks** app and keep them on different colored channels. The **Clients** app will update only the context of the channel it is currently on and only the instance of the **Stocks** app that is on the same channel will update accordingly.

## Congratulations

You have successfully completed the **Glue42 Core** React tutorial! See also the [JavaScript](../javascript/index.html) and [Angular](../angular/index.html) tutorials for **Glue42 Core**.