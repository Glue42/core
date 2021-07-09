## Overview

This tutorial will show you how to use [**Glue42 Core**](https://glue42.com/core/) features in your applications using the [`@glue42/react-hooks`](https://www.npmjs.com/package/@glue42/react-hooks) package. The applications used in the tutorial are Progressive Web Apps which work both in the browser and on the desktop (after installation). The tutorial includes three applications, **Clients**, **Stocks** and **Stock Details**, bootstrapped with [Create React App](https://github.com/facebook/create-react-app):

- **Clients** - displays a list of clients. Will be accessible at `http://localhost:3000/`;
- **Stocks** - displays a list of stocks. Will be accessible at `http://localhost:3001/`;
- **Stock Details** - displays details for a stock after the user clicks on a stock in the **Stocks** app. Will be accessible at `http://localhost:3002/`;

As an end result, the users want to be able to run two apps as Progressive Web Apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

[Glue42 Core](../../getting-started/what-is-glue42-core/index.html)

[Glue42 Web library](../../reference/core/latest/glue42%20web/index.html).

JavaScript (ECMAScript 6 or later)

[React Framework](https://reactjs.org)

[React Hooks](https://reactjs.org/docs/hooks-intro.html)

[Create React App](https://reactjs.org/docs/create-a-new-react-app.html) (CRA)

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

- `/guides` - contains the text files of the tutorials;
- `/javascript`, `/react` and `/angular` - contain the starting files for the tutorials and also a full solution for each of them;
- `/rest-server` - a simple server used in the tutorials to serve the necessary JSON data;

[**Glue42 Core**](https://glue42.com/core/) is an open-source project, so all feedback and contributions, both to the code base and the tutorials, are welcome.

The tutorial consists of several parts, each one demonstrating different [**Glue42 Core**](https://glue42.com/core/) capabilities. Each part depends on completing the previous ones.

## 1. Initial Setup

Clone the [**Glue42 Core**](https://glue42.com/core/) [GitHub repo](https://github.com/Glue42/core) to get the tutorial files.

### 1.1. Start Files

The React tutorial files are located in the `/tutorials/react` directory. Go to the `/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:

- `clients` - the **Clients** app bootstrapped with CRA;
- `stocks` - the **Stocks** app bootstrapped with CRA;
- `stock-details` - the **Stock Details** app bootstrapped with CRA;
- `workspace` - a Workspaces App for hosting Glue42 [Workspaces](../../capabilities/windows/workspaces/overview/index.html);

The three apps of your [**Glue42 Core**](https://glue42.com/core/) project contain the following resources:

- `/public` - holds static assets for each application, including a `manifest.json`, `sw.js` (Service Worker), icons and an `index.html` file;
- `/src` - holds the main entry point - `index.js`, and the `Clients.jsx`/`Stocks.jsx` react component. Also, a `glue.js` file (methods for interaction with the Glue42 framework), CSS files and a `serviceWorker` file which only registers the Service Worker for the app;
- `.env` - environment variables for CRA;
- `config-overrides.js` - defines additional WebPack configuration to resolve `react` and `react-dom` modules from within the `node_modules` in the current directory;

Go to the directories of all apps (including the Workspaces App), open a command prompt and run:

```cmd
npm install

npm start
```

This will install all necessary dependencies and will run the **Clients** app on port 3000, the **Stocks** app on port 3001, the **Stock Details** app on port 3002 and the Workspaces App on port 9300. The pages will reload whenever you make edits.

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#1_initial_setup-13_rest_server) chapter). 

Install all dependencies in `/react/solution/clients`, `/react/solution/client-details`, `/react/solution/stocks`, `/react/solution/stock-details` and start all apps by running the following commands: 

```cmd
npm install

npm start
```

Go to the `/react/solution/workspace` directory, open a command prompt and run the following commands to install the necessary dependencies and host the Workspaces App run the project:

```cmd
npm install

npm run start
```

You can now access the **Clients** app at `localhost:3000/clients`. Click on any of the listed clients to open a new Workspace window which will contain the details of the selected client and the portfolio of stocks for that client. Click on any stock to open its details in a new window.

### 1.3. REST Server

Before starting with the project, go to the `/tutorials/rest-server` directory and start the REST server that will host the necessary data for the applications:

```cmd
npm install

npm start
```

This will launch the server at port 8080.

### 1.5. React Project Setup

This tutorial starts with three initial applications. As the user requirements change, however, your [**Glue42 Core**](https://glue42.com/core/) project will expand with more applications. Here you will learn how to create a new React application and set it up correctly in order to enable it to work with [**Glue42 Core**](https://glue42.com/core/). When you have to create and set up new apps later on in the tutorial, you can refer back to this chapter and follow the steps below to ensure that your app has been configured properly:

1. Go to the directory where you want your new app to be created, open a command prompt and run the following command replacing `my-app` with the name of your app:

```cmd
npx create-react-app my-app
```

2. Install the following dependencies in the root directory of your app:

```cmd
npm install --save @glue42/react-hooks bootstrap@4.4.1 react-app-rewired@2.1.5
```

3. Edit the `package.json` file of your app:

- add a `homepage` property replacing `my-app` with the name of your app:

```json
"homepage": "/my-app/"
```

- change the `start`, `build` and `test` scripts to the following:

```json
"start": "react-app-rewired start --scripts-version react-scripts",
"build": "react-app-rewired build --scripts-version react-scripts",
"test": "react-app-rewired test --scripts-version react-scripts",
```

4. Create a `.env` file in the root directory of your app with the following settings:

```cmd
SKIP_PREFLIGHT_CHECK=true
PORT=3003
```

*Note that the `PORT` value must be different for each app in the project. The three initial apps already occupy ports 3000, 3001 and 3002.*

5. Go to the root directory of one of the existing tutorial apps, copy the `config-overrides.js` file and paste it in the root directory of your app.

6. Start your app by running the following command from its root directory:

```cmd 
npm start
```

7. Create or edit the code for the new app by following the specific instructions in the respective chapters.

## 2. Project Setup

### 2.1. Main Application

Every [**Glue42 Core**](https://glue42.com/core/) project must have a single central application called [Main application](../../developers/core-concepts/web-platform/overview/index.html) or Web Platform app. In a real-world scenario this would be an application used for discovering and listing available applications, Workspaces, handling notifications and much more. However, your goal now is to learn about all these aspects with as little complexity as possible. That's why the **Clients** app will serve as your Main application. The users will open the Clients app and from there they will be able to click on a client and see their stocks and so on.

Setting up a [Main application](../../developers/core-concepts/web-platform/overview/index.html) is just as simple as calling a function. First, install the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library in the **Clients** app and then initialize it. The Web Platform library handles the entire Glue42 environment, which is necessary for the [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps to be able to connect to the Main application and to each other.

To setup your Main application, go to the **Clients** app and install the Glue42 [React Hooks](https://www.npmjs.com/package/@glue42/react-hooks) library:

```cmd
npm install --save @glue42/react-hooks
```

Next, install the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library:

```cmd
npm install --save @glue42/web-platform
```

Go to the `index.js` file of the **Clients** application, import the `GlueWebPlatform()` factory function with the following configuration:

```javascript
import { GlueProvider } from "@glue42/react-hooks";
import GlueWebPlatform from "@glue42/web-platform";

const settings  = {
    webPlatform: {
        factory: GlueWebPlatform
    }
};

ReactDOM.render(
    <GlueProvider settings={settings}>
        <Clients />
    </GlueProvider>,
    document.getElementById("root")
);
```

To use the Glue42 APIs in the `<Clients />` component, import the `GlueContext` object and the `useGlue()` hook from the Glue42 React Hooks library. Pass the `GlueContext` to the `useContext()` React hook and use the returned object to access the Glue42 APIs: 

```javascript
// In `Clients`.
import { useContext } from "react";
import { GlueContext, useGlue } from "@glue42/react-hooks";

function Clients() {
    const glue = useContext(GlueContext);
};
```

To allow the the component to show whether Glue42 is available, uncomment the commented out `<div>` element in the `return` statement:

```javascript
return (
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
            ...
        </div>
        ...
    </div>
);
```

You will see a small green label at the top left corner of the **Clients** app with the text "Glue42 is available".

The **Clients** application is now setup as the [Main application](../../developers/core-concepts/web-platform/overview/index.html) of your [**Glue42 Core**](https://glue42.com/core/) project. 

### 2.2. Web Clients

Now that you have a fully functional [Main application](../../developers/core-concepts/web-platform/overview/index.html), you need to initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library in the [Web Client](../../developers/core-concepts/web-client/overview/index.html) applications. This will allow them to connect to the **Clients** app and communicate with each other.

Go to the **Stocks** and **Stock Details** apps and install the Glue42 [React Hooks](https://www.npmjs.com/package/@glue42/react-hooks) library:

```cmd
npm install --save @glue42/react-hooks
```

Go to the `index.js` files of the **Stocks** and **Stock Details** apps and add the following to make the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library available in the `<Stocks />` and `<StockDetails />` components respectively:

```javascript
// In `Stocks`.
import GlueWeb from "@glue42/web";
import { GlueProvider } from "@glue42/react-hooks";

const settings = {
    web: {
        factory: GlueWeb
    }
};

// Replace `Stocks` with the `StockDetails` component for the Stock Details app.
ReactDOM.render(
    <GlueProvider settings={settings}>
        <Stocks />
    </GlueProvider>,
    document.getElementById("root")
);
```

To use the Glue42 APIs in the `<Stocks />` and `<StockDetails />` components, import the `GlueContext` object and the `useGlue()` hook from the Glue42 React Hooks library. Pass the `GlueContext` to the `useContext()` React hook and use the returned object to access the Glue42 APIs: 

```javascript
// In `Stocks`.
import { useContext } from "react";
import { GlueContext, useGlue } from "@glue42/react-hooks";

function Stocks() {
    const glue = useContext(GlueContext);
};
```

To allow the the components to show whether Glue42 is available, uncomment the commented out `<div>` element in their `return` statements:

```javascript
return (
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
            ...
        </div>
        ...
    </div>
);
```

*Note that the **Stocks** and **Stock Details** apps won't render correctly, because to be able to initialize the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library, all [Web Client](../../developers/core-concepts/web-client/overview/index.html) applications must be started through the [Main application](../../developers/core-concepts/web-platform/overview/index.html). Currently, the only way to open these apps is through the URL in the address bar of the browser. The next chapter will teach you how to open the **Stocks** app from the **Clients** app which will solve this problem.*

## 3. Window Management

The goal of this chapter is to stat building the user flow of the entire project. The end users will open the **Clients** app and will be able to open the **Stocks** app from the "Stocks" button in it. Clicking on a stock in the **Stocks** app will open the **Stock Details** app.

Currently, the only way for the user to open the **Stocks** app is to manually enter its URL in the address bar. This, however, prevents the app from connecting to the Glue42 environment. Also, the users want the **Stock Details** app to open in a new window with specific dimensions and position. To achieve all this, you will use the [Window Management API](../../reference/core/latest/windows/index.html).

### 3.1. Opening Windows at Runtime

Go to the `glue.js` file of the **Clients** app and define a function that will open the **Stocks** app in a new window. Use the [`open()`](../../reference/core/latest/windows/index.html#API-open) method to open the **Stocks** app in a new window. The `windowID` variable ensures that the name of each new **Stocks** instance will be unique:

```javascript
let windowID = 0;

export const openStocks = (glue) => () => {
    // The `name` and `url` parameters are required. The window name must be unique.
    const name = `Stocks-${++windowID}`;
    const URL = "http://localhost:3001/";

    glue.windows.open(name, URL).catch(console.error);
};
```

Import this function in the `<Clients />` component, pass it to the `useGlue()` hook and set it as the `onClick` handler of the "Stocks" button in the `return` statement:

```javascript
import { openStocks } from "./glue";

function Clients() {
    ...
    const onClickStocks = useGlue(openStocks);
    ...
    return (
        <div className="container-fluid">
            <div className="row">
                ...
                <div className="col-md-8">
                    <h1 className="text-center">Clients</h1>
                </div>
                <div className="col-md-2 py-2">
                    <button className="btn btn-primary" onClick={onClickStocks}>Stocks</button>
                </div>
            </div>
            ...
        </div>
    );
};
```

Clicking on the "Stocks" button will now open the **Stocks** application.

To complete the user flow, instruct the **Stocks** app to open a new window each time a the user clicks on a stock. Remember that each Glue42 Window *must have a unique name*. To avoid errors resulting from attempting to open Glue42 Windows with conflicting names, check whether the clicked stock has already been opened in a new window.

Go to the `glue.js` file of the **Stocks** app and and define a function that will open the **Stock Details** app in a new window. Use the [`list()`](../../reference/core/latest/windows/index.html#API-list) method to get a collection of all Glue42 Windows and check whether the clicked stock is already open in a window. It is safe to search by `name`, because all Glue42 Window instances must have a unique `name` property:

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetails-${symbol.RIC}`;
    const URL = "http://localhost:3002/";

    // Check whether the clicked stock has already been opened in a new window.
    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL).catch(console.error);
    };
};
```

Import this function in the `<Stocks />` component, pass it to the `useGlue()` hook and set it as the `onClick` handler of each table row element in the `return` statement:

```javascript
import { openStockDetails } from "./glue";

function Stocks() {
    ...
    const showStockDetails = useGlue(openStockDetails);
    ...
    return (
        ...
        {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
            <tr
                key={RIC}
                onClick={() => showStockDetails({ RIC, Description, Bid, Ask, ...rest })}
            >
                <td>{RIC}</td>
                <td>{Description}</td>
                <td className="text-right">{Bid}</td>
                <td className="text-right">{Ask}</td>
            </tr>
        ))}
        ...
    );
};
```

*Note that you must allow popups in the browser and/or remove any popup blockers to allow the **Stock Details** window to open.*

### 3.2. Window Settings

To specify bounds for the newly opened window, pass a settings object as a third parameter to [`open()`](../../reference/core/latest/windows/index.html#API-open). Define the position (`top`, `left`) and the size (`width`, `height`) of the new window:

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetails-${symbol.RIC}`;
    const URL = "http://localhost:3002/";

    // Optional object with settings for the new window.
    const windowSettings = {
        top: 100,
        left: 100,
        width: 660,
        height: 660
    };

    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL, windowSettings).catch(console.error);
    };
};
```

### 3.3. Window Context

Every Glue42 Window has its own `context` property (its value can be any object) which can be defined when opening the window and can be updated later. You will pass the stock selected from the **Stocks** app as a window context for the new **Stock Details** window:

```javascript
export const openStockDetails = (glue) => (symbol) => {
    const name = `StockDetails-${symbol.RIC}`;
    const URL = "http://localhost:3002/";
    const windowSettings = {
        top: 100,
        left: 100,
        width: 660,
        height: 660,
        // Pass the `symbol` as a context for the new window.
        context: { symbol }
    };

    const stockWindowExists = glue.windows.list().find(w => w.name === name);

    if (!stockWindowExists) {
        glue.windows.open(name, URL, windowSettings).catch(console.error);
    };
};
```

Next, go to the `glue.js` file of the **Stock Details** app and define a function that will get the window context. Use the [`my()`](../../reference/core/latest/windows/index.html#API-my) method to get a reference to the current Glue42 Window and the [`getContext()`](../../reference/core/latest/windows/index.html#WebWindow-getContext) method of the returned [`WebWindow`](../../reference/core/latest/windows/index.html#WebWindow) to retrieve the window context:

```javascript
export const getMyWindowContext = (setWindowContext) => async (glue) => {
    const myWindow = glue.windows.my();
    const context = await myWindow.getContext();

    setWindowContext(context);
};
```

Go to the `<StockDetails />` component, define a state variable that will hold the window context and pass the `getMyWindowContext()` function to the `useGlue()` hook:

```javascript
import { useState } from "react";
import { getMyWindowContext } from "./glue";

