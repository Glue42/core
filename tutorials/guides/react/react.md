## Overview

This tutorial will teach React developers how they can use **Glue42 Core** in their applications using `glue42\react-hooks` package.
These are PWA applications which work both in browser or can be installed as standalone application.
Tutorials include two separate applications(Clients, Stocks) bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
These applications expose 3 views/windows:

- [Clients](http://localhost:4242/clients) - Displays a list of clients
- [Stocks](http://localhost:4242/stocks) - Displays a list of stocks
- [Stock Details](http://localhost:4242/details) - Displays details for a stock after you click on a stock from the previous app

These links will be available once you pass [Getting Started with the Glue42](#12-getting-started-with-the-glue42-core-cli) section
As an end result our users want to be able to run two apps as Progressive Web Apps in separate windows, in order to take advantage of their multi-monitor setups. Also, our users want those apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected, the stocks app should show only that client's stocks and more, which you will learn along the way.

## Prerequisites

[Glue42 Core](glue42-core/what-is-glue42-core/introduction/index.html)

[Glue42 Web API](../../reference/core/latest/glue42%20web/index.html)

Javascript programming language(ECMAScript 6 or later)

[React Framework ](reactjs.org)

[Create React App](https://reactjs.org/docs/create-a-new-react-app.html)

[React Hooks](https://reactjs.org/docs/hooks-intro.html)

## Tutorial Structure

The tutorial code is available for download at [GitHub](https://github.com/Glue42/core), tutorials directory. Clone the repo and you will get the latest version of the tutorial code

The tutorial directory is organized as follows:

- config - application configurations for Glue42 Core
- solution - the full tutorial solution
  - Clients - CRA clients application
  - Stocks - CRA stocks application
  - config - configuration for glue
- start - the start app skeleton
  - Clients - CRA clients application
  - Stocks - CRA stocks application
- ..\rest-server - REST server for applications data

Tutorial is broken into 4 parts, each demonstrating different Glue42 Core capabilities, and each part will depend on the completion of the previous ones.

## Running solution

Naturally, we have also included a full tutorial solution, which follows the application structure set in the startup skeleton.
In order to make it work head over to solution directory and run:

`npm install --global @glue42/cli-core`

`npm install`

`glueec serve`

## 1. Setting up

### 1.1. Getting Started with the Tutorial Files

Open three terminals/command line prompts and navigate to both apps and rest-server:

`cd tutorials\react\start\Clients`

`cd tutorials\react\start\Stocks`

`cd tutorials\rest-server`

Run `yarn install` or `npm install` in all

Let's go through the resources we have there for Stocks and Clients apps:

- `/public` - holds static assets for each application including a `manifest.json`, `sw`(service worker), icons and `index.html` file.
- `/src` - holds our main entry point `index.js` and the `Clients.jsx` react component. Also `glue.js`(methods for glue interaction), some `.css` files and `serviceWorker` which only registers the app service worker. `setupProxy` defines proxy for `/api` like requests.
- `.env` - environment variables for our CRA. In the case of Stocks also an entry point
- `config-overrides.js` - defines additional webpack config to resolve `react` and `react-dom` modules from within he node_modules in the current directory.
- `package.json` - currently has one dependency - a simple http server to serve our start files.

In all directories run:

`yarn start` or `npm start`

Runs the Rest server.
Runs Clients app on port 3000 and Stocks app on port 3001.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### 1.2. Getting Started with the Glue42 Core CLI

Now we are going to use the [**Glue42 Core CLI**](../../glue42-core/what-is-glue42-core/core-concepts/cli/index.html) to initiate our environment. To do that you need to:

`npm install --global @glue42/cli-core`
`gluec init`

This command will get the necessary dependencies and scaffold the necessary config files for us. Next, we are going to stop using the simple http server that comes with the start files and utilize the CLI's serve functionality. This is very useful, as it allows us to serve or proxy to our apps, define shared resources and serve the [**Glue42 Core Environment**](../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) correctly.

To do all of that open the `glue.config.dev.json` file. Then add the shared resources, the clients and stocks apps. You can check out how to do that in the [Getting Started](https://github.com/Glue42/core/blob/master/docs/glue42-core/02_getting-started/02_setting-environment/01_single-application/single-application.md) section Your file should look something like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
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

Next we open a terminal and:

`gluec serve`

This command will launch a dev server at port **:4242** and will serve everything we defined, together with the [**Glue42 Core Environment**](../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html).

Now you can once again open your apps, but this time at `localhost:4242` and see that nothing really changed, at least that's how it seems. Do **note** that you will need to install the apps again and preferably remove the old onces, because the old once will route to port **:4000**.

## 2. Initializing Glue

Your first task is to initialize Glue in all three applications.
Therefore we first need to get the glue package as a module:

```
npm install @glue42/web --save
```

Inside `.\index.js` file import `glue42/web` and `glue42/react-hooks` libraries

```javascript
//index.js
import "@glue42/web";
import { GlueProvider } from "@glue42/react-hooks";
```

Wrap your `App` component with `GlueProvider` so you can consume the `glue` object later.
@

```javascript
ReactDOM.render(
  <GlueProvider>
    <App />
  </GlueProvider>,
  document.getElementById("root")
);
```

Add the following JSX code into `render` method inside `<div className="container-fluid">` of all three components(Client.jsx, Stocks.jsx, StockDetails.jsx)
Import `GlueContext` and react hook `useContext`, so you can pick the glue object variable from the context inside the components.

```javascript
// Clients\src\Clients.jsx, Stocks\src\Stocks.jsx, Stocks\src\StockDetails.jsx
<div className="row">
  <div className="col-md-2">
    {!glue && (
      <span id="glueSpan" className="badge badge-warning">
        Glue is unavailable
      </span>
    )}
    {glue && (
      <span id="glueSpan" className="badge badge-success">
        Glue is available
      </span>
    )}
  </div>
  <div className="col-md-8">
    <h1 className="text-center">Clients</h1>
  </div>
</div>
```

Again in all three files import `GlueContext` and react hook `useContext`, so you can pick the glue object variable from the context inside the components.

```javascript
// Clients\src\Clients.jsx, Stocks\src\Stocks.jsx, Stocks\src\StockDetails.jsx
import { useContext } from "react";
import { GlueContext } from "@glue42/react-hooks";

function Clients() {
  const glue = useContext(GlueContext);
}
```

If everything is ok, reload your applications and you should see a small green label at the top left corner of your application saying `Glue is available`.

## 2. Interop

### Overview

At the end of this Clients application should set the context of the Stocks application via `glue.interop` method invocation. In result the stocks app will fetch the stocks inside this client's portfolio and display them. Keep the [**Interop API**](../../reference/core/latest/interop/index.html) close by for reference.

### 2.1. Methods registration

Stocks application needs to register a `glue.interop` method, which will be invoked by the Client. On method invocation Stocks will execute a handler for setting the client in his state and fetch his stocks.
Register an interop method inside `glue.js` file where all the glue related code will remain. Internally the `useGlue` hook will invoke the callback and will pass `glue` as first argument.

```javascript
// Stocks\src\glue.js
import { SET_CLIENT_METHOD } from "./constants";

export const registerSetClientMethod = setClient => glue => {
  glue.interop.register(SET_CLIENT_METHOD, setClient);
};
```

In `Stocks.jsx` with `useGlue` hook register that method, by also providing the setClient method from one `useState` hook.

```javascript
// Clients\src\Clients.jsx
import { useState } from "react";
import { useGlue } from "@glue42/react-hooks";

function Stocks() {
  const [{ clientId, clientName }, setClient] = useState({});
  useGlue(registerSetClientMethod(setClient));
}
```

Modify the `fetchPortfolio` function inside existing `useEffect` hook to fetch client stocks if we have a client in state.
We will also pass `[clientId]` as `useEffect` dependence, so that handler inside can execute upon change of this variable.

```javascript
// Clients\src\Clients.jsx
useEffect(() => {
  const fetchPortfolio = async () => {
    try {
      const url = clientId ? `/api/portfolio/${clientId}` : "/api/portfolio";
      const response = await fetch(url, REQUEST_OPTIONS).then(r => r.json());
      setPortfolio(response);
    } catch (e) {
      console.log(e);
    }
  };
  fetchPortfolio();
}, [clientId]);
```

Add an element to show `clientId` and `clientName` above `<div className="col-md-12"><table id="portfolioTable" className="table table-hover">` in the returned JSX structure by Stocks app.

```javascript
// Clients\src\Clients.jsx
{
  clientId && (
    <h2 className="p-3">
      Client {clientName} - {clientId}
    </h2>
  );
}
```

### 2.2. Methods discovery and invocation

Now we need to invoke the interop method in `Clients.jsx` upon clicking on a client row from the table.
Again we will use the `useGlue` hook method to compose a handler which will invoke the interop method registered by Stocks upon clicking on client row.
Also we will add logic to this invoke method to first check if such method is registered.

```javascript
// Clients\src\glue.js
import { SET_CLIENT_METHOD } from "./constants";

export const setClientPortfolioInterop = glue => ({ clientId, clientName }) => {
  const isMethodRegistered = glue.interop
    .methods()
    .find(({ name }) => name === SET_CLIENT_METHOD.name);
  if (isMethodRegistered) {
    glue.interop.invoke(SET_CLIENT_METHOD.name, { clientId, clientName });
  }
};
```

Inside `Clients.jsx` we will compose this event method handler, so we can attach it as an onclick handler.
The `setClientPortfolioInterop` will be invoked by the `useGlue` hook like this `setClientPortfolioInterop(glue)`.
As the result you return a function which will be our onClick handler.

```javascript
// Clients\src\Clients.jsx
import { setClientPortfolioInterop } from "./glue";
import { useGlue } from "@glue42/react-hooks";
function Clients() {
  const onClick = useGlue(setClientPortfolioInterop);
}
```

Add the onClick property for every client row

```javascript
// Clients\src\Clients.jsx
<tbody>
  {clients.map(({ name, pId, gId, accountManager, portfolio }) => (
    <tr
      key={pId}
      onClick={() => onClick({ clientId: gId, clientName: name, portfolio })}
    >
      <td>{name}</td>
      <td>{pId}</td>
      <td>{gId}</td>
      <td>{accountManager}</td>
    </tr>
  ))}
</tbody>
```

Everything should be ok now to test the logic. First open both Clients and Stocks application and click on a client.
Observe the stocks table changes. Then close the Stocks application, click on a client row from Clients and start the Stocks app.
Observe the stocks table displays only the stocks for latest client clicked.

## 3. Window Management and Stream Registration

### Overview

In this example you will extend the applications so that: - On stock row click from Stocks app, a new window will open showing the StockDetails. You will open this window with following bounds `top: 100, left: 100, height: 660, width: 660` - You will create a `glue.interop` stream in Stocks which will publish prices for instruments. Both Stocks and StockDetails will subscribe for that stream to display most current price. Keep the [**Window Management API**](../../reference/core/latest/windows/index.html) close by for reference.

### 3.1. Opening windows at runtime

First create the function which will open a new window upon clicking on an instrument row from Stocks app. We will use the `glue.windows.open` function which does that.
The 1st argument(Window Name) must be unique, cause we may open several StockDetails windows and glue will fail if we provide one and the same name.

```javascript
// Stocks\src\glue.js
export const openStockDetails = glue => symbol => {
  glue.windows.open(
    `StockDetailsReact${Math.random().toFixed(2) * 100}`,
    `http://${window.location.host}/details`,
    { top: 100, left: 100, height: 660, width: 660, context: { symbol } }
  );
};
```

### 3.2. Window Settings

Additionally we will pass the 2nd argument to define window bounds.

```javascript
// Stocks\src\glue.js
export const openStockDetails = glue => symbol => {
  glue.windows.open(
    `StockDetailsReact${Math.random().toFixed(2) * 100}`,
    `http://${window.location.host}/details`,
    { top: 100, left: 100, height: 660, width: 660 }
  );
};
```

### 3.3. Window Context

Every glue window has it's own context which can be defined at start or updated later. You will pass the symbol as window context:

```javascript
// Stocks\src\glue.js
export const openStockDetails = glue => symbol => {
  glue.windows.open(
    `StockDetailsReact${Math.random().toFixed(2) * 100}`,
    `http://${window.location.host}/details`,
    { top: 100, left: 100, height: 660, width: 660, context: { symbol } }
  );
};
```

Add also a function which will pick up the window context.

```javascript
// Stocks\src\glue.js
export const getMyWindowContext = glue => glue.windows.my().context;
```

Now go to Stocks app and consume this function with the help of the `useGlue` hook.

```javascript
// Stocks\src\Stocks.jsx
import { useGlue } from "@glue42/react-hooks";
import { openStockDetails } from "./glue";

function Stocks() {
  const onClick = useGlue(openStockDetails);
}
```

Attach the event handler for each instrument row in Stocks table by replacing the existing `onClick` property.

```javascript
// Stocks\src\Stock.jsx

<tbody>
  {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
    <tr onClick={() => onClick({ ...rest, RIC, Description })} key={RIC}>
      <td>{RIC}</td>
      <td>{Description && Description.toUpperCase()}</td>
      <td className="text-right">{prices[RIC] ? prices[RIC].Bid : Bid}</td>
      <td className="text-right">{prices[RIC] ? prices[RIC].Ask : Ask}</td>
    </tr>
  ))}
</tbody>
```

Finally go to StockDetails to pick the window context using the `GlueContext` object and display information for this stock.
Replace the existing code for picking up the information.

```javascript
// Stocks\src\StockDetails.jsx
import { useContext } from "react";
import { useGlue, GlueContext } from "@glue42/react-hooks";
import { getMyWindowContext } from "./glue";

function StockDetails() {
  const glue = useContext(GlueContext);
  const windowContext = useGlue(getMyWindowContext);
  // const { RIC, BPOD, Bloomberg, Description, Exchange, Venues, Bid, Ask } =
  // JSON.parse(sessionStorage.getItem('stock')) || {};
  const {
    symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues } = {}
  } = windowContext || {};
}
```

Now you can try and click on a Stock row. Observe a new window opens every time you clicked.

### 3.4. Stream Registration and Publishing

Next you will write the function which will create a glue stream and publish instrument prices.
You want this stream to regularly push new price updates so we will use the `setInterval` method.
You will generate random prices for each instrument.
`glue.interop.createStream` returns a stream object which we are consuming in our `publishInstrumentPrice` handler.

```javascript
// Stocks\src\glue.js
import { SET_PRICES_STREAM } from "./constants";

export const createInstrumentStream = glue =>
  glue.interop.createStream(SET_PRICES_STREAM).then(publishInstrumentPrice);

export const publishInstrumentPrice = stream => {
  setInterval(() => {
    const stocks = {
      "VOD.L": {
        Bid: Number(70 - Math.random() * 10).toFixed(2),
        Ask: Number(70 + Math.random() * 10).toFixed(2)
      },
      "TSCO.L": {
        Bid: Number(90 - Math.random() * 10).toFixed(2),
        Ask: Number(90 + Math.random() * 10).toFixed(2)
      },
      "BARC.L": {
        Bid: Number(105 - Math.random() * 10).toFixed(2),
        Ask: Number(105 + Math.random() * 10).toFixed(2)
      },
      "BMWG.DE": {
        Bid: Number(29 - Math.random() * 10).toFixed(2),
        Ask: Number(29 + Math.random() * 10).toFixed(2)
      },
      "AAL.L": {
        Bid: Number(46 - Math.random() * 10).toFixed(2),
        Ask: Number(46 + Math.random() * 10).toFixed(2)
      },
      "IBM.N": {
        Bid: Number(70 - Math.random() * 10).toFixed(2),
        Ask: Number(70 + Math.random() * 10).toFixed(2)
      },
      "AAPL.OQ": {
        Bid: Number(90 - Math.random() * 10).toFixed(2),
        Ask: Number(90 + Math.random() * 10).toFixed(2)
      },
      "BA.N": {
        Bid: Number(105 - Math.random() * 10).toFixed(2),
        Ask: Number(105 + Math.random() * 10).toFixed(2)
      },
      "TSLA:OQ": {
        Bid: Number(29 - Math.random() * 10).toFixed(2),
        Ask: Number(29 + Math.random() * 10).toFixed(2)
      },
      "ENBD.DU": {
        Bid: Number(46 - Math.random() * 10).toFixed(2),
        Ask: Number(46 + Math.random() * 10).toFixed(2)
      },
      "AMZN.OQ": {
        Bid: Number(29 - Math.random() * 10).toFixed(2),
        Ask: Number(29 + Math.random() * 10).toFixed(2)
      },
      "MSFT:OQ": {
        Bid: Number(46 - Math.random() * 10).toFixed(2),
        Ask: Number(46 + Math.random() * 10).toFixed(2)
      }
    };
    stream.push(stocks);
  }, 1500);
};
```

Now create the stream in Stocks application with the `useGlue` hook. The `useGlue` callback argument is invoked only once, unless you specify the second argument `dependencies` array which triggers again the callback when one or more dependency value changes.
In general you want to execute this function only once, cause you don't want to create several streams, but just one.

```javascript
// Stocks\src\Stocks.jsx
import { useGlue } from "@glue42/react-hooks";
import { createInstrumentStream } from "./glue";

function Stocks() {
  useGlue(createInstrumentStream);
}
```

### Stream Subscriptions

You will now subscribe for that stream inside the same Stocks application and update the prices in component's state.
You will also be using the symbol which can be one(string) in the case of StockDetails and several(array) in the case of Stocks app.

```javascript
// Stocks\src\glue.js
import { SET_PRICES_STREAM } from "./constants";

export const subscribeForInstrumentStream = handler => async (glue, symbol) => {
  if (symbol) {
    const subscription = await glue.interop.subscribe(SET_PRICES_STREAM);
    subscription.onData(({ data: stocks }) => {
      if (symbol && stocks[symbol]) {
        handler(stocks[symbol]);
      } else if (Array.isArray(symbol)) {
        handler(stocks);
      }
    });
    subscription.onFailed(console.log);

    return subscription;
  }
};
```

Next add the related code to subscribe for the stream in Stocks application.
You will also close the stream subscription(unsubscribe) whenever the Stocks app receives a new client and the subscribe again for that stream.
In this case the stream is publishing all possible portfolio prices and there is no need to unsubscribe and subscribe on every new client.
However in a real application this use case exists. Let's add the glue related code for the subscription. If an application is close its methods, streams, or subscriptions are automatically unregistered/closed by glue.
When initializing the subscription we are passing `[portfolio]` as 2nd `useGlue` hook parameter, cause we want to execute the callback(subscribe) again when a new client portfolio is set in state.

```javascript
// Stocks\src\Stocks.jsx
import React, { useContext, useEffect, useState } from "react";
import { useGlue, GlueContext } from "@glue42/react-hooks";
import { REQUEST_OPTIONS } from "./constants";
import {
  createInstrumentStream,
  openStockDetails,
  registerSetClientMethod,
  subscribeForInstrumentStream
} from "./glue";

function Stocks() {
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [{ clientId, clientName }, setClient] = useState({});
  useGlue(registerSetClientMethod(setClient));
  useGlue(createInstrumentStream);
  const subscription = useGlue(
    (glue, portfolio) => {
      if (portfolio.length > 0) {
        return subscribeForInstrumentStream(setPrices)(glue, portfolio);
      }
    },
    [portfolio]
  );
  const onClick = useGlue(openStockDetails);
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        subscription &&
          typeof subscription.close === "function" &&
          subscription.close();
        const url = clientId ? `/api/portfolio/${clientId}` : "/api/portfolio";
        const response = await fetch(url, REQUEST_OPTIONS).then(r => r.json());
        setPortfolio(response);
      } catch (e) {
        console.log(e);
      }
    };
    fetchPortfolio();
  }, [clientId]);

  const glue = useContext(GlueContext);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          {!glue && (
            <span id="glueSpan" className="badge badge-warning">
              Glue is unavailable
            </span>
          )}
          {glue && (
            <span id="glueSpan" className="badge badge-success">
              Glue is available
            </span>
          )}
        </div>
        <div className="col-md-8">
          <h1 id="title" className="text-center">
            Stocks
          </h1>
        </div>
      </div>
      <div className="row">
        {clientId && (
          <h2 className="p-3">
            Client {clientName} - {clientId}
          </h2>
        )}
        <div className="col-md-12">
          <table id="portfolioTable" className="table table-hover">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Description</th>
                <th className="text-right">Bid</th>
                <th className="text-right">Ask</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
                <tr
                  onClick={() => onClick({ ...rest, RIC, Description })}
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
          </table>
        </div>
      </div>
    </div>
  );
}
```

Now if you refresh/open the Stocks app you will see how the prices(last 2 columns) update every 1.5 seconds.

Next you will subscribe for the same stream inside StockDetails app. Here you will pass the `setPrices` handler which will be triggered when the stream publishes data.
The 2nd argument `[RIC]` to `useGlue` hook will also be passed as a second argument to the callback invoked by the hook.
You need to pass only the target instrument/stock to the `setPrices` handler in this application.

```javascript
// Stocks\src\StockDetails.jsx

