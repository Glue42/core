## Overview

The [**Glue42 React Hooks**](https://www.npmjs.com/package/@glue42/react-hooks) package is a library providing custom React hooks for the Glue42 Javascript libraries - [@glue42/web](../../../../reference/core/latest/glue42%20web/index.html), if you are working on a **Glue42 Core** project, or [@glue42/desktop](../../../../reference/glue/latest/glue/index.html), if you are working on a **Glue42 Enterprise** project. The examples below use the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library. The Glue42 React Hooks library allows you to start using Glue42 features in your React apps idiomatically in the context of the React framework.

## Prerequisites

The Glue42 React Hooks library comes with the latest version of the Glue42 Web, but requires React and ReactDOM libraries installed. To install the packages, navigate to the root directory of your project and run:

```cmd
npm install --save @glue42/react-hooks react react-dom
```

Your `package.json` file should now have the following dependencies:

```json
{
    "dependencies": {
        "@glue42/react-hooks": "1.0.7",
        "react": "^16.13.1",
        "react-dom": "^16.13.1"
    }
}
```

*Keep in mind that the versions of the dependencies will probably be different from the example here due to newer package releases.*

## Library Features

The Glue42 React Hooks library offers a way to consume the APIs of the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library in your web applications via [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [React Context](https://reactjs.org/docs/context.html). The Glue42 React Hooks library provides the following features described below.

### Context

- #### GlueProvider

The `GlueProvider` is a React context provider component. It invokes a factory function (with default or user-defined configuration) which initializes the Glue42 Web library. The `glue` object returned from the factory function is set as the context value.

Below is the signature of the `GlueProvider` component:

```typescript
GlueProviderProps {
    children: ReactNode;
    glueFactory: (config?: Glue42Web.Config | Glue42.Config) => Promise<Glue42Web.API | Glue42.Glue>;
    fallback?: NonNullable<ReactNode> | null;
    config?: Glue42Web.Config;
};

GlueProvider: FC<GlueProviderProps>;
```

- `children` - React components which may contain Glue42 related logic;
- `glueFactory` - Factory function used to initialize the Glue42 Web library (the factory function returned by either `@glue42/web` or `@glue42/desktop`). Defaults to `window.GlueWeb`.
- `fallback` - *Optional*. A React component to display while initializing Glue42;
- `config` - *Optional*. A [Config](../../../../reference/core/latest/glue42%20web/index.html#Config) object for the `GlueWeb()` factory function (for detailed configuration options, see the [**Glue42 Client: Overview**](../overview/index.html#initializing_a_glue42_client) section);

- #### GlueContext

`GlueContext` is the React context which is used by the `GlueProvider` component. You can consume this context from anywhere inside you app with the default React hook `useContext()`.

```typescript
GlueContext: Context<Glue42Web.API | Glue42.Glue>;
```

### Hooks

- #### useGlue()

The `useGlue()` hook is a React hook which will invoke the callback that you pass to it.

Below is the signature of `useGlue()`:

```typescript
<T = undefined>(
    cb: (glue: Glue42Web.API | Glue42.Glue, ...dependencies: any[]) => void | T | Promise<T>,
    dependencies?: any[]
) => T;
```

- `cb` - **Required**. A sync/async callback function that will be invoked with the `glue` object and an array of user-defined `dependencies`. The callback may or may not include any Glue42-related code;
    - `glue` - the object returned from the initialization of either the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) or [**Glue42 Desktop**](../../../../reference/glue/latest/glue/index.html) libraries;
    - `dependencies` -  additional user-defined arguments for the callback;
- `dependencies` - *Optional*. An array of user-defined variables that will trigger the invocation of the provided callback based on whether the value of any of the specified variables has changed (same functionality as the [`useEffect()`](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) React hook).

- #### useGlueInit()

The `useGlueInit()` hook is a React hook which initializes the provided Glue JS library. It accepts an *optional* [Glue42Web.Config](../../../../reference/core/latest/glue42%20web/index.html#Config) object and a Glue42 factory function as arguments.

```typescript
useGlueInitProps = (
    config: Glue42Web.Config | Glue42.Config,
    glueFactory: GlueProviderProps["glueFactory"]
) => Glue42Web.API;

useGlueInit: useGlueInitProps;
```

- `config` - *Optional*. A [Glue42Web.Config](../../../../reference/core/latest/glue42%20web/index.html#Config) object for the `GlueWeb()` factory function (for detailed configuration options, see the [**Glue42 Client: Overview**](../overview/index.html#initializing_a_glue42_client) section);
- `glueFactory` - *Optional*. Factory function used to initialize the provided Glue JS library. Defaults to `window.GlueWeb`.

## Usage

Below you can see some examples of using the Glue42 React Hooks library.

### Initialization

To access the Glue42 Web APIs, you need to initialize and (optionally) configure the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library (for detailed configuration options, see the [**Glue42 Client: Overview**](../overview/index.html#initializing_a_glue42_client) section). You can do this in two ways - by using the `GlueProvider` component or the `useGlueInit()` hook. The difference is that the `GlueProvider` initializes the Glue42 Web library and makes the returned API object (`glue`) globally available by automatically assigning it as a value to `GlueContext`, while the `useGlueInit()` hook initializes the library and returns an API object (`glue`) which you then have to make available to your other components by passing it as a prop, by creating a context or by attaching it to the global `window` object.

- #### GlueProvider

Add the `GlueProvider` component by wrapping your other components inside it (preferably the root one). Pass the factory function from `@glue42/web` to the `GlueProvider`, it will initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library and make the Glue42 Web APIs available in your application by setting a `glue` object (returned from the initialization) as the value of `GlueContext`:

```javascript
//index.js
import GlueWeb from "@glue42/web";
import { GlueProvider } from "glue42/react-hooks";

ReactDOM.render(
    // Wrap your root component in the `GlueProvider` in order
    // to be able to access the Glue42 Web APIs from all child components.
    <GlueProvider fallback={<h2>Loading...</h2>} glueFactory={GlueWeb}>
        <App />
    </GlueProvider>,
    document.getElementById("root")
);
```

- #### useGlueInit()

You can also initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library with the `useGlueInit()` hook. Below is an example of conditional rendering of a component based on whether the Glue42 Web API is available or not. 

```javascript
import GlueWeb from "@glue42/web";
import { useGlueInit } from "@glue42/react-hooks";

const App = () => {
    // Example custom configuration for the Glue42 Web library.
    const config = {
        extends: false,
        worker: "./lib/worker.js"
    }
    const glue = useGlueInit(config, GlueWeb);

    return glue ? <Main glue={glue} /> : <Loader />;
};

export default App;
```

Remember that when you initialize the Glue42 Web library with the `useGlueInit()` hook, you need to take care of the way you provide the `glue` object to your nested components. For example, you can use React Context or attach it to the global `window` variable.

### Consuming Glue42 Web APIs

After the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library has been successfully initialized, you can access the Glue42 Web APIs with the built-in React hook `useContext()` and passing `GlueContext` as its argument, or with the `useGlue()` hook. 

**Note** that this library is just a thin wrapper designed to work with both `@glue42/web` and `@glue42/desktop`. For that reason, if you are using react with typescript you should type cast the initialized glue object to the appropriate type, because the default type is `Glue42Web.API | Glue42.Glue`;

- #### GlueContext

Below is an example of accessing the `glue` object with `GlueContext` and using the [Shared Contexts](../../../../reference/core/latest/shared%20contexts/index.html) API to get the context of the current window:

```javascript
import { useContext, useState, useEffect } from "react";
import { GlueContext } from "@glue42/react-hooks";

const App = () => {
    const [context, setContext] = useState({});
    // Access the Glue42 Web APIs by using the `glue` object 
    // assigned as a value to `GlueContext` by the `GlueProvider` component.
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

export default App;
```

- #### useGlue()

Below is an example of accessing the `glue` object with the `useGlue()` hook and using the [Window Management](../../../../reference/core/latest/windows/index.html) API to open an app in a new window on button click:

```javascript
import { useGlue } from "@glue42/react-hooks";

const App = () => {
    const openWindow = useGlue(glue => (name, url) => {
        glue.windows.open(name, url);
    });

    return (
        <table>
            <tr>
                <td>Client List</td>
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
        </table>
    );
};

export default App;
```

This is an example of using the [Interop](../../../../reference/core/latest/interop/index.html) API to get the window title through an already registered Interop method:  

```javascript
import { useGlue } from "@glue42/react-hooks";
import { useState } from "react";

const App = () => {
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

export default App;
```

### Testing

You can use your own factory function for initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library. This is useful in Jest/Enzyme tests when you want to mock the Glue42 library: 

```javascript
//index.js
import "glue42/web";
import { mount } from "enzyme";
import { GlueProvider } from "glue42/react-hooks";

// Define a factory function which will mock the Glue42 Web library.
const glueFactory = () => {
    const glueObject = {
        interop: { invoke: jest.fn(), register: jest.fn() },
        contexts: { subscribe: jest.fn(), update: jest.fn() },
        windows: { open: jest.fn(), my: jest.fn() }
    };

    return Promise.resolve(glueObject);
};

describe("Mock Glue42", () => {
    it("Should mock the Glue42 library.", () => {
        const wrapper = mount(
        // Pass your factory function to the `GlueProvider` component.
        <GlueProvider glueFactory={glueFactory}>
            <App />
        </GlueProvider>
        );
        // Your logic here.
    });
});
```

*For additional information on testing React hooks, see the [@testing-library/react-hooks](https://www.npmjs.com/package/@testing-library/react-hooks).*