function StockDetails() {
    const [windowContext, setWindowContext] = useState({});

    // Get the window context.
    useGlue(getMyWindowContext(setWindowContext));
    
    // Extract the selected stock from the window context.
    const {
        symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues, Bid, Ask } = {}
    } = windowContext || {};
};
```

Now, when you click on a stock in the **Stocks** app, the **Stock Details** app will open in a new window displaying information about the selected stock.

## 4. Interop

In this section you will use some of the functionalities provided by the [**Glue42 Core**](https://glue42.com/core/) [Interop API](../../reference/core/latest/interop/index.html).

### 4.1. Method Registration

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which the new stock prices will be pushed. The **Stocks** and **Stock Details** apps will subscribe to the stream to get notified when new prices have been generated.

Use the [register()](../../reference/core/latest/interop/index.html#API-register) method and define a callback for registering an Interop method in the `glue.js` file of the **Stocks** app. Pass a method name or an object with a `name` property as a first argument to `register()` and a method handler as a second:

```javascript
import { SET_CLIENT_METHOD } from "./constants";

export const registerSetClientMethod = (setClient) => (glue) => {
    // Register an Interop method by providing a name and a handler.
    glue.interop.register(SET_CLIENT_METHOD, setClient);
};
```
Import the callback in the `<Stocks />` component, define a state variable that will hold the selected client and use the `useGlue()` hook to register the Interop method:

```javascript
import { registerSetClientMethod } from "./glue";