import React, { useState, useContext } from "react";
import { useGlue, GlueContext } from "@glue42/react-hooks";
import { subscribeForInstrumentStream, getMyWindowContext } from "./glue";

function StockDetails() {
  const [{ Bid, Ask }, setPrices] = useState({});
  const glue = useContext(GlueContext);
  const windowContext = useGlue(getMyWindowContext);
  const {
    symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues } = {}
  } = windowContext || {};
  useGlue(subscribeForInstrumentStream(setPrices), [RIC]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          {!glue && (
            <span id="glueSpan" className="badge badge-warning">
              Glue is unavailable
            </span>
          )}
          {glue && (
            <span id="glueSpan" className="badge badge-success">
              Glue is available
            </span>
          )}
        </div>
        <div className="col-md-10">
          <h1 className="text-center">Stock {RIC} Details</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <table id="clientsTable" className="table table-hover">
            <tbody>
              <tr>
                <th>RIC</th>
                <td>{RIC}</td>
              </tr>
              <tr>
                <th>BPOD</th>
                <td>{BPOD}</td>
              </tr>
              <tr>
                <th>Bloomberg</th>
                <td>{Bloomberg}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>{Description && Description.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Exchange</th>
                <td>{Exchange}</td>
              </tr>
              <tr>
                <th>Venues</th>
                <td>{Venues}</td>
              </tr>
              <tr>
                <th>Bid</th>
                <td>{Bid}</td>
              </tr>
              <tr>
                <th>Ask</th>
                <td>{Ask}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;
```

You can now observe each StockDetails window also displays a new value for Bid and Ask price columns every 1.5 seconds.

## 4. Shared Contexts

### Overview

Last example will demonstrate the use of glue shared contexts(different from window context). These contexts can be accessed by any application, so they are used as a central place for state management.

    - Client app instead of invoking a `glue.interop` method to set the client, will update a shared context with the client data.
    - Stocks and StockDetails applications will subscribe for this shared context and connect existing functionality related to the client.
    - Stock details application upon receiving a new client will check and notify user if the current instrument is not part of the current client stocks/portfolio
    - Stocks application will display a `Show All` button. Upon click, Stocks app will clear the data in the shared context. In result all stocks will be shown in the application instead only the client ones.

Keep the [**Shared Contexts API**](../../reference/core/latest/shared%20contexts/index.html) close by for reference.

### 4.1. Context Updating and Subscribing

First you will create 1 function for updating the glue shared context and 1 for subscribing for that context changes in both applications.

```javascript
// Stocks\src\glue.js, Clients\src\glue.js
import { SHARED_CONTEXT_NAME } from "./constants";

export const setClientPortfolioSharedContext = glue => ({
  clientId = "",
  clientName = "",
  portfolio = ""
}) => {
  glue.contexts.update(SHARED_CONTEXT_NAME, {
    clientId,
    clientName,
    portfolio
  });
};

export const subscribeForSharedContext = handler => glue => {
  glue.contexts.subscribe(SHARED_CONTEXT_NAME, handler);
};
```

Go to Clients app and replace the existing logic related to clicking on clients row with updating the shared context.
Just comment out the existing `onClick` handler and initialize the new one.

```javascript
// Stocks\src\Clients.jsx
import { useGlue } from "@glue42/react-hooks";
import { setClientPortfolioSharedContext } from "./glue";
function Clients() {
  const onClick = useGlue(setClientPortfolioSharedContext);
}
```

Go to Stocks application and subscribe for that context.
Add also a button which when clicked will clear this shared context.
This time you don't need to remove anything. This app basically will react to a new client set either by registering a method or subscribing to a shared context.
Observe `subscribeForSharedContext` and `updateClientContext` usage below.

```javascript
// Stocks\src\Stocks.jsx

import React, { useContext, useEffect, useState } from "react";
import { useGlue, GlueContext } from "@glue42/react-hooks";
import { REQUEST_OPTIONS } from "./constants";
import {
  createInstrumentStream,
  openStockDetails,
  registerSetClientMethod,
  subscribeForSharedContext,
  subscribeForInstrumentStream,
  setClientPortfolioSharedContext
} from "./glue";

function Stocks() {
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [{ clientId, clientName }, setClient] = useState({});
  useGlue(registerSetClientMethod(setClient));
  useGlue(subscribeForSharedContext(setClient));
  useGlue(createInstrumentStream);
  const subscription = useGlue(
    (glue, portfolio) => {
      if (portfolio.length > 0) {
        return subscribeForInstrumentStream(setPrices)(glue, portfolio);
      }
    },
    [portfolio]
  );
  const onClick = useGlue(openStockDetails);
  const updateClientContext = useGlue(setClientPortfolioSharedContext);
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        subscription &&
          typeof subscription.close === "function" &&
          subscription.close();
        const url = clientId ? `/api/portfolio/${clientId}` : "/api/portfolio";
        const response = await fetch(url, REQUEST_OPTIONS).then(r => r.json());
        setPortfolio(response);
      } catch (e) {
        console.log(e);
      }
    };
    fetchPortfolio();
  }, [clientId]);

  const glue = useContext(GlueContext);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          {!glue && (
            <span id="glueSpan" className="badge badge-warning">
              Glue is unavailable
            </span>
          )}
          {glue && (
            <span id="glueSpan" className="badge badge-success">
              Glue is available
            </span>
          )}
        </div>
        <div className="col-md-8">
          <h1 id="title" className="text-center">
            Stocks
          </h1>
        </div>
      </div>
      <button
        type="button"
        className="mb-3 btn btn-primary"
        onClick={() => updateClientContext({})}
      >
        Show All
      </button>
      <div className="row">
        {clientId && (
          <h2 className="p-3">
            Client {clientName} - {clientId}
          </h2>
        )}
        <div className="col-md-12">
          <table id="portfolioTable" className="table table-hover">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Description</th>
                <th className="text-right">Bid</th>
                <th className="text-right">Ask</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(({ RIC, Description, Bid, Ask, ...rest }) => (
                <tr
                  onClick={() => onClick({ ...rest, RIC, Description })}
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
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stocks;
```

Finally go to StockDetails app and subscribe there as well for the shared context.
You will add as well the client info(`clientIdm, clientName, portfolio`) in the state.
First you will use it to display currently selected client name and id.
Client `portfolio` you will use to check whether this instrument/stock belongs in this user's portfolio.
Observe `clientId`, `clientName` and `portfolio` usages below.

```javascript
// Stocks\src\StockDetails.jsx
import React, { useState, useContext } from "react";
import { useGlue, GlueContext } from "@glue42/react-hooks";
import {
  subscribeForInstrumentStream,
  getMyWindowContext,
  subscribeForSharedContext
} from "./glue";

function StockDetails() {
  const [{ clientId, clientName, portfolio }, setClient] = useState({});
  const [{ Bid, Ask }, setPrices] = useState({});
  const glue = useContext(GlueContext);
  const windowContext = useGlue(getMyWindowContext);
  const {
    symbol: { RIC, BPOD, Bloomberg, Description, Exchange, Venues } = {}
  } = windowContext || {};
  useGlue(subscribeForInstrumentStream(setPrices), [RIC]);
  useGlue(subscribeForSharedContext(setClient));

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          {!glue && (
            <span id="glueSpan" className="badge badge-warning">
              Glue is unavailable
            </span>
          )}
          {glue && (
            <span id="glueSpan" className="badge badge-success">
              Glue is available
            </span>
          )}
        </div>
        <div className="col-md-10">
          <h1 className="text-center">Stock {RIC} Details</h1>
        </div>
      </div>
      <div className="row">
        {clientId && (
          <>
            <h2 className="p-3">
              Client {clientName} - {clientId}{" "}
            </h2>
            {RIC && portfolio.length && !portfolio.includes(RIC) && (
              <h4 className="p-3">
                Client does not have this instrument in the portfolio
              </h4>
            )}
          </>
        )}
        <div className="col-md-12">
          <table id="clientsTable" className="table table-hover">
            <tbody>
              <tr>
                <th>RIC</th>
                <td>{RIC}</td>
              </tr>
              <tr>
                <th>BPOD</th>
                <td>{BPOD}</td>
              </tr>
              <tr>
                <th>Bloomberg</th>
                <td>{Bloomberg}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>{Description && Description.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Exchange</th>
                <td>{Exchange}</td>
              </tr>
              <tr>
                <th>Venues</th>
                <td>{Venues}</td>
              </tr>
              <tr>
                <th>Bid</th>
                <td>{Bid}</td>
              </tr>
              <tr>
                <th>Ask</th>
                <td>{Ask}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;
```

Now you can go and test the functionality that you've added.

## Congratulations

Good job, now you can go an make awesome glue-enabled React/Vanilla/Angular apps!
If you have any doubt about the code you can always checkout the full code in `tutorials/react/solution` directory.
