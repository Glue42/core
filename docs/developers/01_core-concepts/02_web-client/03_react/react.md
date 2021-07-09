## Overview

The [Glue42 React Hooks](https://www.npmjs.com/package/@glue42/react-hooks) package is a library providing custom React hooks for the Glue42 Javascript libraries - [@glue42/web](https://www.npmjs.com/package/@glue42/web) and [@glue42/web-platform](https://www.npmjs.com/package/@glue42/web-platform), if you are working on a [**Glue42 Core**](https://glue42.com/core/) project, or [@glue42/desktop](https://www.npmjs.com/package/@glue42/desktop), if you are working on a [**Glue42 Enterprise**](https://glue42.com/enterprise/) project. The examples below use the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library. The Glue42 React Hooks library allows you to start using Glue42 features in your React apps idiomatically in the context of the React framework.

## Prerequisites

The Glue42 React Hooks library comes with the latest version of Glue42 Web, but requires React and ReactDOM libraries installed. To install the packages, navigate to the root directory of your project and run:

```cmd
npm install --save @glue42/react-hooks
```

## Library Features

The Glue42 React Hooks library offers a way to consume the APIs of the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library in your web applications via [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [React Context](https://reactjs.org/docs/context.html). The Glue42 React Hooks library features are described in the next sections.

### Context

- #### GlueProvider

The `<GlueProvider />` is a React context provider component. It invokes a factory function (with default or user-defined configuration) which initializes the Glue42 Web library. The `glue` object returned by the factory function is set as the context value.

Below is the signature of the `<GlueProvider />` component:

```typescript
interface GlueInitSettings {
    web?: {
        config?: Glue42Web.Config;
        factory?: Glue42WebFactoryFunction;
    };
    webPlatform?: {
        config?: Glue42WebPlatform.Config;
        factory?: Glue42WebPlatformFactoryFunction;
    };
    desktop?: {
        config?: Glue42.Config;
        factory?: Glue42DesktopFactory;
    };
}

interface GlueProviderProps {
    children: ReactNode;
    settings: GlueInitSettings;
    fallback?: NonNullable<ReactNode> | null;
}

GlueProvider: FC<GlueProviderProps>;
```

The table below describes the properties of the `GlueInitSettings` object.

| Property | Description |
|----------|-------------|
| `web` | *Optional*. An object with two properties: `config` and `factory`. The `config` property accepts a configuration object for the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library. The `factory` property accepts the factory function exposed by Glue42 Web. You should define this object if your application is a Web Client. |
| `webPlatform` | *Optional*. An object with two properties: `config` and `factory`. The `config` property accepts a configuration object for the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library. The `factory` property accepts the factory function exposed by Glue42 Web Platform. You should define this object if your application is a [Web Platform](../../web-platform/overview/index.html) application (or "Main application") in the context of [**Glue42 Core**](https://glue42.com/core/). |
| `desktop` | *Optional*. An object with two properties: `config` and `factory`. The `config` property accepts a configuration object for the [@glue42/desktop](https://www.npmjs.com/package/@glue42/desktop) library used in [**Glue42 Enterprise**](https://glue42.com/enterprise/). The `factory` property accepts the factory function exposed by the library. You should define this object if your application is a [**Glue42 Enterprise**](https://glue42.com/enterprise/) application. |

*Note that you cannot define a `web` and `webPlatform` property at the same time, but you can define one of them together with `desktop`. This is useful if you want your application to have different initialization characteristics in [**Glue42 Core**](https://glue42.com/core/) and [**Glue42 Enterprise**](https://glue42.com/enterprise/).*

All properties are optional, but it is recommended that you provide the factory functions explicitly. If no factory functions are provided, the library will try to select an appropriate function attached to the global `window` object.

The table below describes the properties of the `GlueProviderProps` object.

| Property | Description |
|----------|-------------|
| `children` | **Required**. React components which may contain Glue42 related logic. |
| `settings` | **Required**. A settings object containing the desired factory functions and configuration objects. |
| `fallback` | *Optional*. A React component to display while initializing Glue42. |

- #### GlueContext

`GlueContext` is the React context which is used by the `<GlueProvider />` component. You can consume this context from anywhere inside you app with the default React hook `useContext()`.

```typescript
GlueContext: Context<Glue42Web.API | Glue42.Glue>;
```

### Hooks

- #### useGlue()

The `useGlue()` hook is a React hook which will invoke the callback that you pass to it.

Below is the signature of `useGlue()`:

```typescript
<K = Glue42Web.API | Glue42.Glue, T = void>(
    cb: (glue: K, ...dependencies: any[]) => T | Promise<T>,
    dependencies?: any[]
) => T;
```

| Parameter | Description |
|-----------|-------------|
| `cb` | **Required**. Async or sync callback function that will be invoked with the `glue` object and an array of user-defined `dependencies`. The callback may or may not include Glue42 related code. |
| `dependencies` | *Optional*. An array of user-defined variables that will trigger the invocation of the provided callback based on whether the value of any of the specified variables has changed (same functionality as the [`useEffect()`](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) React hook). |

- #### useGlueInit()

The `useGlueInit()` hook is a React hook which initializes the provided Glue42 JavaScript library. It accepts a **required** settings object, identical to the `GlueInitSettings` object.

```typescript
UseGlueInitFunc = (
    settings: GlueInitSettings
) => Glue42Web.API | Glue42.Glue;

useGlueInit: UseGlueInitFunc;
```

## Usage

The following examples demonstrate using the Glue42 React Hooks library.

### Initialization

To access the Glue42 Web APIs, initialize and (optionally) configure the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library. You can do this in two ways - by using the `<GlueProvider />` component or the `useGlueInit()` hook. The difference is that the `<GlueProvider />` initializes the Glue42 Web library and makes the returned API object (`glue`) globally available by automatically assigning it as a value to `GlueContext`, while the `useGlueInit()` hook initializes the library and returns an API object (`glue`) which you then have to make available to your other components by passing it as a prop, by creating a context or by attaching it to the global `window` object.

- #### GlueProvider

Add the `<GlueProvider />` component by wrapping your other components inside it (preferably the root one). Pass the settings object to the `<GlueProvider />`. It will initialize the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library and make the Glue42 Web APIs available in your application by setting the returned `glue` object as the value of `GlueContext`:

```javascript
//index.js
import GlueWeb from "@glue42/web";
import { GlueProvider } from "@glue42/react-hooks";

ReactDOM.render(
    // Wrap your root component in the `<GlueProvider />` in order
    // to be able to access the Glue42 Web APIs from all child components.
    <GlueProvider fallback={<h2>Loading...</h2>} settings={{ web: { factory: GlueWeb } }}>
        <App />
    </GlueProvider>,
    document.getElementById("root")
);
```

- #### useGlueInit()

You can also initialize the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library with the `useGlueInit()` hook. Below is an example of conditional rendering of a component based on whether the Glue42 Web API is available or not.

```javascript
import GlueWeb from "@glue42/web";
import { useGlueInit } from "@glue42/react-hooks";

const App = () => {
    // Example custom configuration for the Glue42 Web library.
    const config = {
        libraries: [GlueWorkspaces]
    };
    const glue = useGlueInit({ web: { factory: GlueWeb, config } });

    return glue ? <Main glue={glue} /> : <Loader />;
};

export default App;
```

Remember that when you initialize the Glue42 Web library with the `useGlueInit()` hook, you must provide the `glue` object to your nested components to be able the use the Glue42 Web APIs in them. For example, use React Context or attach it to the global `window` object.

### Consuming Glue42 Web APIs

After the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library has been successfully initialized, you can access the Glue42 Web APIs with the built-in React hook `useContext()` and passing `GlueContext` as its argument, or with the `useGlue()` hook.

*Note that this library is just a thin wrapper designed to work with both `@glue42/web` and `@glue42/desktop`. For that reason, if you are using React with TypeScript, you should type cast the initialized `glue` object to the appropriate type, because the default type is `Glue42Web.API | Glue42.Glue`*;

- #### GlueContext

Below is an example of accessing the `glue` object with `GlueContext` and using the [Shared Contexts](../../../../reference/core/latest/shared%20contexts/index.html) API to get the context of the current window:

```javascript
import { useContext, useState, useEffect } from "react";
import { GlueContext } from "@glue42/react-hooks";

const App = () => {
    const [context, setContext] = useState({});
    // Access the Glue42 Web APIs by using the `glue` object
    // assigned as a value to `GlueContext` by the `<GlueProvider />` component.
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

You can use your own factory function for initializing the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library. This is useful in Jest/Enzyme tests when you want to mock the Glue42 library:

```javascript
//index.js
import "glue42/web";
import { mount } from "enzyme";
import { GlueProvider } from "@glue42/react-hooks";

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
        // Pass your factory function to the `<GlueProvider />` component.
        <GlueProvider settings={{ web: { factory: glueFactory} }}>
            <App />
        </GlueProvider>
        );
        // Your logic here.
    });
});
```

*For additional information on testing React hooks, see the [@testing-library/react-hooks](https://www.npmjs.com/package/@testing-library/react-hooks).*