function Stocks() {
    ...
    const [{ clientId, clientName }, setClient] = useState({});
    useGlue(registerSetClientMethod(setClient));
    ...
};
```

Modify the `fetchPortfolio()` function in the existing `useEffect()` hook to fetch the selected client portfolio. Pass `clientId` as a `useEffect()` dependency, so that `fetchPortfolio()` will be called whenever a new client is selected and the component is re-rendered:

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

Finally, add an element to show the client name and ID above the stocks table in the `return` statement of the `<Stocks />` component.

```javascript
return (
    ...
        {clientId && (
            <h2 className="p-3">
                Client {clientName} - {clientId}
            </h2>
        )}
    ...
);
```

### 4.2. Method Discovery and Invocation

Now, you need to invoke the registered Interop method from the **Clients** app every time the user clicks a client row in the clients table. Again, you will use the `useGlue()` hook to compose a handler which will invoke the Interop method. Before calling the method, you will also check if the method has been registered (i.e., whether the **Stock** app is running).

In the `glue.js` file of the **Clients** app define a callback that will invoke the Interop method. Use the [invoke()](../../reference/core/latest/interop/index.html#API-invoke) method - pass the name of the Interop method to invoke as a first argument and an object with arguments for the invocation as a second:

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

Import the callback in the `<Clients />` component and pass it to the `useGlue()` hook to define a handler function for the `onClick` property of each clients table row:

```javascript
import { setClientPortfolioInterop } from "./glue";

function Clients() {
    ...
    const onClickClients = useGlue(setClientPortfolioInterop);
    ...
};
```

In the `return` statement, attach the `onClick` handler to each client row:

```javascript
return (
    ...    
        <tbody>
            {clients.map(({ name, pId, gId, accountManager, portfolio, ...rest }) => (
                <tr
                    key={pId}
                    onClick={() => {
                        onClickClients({ clientId: gId, clientName: name });
                    }}
                >
                    <td>{name}</td>
                    <td>{pId}</td>
                    <td>{gId}</td>
                    <td>{accountManager}</td>
                </tr>
            ))}
        </tbody>
    ...
);
```

Now when you click on a client in the **Clients** app, the **Stocks** app will display only the stocks that are in the portfolio of the selected client.

### 4.3. Creating Streams and Publishing Data

Next, you will create an Interop stream from the **Stocks** app to which new stock prices will be published at a set interval. The **Stocks** and the **Stock Details** apps will subscribe to that stream to show real-time stock price updates. The prices will be generated by the predefined `publishInstrumentPrice()` function in the `glue.js` file of the **Stocks** app.

Go to the `glue.js` file of the **Stocks** app and define a callback that will create the Interop stream. The [createStream()](../../reference/core/latest/interop/index.html#API-createStream) method returns a `Stream` object which will be passed to the `publishInstrumentPrice()` handler:

```javascript
import { SET_PRICES_STREAM } from "./constants";

