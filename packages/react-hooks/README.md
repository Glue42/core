## Overview

**Glue42 React Hooks** package is library providing custom react hooks for Glue42 Javascript library. You can start using Glue42 features in you `ReactJS` apps.

**Glue42 React Hooks** is available as an `npm` package, which requires the Glue42 JavaScript and React libraries installed. To install the packages, navigate to the root directory of your project and run:

## Installation

```cmd
npm install --save @glue42/react-hooks @glue42/web react react-dom
```

Your `package.json` file should now have entries similar to these:

```json
{
  "dependencies": {
    "@glue42/web": "^1.0.0",
    "@glue42/react-hooks": "1.0.0",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"
  }
}
```

_Keep in mind that the versions of the dependencies will probably be different from the example here due to newer package releases._

## Reference

**Glue42 React Hooks** package offers a way to integrate you application with Glu42 Javascript library.
This is achieved via [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [React Context](https://reactjs.org/docs/context.html).

- [GlueProvider](#glueccontainer)
- [GlueContext](#gluecontext)
- [useGlue hook](#useglue)
- [useGlueInit hook](#useglueinit)

### GlueProvider

**GlueProvider** is a React Context Provider which initializes Glue with a given configuration and sets the **glue** API object as the context value.

#### Props

| Property      | Type                          | Description                                                     | Default                        |
| ------------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------ |
| `children`    | `React.node`                  | React Elements which can include glue related logic             | -                              |
| `config`      | TODO: link to glue object     | **Optional** Configuration object for Glue factory function     | TODO: link to glue object type |
| `glueFactory` | TODO: link to glue factory fn | **Optional** Factory function used to initialize Glue           | `window.Glue`                  |
| `fallback`    | `React.node`                  | **Optional** React Component to display while initializing Glue | null                           |

Example:

```javascript
import { GlueProvider } from "glue42/react-hooks";

ReactDOM.render(
  <GlueProvider fallback={<h2>Loading...</h2>}>
    <YourApplication />
  </GlueProvider>,
  document.getElementById("root")
);
```

### GlueContext

**GlueContext** is the React Context which is used by **GlueProvider**. You can consume this context anywhere inside you app with the **useContext** default hook.

Example:

```javascript
import { GlueContext } from "glue42/react-hooks";
import { useContext } from "react";

export const App = () => {
  const glue = useContext(GlueContext);
  return <pre>{JSON.stringify(glue.windows.my().context)}</pre>;
};
```

### useGlue

**useGlue** is a React hook which will invoke a callback passed by the developer. It can include any glue or non-glue related code.
The callback is invoked with _glue_ object and developer defined _dependencies_ as arguments.

| Property                          | Type                        | Description                                                                                                                                                                                                                                       | Default                            |
| --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `callback`                        | `function`                  | A/synchronous function which can possibly return a value                                                                                                                                                                                          | -                                  |
| `callback.arguments.glue`         | TODO: link to glue object   | `glue` object API variable                                                                                                                                                                                                                        | TODO: link to glue object variable |
| `callback.arguments.dependencies` | `array`                     | **Optional** User defined variables spread as arguments                                                                                                                                                                                           | `[]`                               |
| `callback.returnValue`            | `Promise | variable | void` | Value returned(if such) will be returned by the hook and this will trigger component re-render                                                                                                                                                    | -                                  |
| `dependencies`                    | `array`                     | User defined variables used to repeat invocation of the hook logic, based on if their values have changed(same functionlity as React Hook [useEffect](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)) | `[]`                               |
| `returnValue`                     | `any`                       | The return value of _callback_                                                                                                                                                                                                                    | `-`                                |

Example:

```javascript
import { useGlue } from "@glue42/react-hooks";

export const Application = () => {
  const openWindow = useGlue(glue => (name, url) => {
    glue.windows.open(name, url);
  });
  return (
    <button
      onClick={() => {
        openWindow("ClientList", "http://localhost:8080/client-list");
      }}
    >
      Start
    </button>
  );
};
```

```javascript
import { useGlue } from "@glue42/react-hooks";
import { useState } from "react";

export const Application = () => {
  const [title, setTitle] = useState("");
  const getTitle = useGlue(glue => methodName => {
    glue.interop.invoke(methodName).then(r => setTitle(r.returned._result));
  });
  return (
    <>
      <h2>{title}</h2>
      <button
        onClick={() => {
          getTitle("T42.Demo.GetTitle");
        }}
      >
        Get Title
      </button>
    </>
  );
};
```

### useGlueInit

**useGlueInit** is a React Hook which takes care for initializing Glue library. It can be to customize the initialization logic for Glue integration within you application.

| Property      | Type                          | Description                                                 | Default                            |
| ------------- | ----------------------------- | ----------------------------------------------------------- | ---------------------------------- |
| `config`      | TODO: link to Glue config     | **Optional** Configuration object for Glue factory function | TODO: link to Glue config defaults |
| `glueFactory` | TODO: link to Glue factory fn | **Optional** Factory function used to initialize Glue       | `window.Glue`                      |

Example:

```javascript
import "glue42/web";
import { useGlueInit } from "@glue42/react-hooks";

export const Application = () => {
  const glue = useGlueInit();
  return glue ? <App glue={glue} /> : <Loader />;
};
```

## Setup

### Adding the Glue Provider

Add **GlueProvider** component by wrapping your other components inside (preferably the **Root** one):

```javascript
//index.js
import "glue42/web";
import { GlueProvider } from "glue42/react-hooks";

ReactDOM.render(
  <GlueProvider>
    <Root />
  </GlueProvider>,
  document.getElementById("root")
);
```

### **useGlue** hook

Now you can start using Glue42 idiomatically in the context of ReactJS via hooks in your functional components:

```javascript
import { useGlue } from "@glue42/react-hooks";

const Application = () => {
  const openWindow = useGlue(glue => (name, url) => {
    glue.windows.open(name, url);
  });
  return (
    <table>
      <tr>
        <td> Client List </td>
        <td>
          <button
            onClick={() => {
              openWindow("ClientList", "http://localhost:8080/client-list");
            }}
          >
            Start
          </button>
        </td>
      </tr>
      <tr>
        <td> Client Portfolio </td>
        <td>
          <button
            onClick={() => {
              openWindow(
                "ClientPortfolio",
                "http://localhost:8080/client-portfolio"
              );
            }}
          >
            Start
          </button>
        </td>
      </tr>
      <tr>
        <td> Stock Details </td>
        <td>
          <button
            onClick={() => {
              openWindow("StockDetails", "http://localhost:8080/stock-details");
            }}
          >
            Start
          </button>
        </td>
      </tr>
    </table>
  );
};

export default Application;
```

### Get Glue by **GlueContext**

Using the built in React hook **useContext** you can get directly the global **glue** object and do whatever you want:

```javascript
import { useContext, useState, useEffect } from "react";
import { GlueContext } from "@glue42/react-hooks";

const Application = () => {
  const [context, setContext] = useState({});
  const glue = useContext(GlueContext);
  useEffect(() => {
    setContext(glue.windows.my().context);
  }, []);

  return (
    <div>
      <h2>My Window Context</h2>
      <pre>{JSON.stringify(context, null, 4)}</pre>
    </div>
  );
};

export default Application;
```

### Use your own glue factory function for initializing glue. Useful in jest/enzyme tests when you are mocking glue:

```javascript
//index.js
import "glue42/web";
import { mount } from "enzyme";
import { GlueProvider } from "glue42/react-hooks";

// url location of the shared worker
const glueFactory = () => {
  const glueObject = {
    interop: { invoke: jest.fn(), register: jest.fn() },
    contexts: { subscribe: jest.fn(), update: jest.fn() },
    windows: { open: jest.fn(), my: jest.fn() }
  };
  return Promise.resolve(glueObject);
};

describe("Mock Glue", () => {
  it("should mock glue", () => {
    const wrapper = mount(
      <GlueProvider glueFactory={glueFactory}>
        <Root />
      </GlueProvider>
    );
    // do whatever you want
  });
});
```

_You might also checkout the "@testing-library/react-hooks" for testing your react hooks_

### **useGlueInit** hook so you can render conditionally your app when glue is initialized:

```javascript
import "glue42/web";
import { useGlueInit } from "@glue42/react-hooks";

export const Application = () => {
  const glue = useGlueInit();
  return glue ? <App glue={glue} /> : <Loader />;
};
```

_You need to take care of the way you provide glue object to your nested components(with React Context or attaching it to the window variable)_