export const createInstrumentStream = async (glue) => {
    const stream = await glue.interop.createStream(SET_PRICES_STREAM);
    publishInstrumentPrice(stream);
};
```

Modify the `publishInstrumentPrice()` callback to use the `push()` method of the `Stream` object to push the generated prices to the stream:

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

Go to the `<Stocks />` component and create the stream with the `useGlue()` hook:

```javascript
import { createInstrumentStream } from "./glue";

function Stocks() {
    ...
    useGlue(createInstrumentStream);
    ...
};
```

### 4.4. Stream Subscription

To consume the data from the created Interop stream, create stream subscriptions in the **Stocks** and the **Stock Details** apps.

Go to the `glue.js` files of the **Stocks** and **Stock Details** apps to define a callback that will create a stream subscription. This callback will receive as parameters a handler function responsible for updating the stock prices in the component context, and a stock symbol which will be an array of stocks or a single stock depending on whether the callback has been invoked by the **Stocks** or the **Stock Details** app:

```javascript
import { SET_PRICES_STREAM } from "./constants";

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
    };
};
```

Go to the `<Stocks />` component and create a stream subscription. The stream used in the tutorial publishes all possible stock prices and it is not necessary to close and renew the subscription when a new client has been selected. However, in a real project scenario, you will have to do exactly that. That is why, this is reflected in the code below. You have to pass the `portfolio` as a dependency of the `useGlue()` hook to trigger a new subscription every time the `portfolio` has been updated:

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

                const url = `http://localhost:8080/api/portfolio/${clientId ? clientId : ""}`;
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

Update the code for displaying the `Ask` and `Bid` prices by taking their values from the `prices` variable that is updated when new data is received from the stream:

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
                    <td>{Description}</td>
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

Finally, extract the `Bid` and the `Ask` from the state of the `<StockDetails />` component and create a stream subscription by passing the `setPrices` method as a handler for the new stream data and the `RIC` to target the stock for which to get the prices. 

```javascript
import { subscribeForInstrumentStream } from "./glue";

function StockDetails() {
    ...
    const {
        symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues } = {}
    } = windowContext || {};

    const [{ Bid, Ask }, setPrices] = useState({ Bid: windowContext.Bid, Ask: windowContext.Ask});

    useGlue(subscribeForInstrumentStream(setPrices), [RIC]);    
    ...
};
```

Now **Stock Details** also displays a new value for the `Bid` and `Ask` prices at regular intervals.

*Note that each new instance of the **Stocks** app will create a new stream instance. In real world scenarios, this should be handled differently - e.g., by a system app acting as a designated data provider. For more details, see [Plugins](../../capabilities/plugins/index.html).*

## 5. Shared Contexts

This section will show you how to update context objects and subscribe for context updates using the [Shared Contexts API](../../reference/core/latest/shared%20contexts/index.html). You will extend the **Clients** app to update a context with information about the selected client instead of using the Interop API to invoke a method. The **Stocks** app, instead of registering an Interop method, will subscribe for updates of the same context object to display the relevant client portfolio. You will add a "Show All" button to the **Stocks** app that will clear the context value in order to show information about all stocks. The **Stock Details** app will also subscribe for updates of this context in order to show whether the selected client has the selected stock in their portfolio.

### 5.1. Updating a Context

Go to the `glue.js` file of the **Clients** and **Stocks** apps and define a function for updating the shared context object:

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

Go to the **Clients** app and replace the `setClientPortfolioInterop()` handler for selecting a client with the `setClientPortfolioSharedContext()` one. Pass the `portfolio` object to `onClickSharedContext()` when calling it:

```javascript
import { setClientPortfolioSharedContext } from "./glue";

function Clients() {
    ...
    // const onClickClients = useGlue(setClientPortfolioInterop);
    const onClickSharedContext = useGlue(setClientPortfolioSharedContext);
    ...

    return (
        ...
            {clients.map(({ name, pId, gId, accountManager, portfolio, ...rest }) => (
                <tr
                    key={pId}
                    onClick={() => {
                        onClickSharedContext({ clientId: gId, clientName: name, portfolio })
                    }}
                >
                ...
            ))}
        ...
    );
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
            <div className="row">
                ...
                <div className="col-md-8">
                    <h1 className="text-center">Stocks</h1>
                </div>
                <div className="col-md-2 py-2">
                    <button
                        type="button"
                        className="mb-3 btn btn-primary"
                        onClick={() => updateClientContext({})}
                    >
                        Show All
                    </button>
                </div>
            </div>
            ...
        </div>
    );
};
```

### 5.2. Subscribing for Context Updates

Subscribe the **Stocks** and **Stock Details** apps for updates to the same context object in order to update them accordingly when the user selects a new client.

Go to the `glue.js` files of the **Stocks** and **Stock Details** applications and define a function for subscribing to the context. Use the [`subscribe()`](../../reference/core/latest/shared%20contexts/index.html#API-subscribe) method:

```javascript
import { SHARED_CONTEXT_NAME } from "./constants";

export const subscribeForSharedContext = (handler) => (glue) => {
    // Subscribing for the shared context by 
    // providing a context name and a handler for context updates.
    glue.contexts.subscribe(SHARED_CONTEXT_NAME, handler);
};
```

Go to the `<Stocks />` component and replace the `registerSetClientMethod()` handler with the `subscribeForSharedContext()` one:

```javascript
import { subscribeForSharedContext } from "./glue";

function Stocks() {
    ...
    useGlue(subscribeForSharedContext(setClient));
    ...
};
```

Go to the `<StockDetails />` component and also subscribe for updates to the shared context. Add an element in the `return` statement that will be displayed conditionally depending on whether the client has the selected stock in their portfolio. Add the client information (`clientId`, `clientName`, `portfolio`) to the component state to be able to display data about the currently selected client and use the `portfolio` to determine whether the client has the selected stock in their portfolio. 

```javascript
import { subscribeForSharedContext } from "./glue";

function StockDetails() {
    ...
    const [{ clientId, clientName, portfolio }, setClient] = useState({});
    ...
    useGlue(subscribeForSharedContext(setClient));

    return (
        <div className="container-fluid">
            <div className="row">
                ...
                {clientId && (
                    <>
                        <h2 className="p-3">
                            Client {clientName} - {clientId}
                        </h2>
                        {RIC && portfolio.length && !portfolio.includes(RIC) && (
                            <h4 className="p-3">
                                The client does not have this stock in their portfolio.
                            </h4>
                        )}
                    </>
                )}
            </div>
            ...
        </div>
    );
};
```

Everything will work as before, but now the applications will use the Shared Contexts API to pass and retrieve the selected client.

## 6. Channels

The latest requirement from the users is to be able work with multiple clients at a time by having multiple instances of the **Stocks** app show the portfolios of different clients. Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here you will use the [Channels API](../../reference/core/latest/channels/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a different Channel. The different Channels are color coded and the user will be able to select a Channel from a Channel Selector UI. The **Clients** app will update the context of the currently selected Channel when the user clicks on a client.

### 6.1. Channels Configuration

The [Main Application](../../developers/core-concepts/web-platform/overview/index.html) (the **Clients** app in this project) handles the configuration of the Glue42 environment. The `GlueWebPlatform()` factory function accepts an optional configuration object that allows you to enable, disable and configure various Glue42 features. Here you will use it to define the available Glue42 Channels. To achieve this, define a configuration object and pass it to the `GlueWebPlatform()` factory function in the `index.js` file of the **Clients** application:

```javascript
// Defining system Channels.
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

const settings  = {
    webPlatform: {
        factory: GlueWebPlatform,
        config
    }
};

ReactDOM.render(
    <GlueProvider settings={settings}>
        <Clients />
    </GlueProvider>,
    document.getElementById("root")
);
```

The `<GlueProvider />` component will initialize internally the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library and enable the Channels API.

### 6.2. Channel Selector Widget

The users have to be able to navigate through the Channels for which they will need some sort of user interface. You can create your own Channel Selector widget by using the Channels API, but for the purpose of the tutorial there is a `<ChannelSelectorWidget />` component provided. To add it to the **Stocks** and **Clients** apps, follow these steps:

1. Import the Channel Selector widget in the `<Clients />` and `<Stocks />` components:

```javascript
import ChannelSelectorWidget from "./ChannelSelectorWidget";
```

2. To use the new component, you have to pass two props to it:
- `channelNamesAndColors` - the names and colors of all available Channels; 
- `onChannelSelected` - handler that will be called when the Channel changes; 

Go to the `glue.js` files of the **Clients** and **Stocks** apps and define the following functions:

```javascript
// This will be used to signify that the app is not connected to any Channel.
import { NO_CHANNEL_VALUE } from "./constants";

// Returns all names and color codes of the avaialbale Channels.
export const getChannelNamesAndColors = async (glue) => {
    // Getting a list of all Channel contexts.
    const channelContexts = await glue.channels.list();

    // Extracting only the names and colors of the Channels.
    const channelNamesAndColors = channelContexts.map((channelContext) => {
        const channelInfo = {
            name: channelContext.name,
            color: channelContext.meta.color
        };

        return channelInfo;
    });

    return channelNamesAndColors;
};

// This function will join a given Channel.
export const joinChannel = (glue) => ({ value: channelName }) => {
    if (channelName === NO_CHANNEL_VALUE) {
        // Checking for the current Channel.
        if (glue.channels.my()) {
            // Leaving a Channel.
            glue.channels.leave();
        }
    } else {
        // Joining a Channel.
        glue.channels.join(channelName);
    };
};
```

3. Setup the `ChannelSelectorWidget` in both apps. 

Go to the **Clients** app to set up the Channels functionalities. Import the `NO_CHANNEL_VALUE` constant that will be used for leaving the current Channel:

```javascript
import { NO_CHANNEL_VALUE } from "./constants";
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

Create the `<ChannelWidgetSelector />` component in the `return` statement. Pass the `channelNamesAndColors` and `onChannelSelected` as props to it:

```javascript
return (
    <div className="container-fluid">
        <div className="row">
            ...
            <div className="col-md-8">
                <h1 className="text-center">Clients</h1>
            </div>
            <div className="col-md-2 py-2">
                    <button className="btn btn-primary">Stocks</button>
            </div>
            <div className="px-3 py-1">
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

4. Go to the **Stocks** app to set up the Channels functionalities. Define a `setDefaultClient()` callback for handling the default state where no client has been selected and a `channelWidgetState` variable that will be used to trigger state change in the `<ChannelWidgetSelector />` component:

```javascript
import {
    getChannelNamesAndColors,
    joinChannel
} from "./glue";

function Stocks() {
    ...
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    const onChannelSelected = useGlue(joinChannel);
    const setDefaultClient = () => setClient({ clientId: "", clientName: "" });
    const [channelWidgetState, setChannelWidgetState] = useState(false);
    ...
};
```

Create the `<ChannelWidgetSelector />` component in the `return` statement. Pass `channelNamesAndColors` and `onChannelSelected` as props to it. Use the `onDefaultChannelSelected` property to clear the selected client and leave the current Channel when the user selects "No channel": 

```javascript
return (
    <div className="container-fluid">
        <div className="row">
            ...
            <div className="col-md-8">
                <h1 className="text-center">Stocks</h1>
            </div>
            ...
            <div className="px-3 py-1">
                <ChannelSelectorWidget
                    channelNamesAndColors={channelNamesAndColors}
                    onChannelSelected={onChannelSelected}
                    onDefaultChannelSelected={setDefaultClient}
                />
            </div>
        </div>
        ...
    </div>
);
```

To leave the current Channel, re-render the Channel Selector and clear the selected client when the user clicks the "Show All" button, modify its `onClick` handler: 

```javascript
onClick={() => {
    setChannelWidgetState(!channelWidgetState);
    setDefaultClient();
}}
```

Pass the `channelWidgetState` state variable to the `key` property of the `ChannelSelectorWidget` component to trigger state change:

```javascript
function Stocks() {
    ...
    return (
        <div className="container-fluid">
            <div className="row">
                ...
                <button
                    type="button"
                    className="mb-3 btn btn-primary"
                    onClick={() => {
                        setChannelWidgetState(!channelWidgetState);
                        setDefaultClient();
                    }}
                >
                    Show All
                </button>
                ...
                <div className="col-md-2 align-self-center">
                    <ChannelSelectorWidget
                        key={channelWidgetState}
                        channelNamesAndColors={channelNamesAndColors}
                        onChannelSelected={onChannelSelected}
                        onDefaultChannelSelected={setDefaultClient}
                    />
                </div>
            </div>
            ...
        </div>
    );
};
```

### 6.3. Publishing and Subscribing

Next, you need to enable the **Clients** app to publish updates to the current Channel context and the **Stocks** app to subscribe for these updates.

Go to the `glue.js` file of the **Clients** app and define a function that will publish updates to the current Channel: 

```javascript
export const setClientPortfolioChannels = (glue) => (
    {
        clientId = "",
        clientName = ""
    }
) => {
    // Checking for the current Channel.
    if (glue.channels.my()) {
        // Publishing data to the Channel.
        glue.channels.publish({ clientId, clientName });
    };
};
```

Go to the `<Clients />` component and use this function to update the current Channel. Don't remove the `onClickSharedContext()` handler from the client rows. The **Stock Details** app still uses the shared context to get the client information so you need to use both handlers:

```javascript
import { setClientPortfolioChannels } from "./glue";

function Clients() {
    ...
    const onClickSharedContext = useGlue(setClientPortfolioSharedContext);
    const onClickChannel = useGlue(setClientPortfolioChannels);
    ...

    return (
        ...
        <tr
            key={pId}
            onClick={() => {
                    // Use both handlers.
                    onClickSharedContext({ clientId: gId, clientName: name, portfolio });
                    onClickChannel({ clientId: gId, clientName: name });
                }
            }
        >
        ...
    );
};
```

Go to the `glue.js` file of the **Stocks** app and define a function that will subscribe for Channel updates:

```javascript
export const subscribeForChannels = (handler) => (glue) => {
    // Subscribing for updates to the current channel.
    glue.channels.subscribe(handler);
};
```

Go to the `<Stocks />` component and comment out or delete the code that uses the Shared Contexts API to listen for updates to the shared context. Instead, subscribe for Channel updates:

```javascript
import { subscribeForChannels } from "./glue";

function Stocks() {
    ...
    // useGlue(subscribeForSharedContext(setClient));
    useGlue(subscribeForChannels(setClient));
    ...
};
```

Now you can open multiple instances of the **Stocks** app and keep them on different colored Channels. The **Clients** app will update only the context of the Channel it is currently on and only the instance of the **Stocks** app that is on the same Channel will update accordingly.

## 7. Application Management

Up until now you had to use the Window Management API to open new windows when the user clicks on the "Stocks" button in the **Clients** app or on a stock in the **Stocks** app. This works fine for small projects, but does not scale well for larger ones, because this way each app has to know all details (URL, start position, initial context, etc.) about every application it needs to start. In this chapter you will replace the Window Management API with the [Application Management API](../../reference/core/latest/appmanager/index.html) which will allow you to predefine all available applications when initializing the [Main Application](../../developers/core-concepts/web-platform/overview/index.html). The **Clients** app will be decoupled from the **Stocks** app and the **Stocks** app will be decoupled from **Stock Details** - you will need only the names of the apps to be able to start them.

### 7.1. Application Configuration

To take advantage of the [Application Management API](../../reference/core/latest/appmanager/index.html), define the configurations for your applications. Go to the **Clients** app and, similarly to Channels, define an `applications` property in the configuration object passed to `GlueWebPlatform()` containing all required definitions:

```javascript
// Define application configurations.
const applications = {
    local: [
        {
            name: "Clients",
            type: "window",
            details: {
                url: "http://localhost:3000/clients"
            }
        },
        {
            name: "Stocks",
            type: "window",
            details: {
                url: "http://localhost:3001/stocks",
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
                url: "http://localhost:3002/details",
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
                url: "http://localhost:3003/client-details"
            }
        }
    ]
};

const config = { channels, applications };

const settings  = {
    webPlatform: {
        factory: GlueWebPlatform,
        config
    }
};

ReactDOM.render(
    <GlueProvider settings={settings}>
        <Clients />
    </GlueProvider>,
    document.getElementById("root")
);
```

The `name` and `url` properties are required when defining an application configuration object. As you see, the position and size of the app windows is now defined in their configuration.

### 7.2. Starting Applications

Go the the `glue.js` file of the **Clients** app and define a function that will start the **Stocks** app. Get the **Stocks** application object with the [`application()`](../../reference/core/latest/appmanager/index.html#API-application) method and use its [`start()`](../../reference/core/latest/appmanager/index.html#Application-start) method to start the **Stocks** app when the user clicks on the "Stocks" button. Pass the current Channel as a context to the started instance:

```javascript
export const startApp = glue => async () => {
    const channels = await glue.channels.list();
    let channel = {};
    if (glue.channels.my()) {
        const channelDefinition = channels.find(channel => channel.name === glue.channels.my());
        channel = {
            name: channelDefinition.name,
            label: channelDefinition.name,
            color: channelDefinition.meta.color
        };
    } else {
        channel = {
            name: NO_CHANNEL_VALUE,
            label: NO_CHANNEL_VALUE
        }
    };
    glue.appManager.application("Stocks").start({ channel });
};
```

*Note that the `ChannelSelectorWidget` wraps a React `<Select />` component and to use it as a controlled component (when you want to make the **Stocks** app automatically select a Channel on startup), you must create a proper Channel definition object using the values of the `name` and `meta.color` properties and pass it to the **Stocks** application.*

Import the `startApp()` function in the `<Clients />` component, create a `startStocksApp()` callback and pass it to the `onClick` handler of the "Stocks" button:

```javascript
import { startApp } from "./glue.js";

function Clients() {
    ...
    const startStocksApp = useGlue(startApp);
    ...

    return (
        ...
            <div className="col-md-2 py-2">
                <button className="btn btn-primary" onClick={startStocksApp}>Stocks</button>
            </div>
        ...
    )
};
```

Go to the `glue.js` file of the **Stocks** app and define a function that will get the Channel passed as window context by the **Clients** application:

```javascript
export const getMyWindowContext = (setWindowContext) => async (glue) => {
    const myWindow = glue.appManager.myInstance;
    const context = await myWindow.getContext();

    setWindowContext({ channel: context.channel });
};
```

Go to the `<Stocks />` component, import the function and use it to set the window context:

```javascript
import { getMyWindowContext } from "./glue";

function Stocks() {
    ...
    const [currentChannel, setCurrentChannel] = useState({ value: NO_CHANNEL_VALUE, label: NO_CHANNEL_VALUE });
    const [windowContext, setWindowContext] = useState({});

    useGlue(getMyWindowContext(setWindowContext));

    useEffect(() => {
        if (windowContext.channel) {
            setCurrentChannel(windowContext.channel);
            if (onChannelSelected) {
                onChannelSelected({ value: windowContext.channel.name });
            }
        } else {
            setCurrentChannel({ value: NO_CHANNEL_VALUE, label: NO_CHANNEL_VALUE });
        }
    }, [windowContext.channel, onChannelSelected]);
    ...
};
```

Add a `value` property to the `<ChannelSelectorWidget />` that will hold the `currentChannel` value. Add the `setCurentChannel()` function to the `onChannelSelected` property:

```javascript
function Stocks() {
    ...
    return (
        ...
        <div className="col-md-2 align-self-center">
            <ChannelSelectorWidget
                key={channelWidgetState}
                value={currentChannel}
                channelNamesAndColors={channelNamesAndColors}
                onChannelSelected={channel => {
                    onChannelSelected(channel);
                    setCurrentChannel(channel);
                }}
                onDefaultChannelSelected={channel => {
                    setDefaultClient();
                    onChannelSelected(channel);
                    setCurrentChannel({ value: NO_CHANNEL_VALUE, label: NO_CHANNEL_VALUE });
                }}
            />
        </div>
        ...
    )
};
```

The `onChannelSelected()` function manages the Channel selection and the `setCurrentChannel()` function visualizes the current Channel in the component.

### 7.3. Application Instances

Go to the `glue.js` file of the **Stock** app and edit the `openStockDetails()` function. Use the [`application()`](../../reference/core/latest/appmanager/index.html#API-application) method to get the **Stock Details** app. Check whether an instance with the selected stock has already been started by iterating over the contexts of the existing **Stock Details** instances. If there is no instance with the selected stock, call the `start()` method on the application object and pass the selected stock as a context:

```javascript
export const openStockDetails = (glue) => async (symbol) => {
    const detailsApplication = glue.appManager.application("Stock Details");

    // Check whether an instance with the selected stock is already running.
    const contexts = await Promise.all(
        // Use the `instances` property to get all running application instances.
        detailsApplication.instances.map(instance => instance.getContext())
    );
    const isRunning = contexts.find(context => context.symbol.RIC === symbol.RIC);
    
    if (!isRunning) {
        detailsApplication.start({ symbol }).catch(console.error);
    };
};
```

Go to the `glue.js` file of the **Stock Details** app and edit the `getMyWindowContext()` function to get the window context using the Application Management API:

```javascript
export const getMyWindowContext = (setWindowContext) => async (glue) => {
    const myWindow = glue.appManager.myInstance;
    const context = await myWindow.getContext();
    
    setWindowContext({ symbol: context.symbol });
};
```

Everything will work as before, the difference being that now the apps are using the Application Management API instead of the Window Management API.

## 8. Workspaces

The latest feedback from the users is that their desktops very quickly become cluttered with multiple floating windows. The [**Glue42 Core**](https://glue42.com/core/) [Workspaces](../../capabilities/windows/workspaces/overview/index.html) feature solves exactly that problem.

The new requirement is that when a user clicks on a client in the Clients application, a new Workspace should open displaying detailed information about the selected client in one app and their stocks portfolio in another. When the user clicks on a stock, a third application should appear in the same Workspace displaying more details about the selected stock. You will create a **Client Details** application for displaying information about the selected client.

Go to the **Clients** and **Stocks** apps and comment out all logic and imports related to Channels, introduced in a previous chapter. Instead, you will use Workspaces to allow the users to work with multiple clients at once and organize their desktop at the same time. Channels and Workspaces can, of course, be used together to provide extremely enhanced user experience, but in order to focus entirely on Workspaces, the Channels functionality will be ignored. Remove the "Stocks" button from the **Clients** app and all logic related to it. Go to the **Stock Details** app and remove the element displaying whether the selected client has the selected stock in their portfolio and all logic related to this element.

Use the [Workspaces API](../../reference/core/latest/workspaces/index.html) documentation as a reference when working on this chapter.

### 8.1. Setup

All Workspaces are contained in a specialized, standalone web application called [Workspaces App](../../capabilities/windows/workspaces/overview/index.html#workspaces_concepts-frame). It is outside the scope of this tutorial to cover building and customizing this applications, so you have a ready-to-go application located at `/workspace`. The Workspaces App is already being hosted at `http://localhost:9300/`.

#### Create the Client Details App

- Create a new React app named `client-details` in the root directory of your [**Glue42 Core**](https://glue42.com/core/) project following the instructions in [Chapter 1.5.](#1_setup-15_react_project_setup).

- Create a `ClientDetails.jsx` file in `/client-details/src` and paste the following code:

```javascript
import React, { useState } from "react";

function ClientDetails() {
    const [client, setClient] = useState({});

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2">
                    <span id="glueSpan" className="label label-warning">Glue42 is unavailable</span>
                </div>
                <div className="col-md-10">
                    <h1 className="text-center">Client Details</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h3 id="clientStatus"></h3>
                </div>
            </div>
            <div className="row">
                <table id="clientsTable" className="table table-hover">
                    <tbody>
                        <tr>
                            <th>Full Name</th>
                            <td data-name>{client && client.clientName}</td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td data-address>{client && client.address}</td>
                        </tr>
                        <tr>
                            <th>Phone Number</th>
                            <td data-phone>{client && client.contactNumbers}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td data-email>{client && client.email}</td>
                        </tr>
                        <tr>
                            <th>Account Manager</th>
                            <td data-manager>{client && client.accountManager}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientDetails;
```

- Go to the `index.js` file of the newly created **Client Details** app. Add all imports from the example below, remove the `App` import and replace the `<App />` component with `<ClientDetails />`:

```javascript
import GlueWeb from "@glue42/web";
import { GlueProvider } from "@glue42/react-hooks";
import "bootstrap/dist/css/bootstrap.css";
import ClientDetails from "./ClientDetails";

const settings  = {
    web: {
        factory: GlueWeb
    }
};

ReactDOM.render(
    <GlueProvider settings={settings}>
        <ClientDetails />
    </GlueProvider>,
    document.getElementById("root")
);
```

### 8.2. Workspace Layouts

Next, you need to build a Workspace layout which will be the blueprint of the Workspace that the **Clients** app will restore when the user clicks on a client. This layout should contain the **Client Details** and **Stocks** apps.

The Workspace layout can be restored by name using the [Workspaces API](../../reference/core/latest/workspaces/index.html).

### 8.3. Initializing Workspaces

To be able to use Workspaces functionalities, you need to initialize the [Workspaces API](../../reference/core/latest/workspaces/index.html) in the **Clients**, **Client Details** and **Stocks** apps. The **Stock Details** app will participate in the Workspace, but will not need to use any Workspaces functionality. Go to the root directories of the **Clients**, **Stocks** and **Client Details** apps and run the following command to install the Workspaces API:

```cmd
npm install --save @glue42/workspaces-api
```

Go to the `index.js` file of the **Clients** application, define the Workspace layout and add the necessary configuration for initializing the Workspaces API:

```javascript
// Initializing the Workspaces API in the Clients app.
import GlueWorkspaces from "@glue42/workspaces-api";

// Defining Workspace layouts.
const layouts = {
    mode: "idb",
    local: [
        {
            name: "Client Space",
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
                                                            title: "React App",
                                                            context: {}
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
                                                                    title: "React App",
                                                                    context: {}
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
    // Pass the `GlueWorkspaces` factory function.
    glue: { libraries: [GlueWorkspaces] },
    // Specify the location of the Workspaces App.
    workspaces: { src: "http://localhost:9300/" },
    // Pass predefined Workspace layouts.
    layouts,
    channels,
    applications
};

const settings  = {
    webPlatform: {
        factory: GlueWebPlatform,
        config
    }
};

ReactDOM.render(
    <GlueProvider settings={settings}>
        <Clients />
    </GlueProvider>,
    document.getElementById("root")
);
```

Next, go to the `index.js` files of the **Client Details** and **Stocks** apps, import the `GlueWorkspaces` library and add `GlueWorkspaces` to the `libraries` array of the configuration object when initializing the Glue42 Web library:

```javascript
import GlueWorkspaces from "@glue42/workspaces-api";

const config = { libraries: [GlueWorkspaces] };

const settings = {
    web: {
        factory: GlueWeb,
        config
    }
};
```

### 8.4. Opening Workspaces

Next, you have to implement opening a new Workspace when the user clicks on a client in the **Clients** app. Go to the `glue.js` file of the **Clients** app, define a function that will restore by name the Workspace layout you created earlier and pass the selected client as a starting context. The specified context will be attached as window context to all windows participating in the Workspace:

```javascript
export const startAppWithWorkspace = (glue) => (client) => {
    glue.workspaces.restoreWorkspace("Client Space", { context: client });
};
```

Import the function in the `<Clients />` components and create a `openWorkspace()` callback to be passed to the `onClick` handler of the client row:

```javascript
import { startAppWithWorkspace } from "./glue";

function Clients() {
    ...
    const openWorkspace = useGlue(startAppWithWorkspace);
    ...
};
```

Delete the existing code in the `onClick` handler of the client row element and replace it with a call to `openWorkspace()`:

```javascript
...
    return (
        ...
            <tr
                key={pId}
                onClick={() => {
                    openWorkspace({ clientId: gId, clientName: name, accountManager, portfolio, ...rest });
                }}
            >
            ...
            </tr>
        ...
    );
...
```

If everything is correct, a new Workspace will now open every time you click a client.

### 8.5. Starting Context

The windows of the **Client Details** and **Stocks** apps participating in the new Workspace will have a starting context attached to them. You have to handle this starting context in order to display the relevant client data when the user selects a client from the **Clients** app.

To get the starting window context, subscribe for updates to the context of the current window using the [Window Management API](../../reference/core/latest/windows/index.html). When the window context has been updated, handle the client data in the respective application and also set the Workspace title to the name of the selected client.

Create a `glue.js` file in `/client-details/src` and insert the following:

```javascript
export const setClientFromWorkspace = (setClient) => async (glue) => {
    const myWorkspace = await glue.workspaces.getMyWorkspace();
    myWorkspace.onContextUpdated((context) => {
        if (context) {
            setClient(context);
            myWorkspace.setTitle(context.clientName);
        };
    });
};
```

Import the `setClientFromWorkspace()` function in the `<ClientDetails />` component and set it up using the `useGlue()` hook:

```javascript
import { useGlue } from "@glue42/react-hooks";
import { setClientFromWorkspace } from "./glue";

function ClientDetails() {
    ...
    useGlue(setClientFromWorkspace(setClient));
    ...
};
```

Next, update the **Stocks** application to show the stocks of the currently selected client. Go to the `glue.js` file of the **Stocks** app and add the following:

```javascript
export const setClientFromWorkspace = (setClient) => async (glue) => {
    const myWorkspace = await glue.workspaces.getMyWorkspace();
    myWorkspace.onContextUpdated((context) => {
        if (context) {
            setClient(context);
        };
    });
};
```

Import the `setClientFromWorkspace()` function in the `<Stocks />` component and set it up using the `useGlue()` hook:

```javascript
import { setClientFromWorkspace } from "./glue";

function Stocks() {
    ...
    useGlue(setClientFromWorkspace(setClient));
    ...
};
```

Now when you select a client in the **Clients** app, a new Workspace will open with the **Client Details** and **Stocks** apps showing the relevant client information.

### 8.6. Modifying Workspaces

Next, you have to make the **Stock Details** app appear in the same Workspace as a sibling of the **Stocks** app when the user clicks on a stock. You have to check whether the **Stock Details** app has already been added to the Workspace, and if not, add it and update its context with the selected stock, otherwise - only update its context.

*To achieve this functionality, you will have to manipulate a Workspace and its elements. It is recommended that you familiarize yourself with the Workspaces terminology to fully understand the concepts and steps below. Use the available documentation about [Workspaces Concepts](../../capabilities/windows/workspaces/overview/index.html#workspaces_concepts), [Workspace Box Elements](../../capabilities/windows/workspaces/workspaces-api/index.html#box_elements) and the [Workspaces API](../../reference/core/latest/workspaces/index.html).*

The **Stocks** app is a [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow) that is the only child of a [`Group`](../../reference/core/latest/workspaces/index.html#Group) element. If you add the **Stock Details** app as a child to that `Group`, it will be added as a second tab window and the user will have to manually switch between both apps. The **Stock Details** app should be a sibling of the **Stocks** app, but both apps should be visible within the same parent element. That's why, you have to add a new `Group` element as a sibling of the existing `Group` that contains the **Stocks** app, and then load the **Stock Details** app in it.

After the **Stocks Details** app has been opened in the Workspace as a [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow), you have to pass the selected stock as its context. To do that, get a reference to the underlying [Glue42 Window](../../reference/core/latest/windows/index.html#WebWindow) object of the **Stock Details** window using the [`getGdWindow()`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow-getGdWindow) method of the [`WorkspaceWindow`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow) instance and update its context with the [`updateContext()`](../../reference/core/latest/windows/index.html#WebWindow-updateContext) method.

Go to the `glue.js` file of the **Stocks** app and define the following function:

```javascript
export const openStockDetailsInWorkspace = (glue) => async (symbol) => {
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

        // Open the Stock Details window in the newly created `Group` element.
        detailsWorkspaceWindow = await group.addWindow({ appName: "Stock Details" });
        await detailsWorkspaceWindow.forceLoad();
        detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
    };

    // Update the window context with the selected stock.
    detailsGlue42Window.updateContext({ symbol });
};
```

*Note that [`forceLoad()`](../../reference/core/latest/workspaces/index.html#WorkspaceWindow-forceLoad) is used to make sure that the **Stock Details** app is loaded and a [Glue42 Window](../../reference/core/latest/windows/index.html#WebWindow) instance is available. This is necessary, because [`addWindow()`](../../reference/core/latest/workspaces/index.html#Group-addWindow) adds a new window to the [`Group`](../../reference/core/latest/workspaces/index.html#Group) (meaning that it exists as an element in the Workspace), but it doesn't guarantee that the content has loaded.*

Import the function in the `<Stocks />` component and edit the existing `showStockDetails()` callback:

```javascript
import { openStockDetailsInWorkspace } from "./glue";

function Stocks() {
    ...
    const showStockDetails = useGlue(openStockDetailsInWorkspace);
    ...
};
```

Go to the `glue.js` file of the **Stock Details** app and change the `getMyWindowContext()` function to the following:

```javascript
export const getMyWindowContext = (setWindowContext) => async (glue) => {
    const myWindow = glue.windows.my();
    const context = await myWindow.getContext();
    
    setWindowContext({ symbol: context.symbol });

    myWindow.onContextUpdated((context) => {
        if (context) {
            setWindowContext({ symbol: context.symbol });
        };
    });
};
```

Now when you click on a stock in the **Stocks** app, the **Stock Details** app will open below it in the Workspace, showing information about the selected stocks.

## Congratulations!

You have successfully completed the [**Glue42 Core**](https://glue42.com/core/) React tutorial! See also the [JavaScript](../javascript/index.html) and [Angular](../angular/index.html) tutorials for [**Glue42 Core**](https://glue42.com/core/).