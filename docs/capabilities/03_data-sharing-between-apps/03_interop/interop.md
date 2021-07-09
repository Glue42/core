## Overview

The [Interop API](../../../reference/core/latest/interop/index.html) enables applications to:

- offer functionality to other applications in the same [**Glue42 Core**](https://glue42.com/core/) project by registering Interop methods;
- discover applications in the same [**Glue42 Core**](https://glue42.com/core/) project which offer methods;
- invoke registered Interop methods;
- stream and subscribe for real-time data using the streaming methods of the Interop API;

Applications which offer methods and streams are called *Interop servers*, and applications which consume them - *Interop clients*, and collectively - *Interop instances*.

![Interop instances](../../../images/interop/interop.gif)

The [Live Examples](#live_examples) section demonstrates using the Interop API. To see the code and experiment with it, open the embedded examples directly in [CodeSandbox](https://codesandbox.io).

## Method Registration

The Interop API is accessible through the [`glue.interop`](../../../reference/core/latest/interop/index.html) object.

To register an Interop method that will be available to all other Glue42 enabled applications, use the [`register()`](../../../reference/core/latest/interop/index.html#API-register) method. Provide a name for the method (or a [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object) and a callback that will handle invocations from client applications:

```javascript
// Required name for the method to register.
const methodName = "Addition";
// Required callback that will handle client invocations.
const handler = ({ a, b }) => {
    const result = { sum: a + b };

    return result;
};

await glue.interop.register(methodName, handler);
```

After registration, the "Addition" Interop method will be available to all other Glue42 enabled applications and any of them will be able to [invoke](#method_invocation) it with custom arguments at any time, as long the server offering it is running or until it unregisters it (with the [`unregister()`](../../../reference/core/latest/interop/index.html#API-unregister) method).

Interop methods with the same name may be registered by different servers. An Interop method is considered the same as another Interop method if their names are the same and if the `accepts` and `returns` properties of their [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) objects have identical values. The implementation of the handler function, however, may differ for each server.

### Method Definition

When registering an Interop method, it is required to pass either a string for a method name or a [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object. The [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object describes the Interop method your application is offering. It has the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `name` | `string` | A name for the method. | Yes |
| `accepts` | `string` | Signature describing the parameters that the method expects (see [Input and Output Signature](#method_registration-input_and_output_signature)). | No |
| `returns` | `string` | Signature describing the return value of the method (see [Input and Output Signature](#method_registration-input_and_output_signature)). | No |
| `displayName` | `string` | User-friendly name for the method that may be displayed in UIs. | No |
| `description` | `string` | Description of the functionality the method provides. | No |
| `objectTypes` | `string` | Predefined data structures (e.g., `"Instrument"`, `"Client"`, etc.) with which the method works (see [Object Types](#object_types)). | No |
| `supportsStreaming` | `boolean` | Whether the method is an [Interop stream](#srteaming). | No |
| `version` | `number` | Method version. | No |

```javascript
// Method definition.
const methodDefinition = {
    name: "Addition",
    accepts: "Int a, Int b, Int? c",
    returns: "Int sum",
    displayName: "Calculate Sum",
    description: "Calculates the sum of the input numbers."
};
const handler = ({ a, b, c }) => {
    const result = {
        sum: a + b + (c ? c : 0)
    };

    return result;
};

await glue.interop.register(methodDefinition, handler);
```

### Input and Output Signature

To describe the parameters that your Interop method expects and the value it returns, use the `accepts` and `returns` properties of the [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object. Both properties accept a comma-delimited string of parameters. Each parameter described in the string must use the following format:

```cmd
type <array-modifier> <optional-modifier> parameter-name (<description>)

// The `type` is one of:
type = "bool" | "int" | "double" | "long" | "string" | "datetime" | "tuple: {<schema>}" | "composite: {<schema>}"

// The `<schema>` represents any value(s) in the same format.
```

"Composite" is a structure which may contain one or more fields of scalar type, array of scalars, a nested composite or an array of composites. A "Composite" allows you to define almost any non-recursive structure.

Examples:

- `"string name, string[]? titles"` - `name` is required, `titles` is an optional string array;
- `tuple: { string name, int age } personalDetails` - `personalDetails` is a required tuple value containing two required values - `name` as a string and `age` as an integer;
- `"composite: { string first, string? middle, string last } name"` - `name` is a composite parameter and its schema is defined by 2 required string fields - `first` and `last`, and an optional string field - `middle`;

### Returning Results

When returning results from you Interop methods, wrap the return value in an object:

```javascript
({ a, b }) => {
    // Return an object.
    return { sum: a + b };
};
```

Otherwise, the result will be automatically wrapped in an object with a single `_value` property which will hold your return value:

```javascript
({ a, b }) => {
    // This will be automatically wrapped in an object.
    return a + b;
};

// If a=2 and b=3, the resulting value will look like this:
// { _value: 5 }
```

### Asynchronous Results

Interop methods can return asynchronous results as well. Use the [`register()`](../../../reference/core/latest/interop/index.html#API-register) method to register an asynchronous Interop method:

```javascript
const asyncMethodName = "MyAsyncMethod";
const asyncHandler = async () => {
    const response = await fetch("https://docs.glue42.com");

    if (response.ok) {
        return 42;
    } else {
        throw new Error("The doc site is down!");
    };
};

await glue.interop.register(asyncMethodName, asyncHandler);
```

## Method Invocation

To invoke an Interop method, use the [`invoke()`](../../../reference/core/latest/interop/index.html#API-invoke) method. The only required argument for `invoke()` is a method name or a [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object. You can also specify arguments, target and other invocation options:

```javascript
const methodName = "Addition";
const args = { a: 2, b: 3 };
const target = "all";
const options = {
    waitTimeoutMs: 5000,
    methodResponseTimeoutMs: 8000
};

const result = await glue.interop.invoke(methodName, args, target, options);
```

- `args` - as a second parameter, `invoke()` accepts an object containing arguments for the method invocation;
- `target` - as a third parameter, `invoke()` accepts a value specifying which Interop servers offering the method to target (see [Targeting](#method_invocation-targeting)).
- `options` - as a fourth parameter, `invoke()` accepts an [`InvokeOptions`](../../../reference/core/latest/interop/index.html#InvokeOptions) object with optional properties, described in the following table.

| Value | Description |
|-------|-------------|
| `waitTimeoutMs` | In ms, default is 30 000. Timeout to discover the method if not immediately available. |
| `methodResponseTimeoutMs` | In ms, default is 30 000. Timeout to wait for a reply from the method invocation. |

### Targeting

If multiple apps offer the same Interop method, you can choose to invoke it on the "best" application instance (this is the default behavior, if no `target` is passed), on a specific Interop instance, on a set of instances, or on all instances.

![Targeting](../../../images/interop/interop-targeting.gif)

The following table describes the values accepted by the `target` property of the [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object when invoking an Interop method:

| Value | Description |
|-------|-------------|
| `"best"` | Default. Executes the method on the best (first) server (the Glue42 runtime determines the appropriate instance). |
| `"all"` | Executes the method on all Interop servers offering it. |
| `"skipMine"` | Like `"all"`, but skips the current server. |
| [`Instance`](../../../reference/core/latest/interop/index.html#Instance) | An object describing an Interop instance. It is also possible to provide only a subset of the Interop instance object properties as a filter - e.g., `{ application: "appName" }`. |
| [Instance[]](../../../reference/core/latest/interop/index.html#Instance) | Array of Interop `Instance` objects (or subset filters). |

*Note that the properties of an Interop [Instance](../../../reference/core/latest/interop/index.html#Instance) can have both a string or a regular expression as a value.*

Application instances are ranked internally. The "best" instance is the first one running on the user's desktop and under the user's name. If there are multiple applications matching these criteria, the first instance is used.

To invoke a method on a preferred set of applications, pass a target as a third argument.

If nothing is passed, `"best"` is default:

```javascript
await glue.interop.invoke("Addition", { a: 2, b: 3 });
```

To target all Interop instances offering the same method:

```javascript
const target = "all";

await glue.interop.invoke("Addition", { a: 2, b: 3 }, target);
```

To target all instances, except the current one:

```javascript
const target = "skipMine";

await glue.interop.invoke("Addition", { a: 2, b: 3 }, target);
```

To target a specific instance:

```javascript
const target = { application: "Calculator" };

await glue.interop.invoke("Addition", { a: 2, b: 3 }, target);
```

To target a set of instances (for more information on finding Interop instances, see [Discovery](#discovery)):

```javascript
const targets = glue.interop.servers()
    .filter(server => server.application.startsWith("Calculator"));

await glue.interop.invoke("Addition", { a: 2, b: 3 }, targets);
```

### Consuming Results

The [`invoke()`](../../../reference/core/latest/interop/index.html#API-invoke) method is asynchronous and resolves with an [`InvocationResult`](../../../reference/core/latest/interop/index.html#InvocationResult) object. Use the `returned` property of the `InvocationResult` object to extract the returned result:

```javascript
const invocationResult = await glue.interop.invoke("Addition", { a: 2, b: 3 });

// The method returns an object with a `sum` property.
const sum = invocationResult.returned.sum;
```

#### Multiple Results

Invoking a method on multiple Interop instances produces multiple results. Use the `all_return_values` property of the [`InvocationResult`](../../../reference/core/latest/interop/index.html#InvocationResult) object to obtain an array of all invocation results:

```javascript
const invocationResult = await glue.interop.invoke("Addition", { a: 2, b: 3 }, "all");

invocationResult.all_return_values
    .forEach(result => console.log(result.returned.sum));
```

## Object Types

Use the `objectTypes` property of the [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) when registering an Interop method to specify what predefined data structures the method expects - e.g., `"Instrument"`, `"Client"`, etc. Specifying the object types in a method definition is useful for determining at runtime the methods applicable to the currently handled object. For the object types to function in a generic manner, all applications must follow the same data format and pass the respective objects to the respective Interop methods.

To register a method with object type specifications:

```javascript
const methodDefinition = {
    name: "SetClient",
    objectTypes: ["Client"]
};

const handler = (client) => {
    console.log(client.id, client.name);
};

await glue.interop.register(methodDefinition, handler);
```

To find all methods working with a specific object type:

```javascript
const clientMethods = glue.interop.methods()
    .filter(method => method.objectTypes?.includes("Client"));
```

To invoke a method working with a specific object type:

```javascript
const methodDefinition = {
    name: "SetClient",
    objectTypes: ["Client"]
};

await glue.interop.invoke(methodDefinition);
```

## Discovery

### Methods

To get a collection of all available Interop methods, use the [`methods()`](../../../reference/core/latest/interop/index.html#API-methods) method:

```javascript
const allMethods = glue.interop.methods();
```

To find a specific method or a set of methods, pass a string or a [`MethodFilter`](../../../reference/core/latest/interop/index.html#MethodFilter) object:

```javascript
const methodFilter = { name: "Addition" };
const filteredMethods = glue.interop.methods(methodFilter);
```

To find all methods of an Interop instance:

```javascript
const instance = { application: "appName" };
const methods = glue.interop.methodsForInstance(instance);
```

If you have a reference to an Interop instance, use its [`getMethods()`](../../../reference/core/latest/interop/index.html#Instance-getMethods) and [`getStreams()`](../../../reference/core/latest/interop/index.html#Instance-getStreams) methods:

```javascript
// Get the current Interop instance of the application.
const myInstance = glue.interop.instance;
// Get the Interop methods registered by the instance.
const methods = myInstance.getMethods();
// Get the Interop streams registered by the instance.
const streams = myInstance.getStreams();
```

### Servers

To get a collection of all Interop servers, use the [`servers()`](../../../reference/core/latest/interop/index.html#API-servers) method:

```javascript
const servers = glue.interop.servers();
```

To find the servers offering a specific method, pass a [`MethodFilter`](../../../reference/core/latest/interop/index.html#MethodFilter) object:

```javascript
const methodFilter = { name: "Addition" };
const serversForMethod = glue.interop.servers(methodFilter);
```

If you have a reference to a [`Method`](../../../reference/core/latest/interop/index.html#Method) object, use its [`getServers()`](../../../reference/core/latest/interop/index.html#Method-getServers) method:

```javascript
const method = glue.interop.methods("Addition")[0];
const servers = method.getServers();
```

## Interop Events

The Interop API offers means for notifying you when a method has been added/removed or when an application offering methods becomes available/unavailable. All methods for listening for events return an unsubscribe function. Use it to stop receiving event notifications.

To get notified when a method has been added for the first time by any application, use [`methodAdded()`](../../../reference/core/latest/interop/index.html#API-methodAdded):

```javascript
const handler = (method) => {
    console.log(`Method "${method.name}" was added.`);
};

glue.interop.methodAdded(handler);
```

To get notified when a method has been removed from the last application offering it, use [`methodRemoved()`](../../../reference/core/latest/interop/index.html#API-methodRemoved):

```javascript
const handler = (method) => {
    console.log(`Method "${method.name}" was removed.`);
};

glue.interop.methodRemoved(handler);
```

To get notified when an application offering methods has been discovered, use [`serverAdded()`](../../../reference/core/latest/interop/index.html#API-serverAdded):

```javascript
const handler = (instance) => {
    console.log(`Interop server was discovered: "${instance.application}".`);
};

glue.interop.serverAdded(handler);
```

To get notified when an application stops offering methods or is closed, use [`serverRemoved()`](../../../reference/core/latest/interop/index.html#API-serverRemoved):

```javascript
const handler = (instance) => {
    console.log(`Interop server was removed: "${instance.application}".`);
};

glue.interop.serverRemoved(handler);
```

To get notified every time a method is offered by any application, use [`serverMethodAdded()`](../../../reference/core/latest/interop/index.html#API-serverMethodAdded). This event fires every time any application starts offering a method, while [`methodAdded()`](../../../reference/core/latest/interop/index.html#API-methodAdded) fires only for the first application which starts to offer the method:

```javascript
const handler = (info) => {
    const serverName = info.server.application;
    const methodName = info.method.name;
    console.log(`Interop server "${serverName}" now offers method "${methodName}".`);
};

glue.interop.serverMethodAdded(handler);
```

To get notified every time a method is removed from any application, use [`serverMethodRemoved()`](../../../reference/core/latest/interop/index.html#API-serverMethodRemoved). This event fires every time any application stops offering a method, while [`methodRemoved()`](../../../reference/core/latest/interop/index.html#API-methodRemoved) fires only when the method has been removed from the last application offering it:

```javascript
const handler = (info) => {
    const serverName = info.server.application;
    const methodName = info.method.name;
    console.log(`Interop server "${serverName}" has removed method "${methodName}".`);
};

glue.interop.serverMethodRemoved(handler);
```

## Streaming

### Overview

Your application can publish events that can be observed by other applications and can provide real-time data (e.g., market data, news alerts, notifications, etc.) to other applications by publishing an Interop stream. It can also receive and react to these events and data by creating an Interop stream subscription.

Applications that create and publish to Interop streams are called *publishers*, and applications that subscribe to Interop Streams are called *subscribers*. An application can be both.

![Streaming](../../../images/interop/interop-streaming.gif)

## Publishing Stream Data

### Creating Streams

To start publishing data, create an Interop stream by using the [`createStream()`](../../../reference/core/latest/interop/index.html#API-createStream) method. This registers an Interop method similar to the one created by [`register()`](../../../reference/core/latest/interop/index.html#API-register), but with streaming semantics. The `createStream()` method accepts a string or a [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object as a first parameter and a [`StreamOptions`](../../../reference/core/latest/interop/index.html#StreamOptions) object as a second.

The [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) is identical to the Interop method definition for the [`register()`](../../../reference/core/latest/interop/index.html#API-register) method. If you pass a string, it will be used as a stream name:

```javascript
const stream = await glue.interop.createStream("MarketData.LastTrades");
```

Which is identical to:

```javascript
const streamDefinition = { name: "MarketData.LastTrades" };
const stream = await glue.interop.createStream(streamDefinition);
```

The [`StreamOptions`](../../../reference/core/latest/interop/index.html#StreamOptions) object allows you to pass several optional callbacks which let your application handle subscriptions in a more detailed manner:

- to identify individual subscribers/clients;
- to accept or reject subscriptions based on the subscription arguments;
- to unicast data as soon as a client subscribes to the stream;
- to group subscribers which use the same subscription arguments on a *stream branch* and then publish to that branch, multicasting data to all subscribers;

[`StreamOptions`](../../../reference/core/latest/interop/index.html#StreamOptions) object example:

```javascript
const streamOptions = {
    subscriptionRequestHandler: subscriptionRequest => {},
    subscriptionAddedHandler: streamSubscription => {},
    subscriptionRemovedHandler: streamSubscription => {}
};
```

Example of creating a stream:

```javascript
// Stream definition.
const streamDefinition = {
    name: "MarketData.LastTrades",
    displayName: "Market Data - Last Trades",
    accepts: "String symbol",
    returns: "String symbol, Double lastTradePrice"
};

// Stream options object containing subscription request handlers.
const streamOptions = {
    subscriptionRequestHandler: subscriptionRequest => subscriptionRequest.accept(),
    subscriptionAddedHandler: console.log,
    subscriptionRemovedHandler: console.log
};

// Creating the stream.
let stream;

async function initiateStream() {
    stream = await glue.interop.createStream(streamDefinition, streamOptions);
    console.log(`Stream "${stream.definition.displayName}" created successfully.`);
};

initiateStream().catch(console.error);
```

### Accepting or Rejecting Subscriptions

Subscriptions are auto accepted by default. You can control this behavior by passing a [`subscriptionRequestHandler`](../../../reference/core/latest/interop/index.html#StreamOptions-subscriptionRequestHandler) in the [`StreamOptions`](../../../reference/core/latest/interop/index.html#StreamOptions) object. Note that this handler is called before the [`subscriptionAddedHandler`](../../../reference/core/latest/interop/index.html#StreamOptions-subscriptionAddedHandler), so if you reject the request, the `subscriptionAddedHandler` will not be called.

The [`SubscriptionRequest`](../../../reference/core/latest/interop/index.html#SubscriptionRequest) object, passed as an argument to the subscription request handler, has the following properties and methods:

| Name | Description |
|------|-------------|
| `instance` | The Interop [`Instance`](../../../reference/core/latest/interop/index.html#Instance) of the subscriber application. |
| `arguments` | An object containing the subscription arguments, e.g. `{ symbol: "GOOG" }`. |
| `accept()` | Accepts the instance subscription. |
| `acceptOnBranch()` | Accepts the subscription on a branch with the provided string argument as a name. Pushing data to that branch will multicast it to all subscriptions associated with the branch. |
| `reject()` | Rejects the subscription and returns the provided string argument as a reason for the rejection. |

Example of a subscription request handler:

```javascript
function onSubscriptionRequest(subscriptionRequest) {

    // Here you can identify, accept or reject subscribers,
	// group subscribers on a shared stream branch, access the subscription arguments.

    const application = subscriptionRequest.instance.application;
    const symbol = subscriptionRequest.arguments.symbol;

    // If the subscription request contains a `symbol` property in the its `arguments` object,
    // accept it on a stream branch with the provided symbol as a branch key,
    // otherwise, reject the subscription.
    if (symbol) {
        subscriptionRequest.acceptOnBranch(symbol);
        console.log(`Accepted subscription by "${application}" on branch "${symbol}".`);
    } else {
        subscriptionRequest.reject("Subscription rejected: missing `symbol` argument.");
        console.warn(`Rejected subscription by "${application}". Symbol not specified.`);
    };
};
```

### Added and Removed Subscriptions

By default, nothing happens when a new subscription is added or removed. You may, however, want to push data to the subscriber, if such is available, or unsubscribe from the underlying data source when the last subscriber for that data is removed. Use the [`subscriptionAddedHandler`](../../../reference/core/latest/interop/index.html#StreamOptions-subscriptionAddedHandler) and the [`subscriptionRemovedHandler`](../../../reference/core/latest/interop/index.html#StreamOptions-subscriptionRemovedHandler) in the [`StreamOptions`](../../../reference/core/latest/interop/index.html#StreamOptions) object to achieve this.

#### Handling New Subscriptions

Example of a handler for added subscriptions:

```javascript
const symbolPriceCache = {
    "GOOG": {
        price: 123.456
    }
};

function onSubscriptionAdded(streamSubscription) {
    
    const symbol = streamSubscription.arguments.symbol;
    const isFirstSubscription = symbolPriceCache[symbol] ? false : true;

    if (isFirstSubscription) {
        // If this is a first subsription for that symbol,
        // start requesting data for it and cache it.
        symbolPriceCache[symbol] = {};
        startDataRequests(symbol);
        console.log(`First subscription for symbol "${symbol}" created.`);
    } else {
        // If there is already an existing subscription for that symbol,
        // send a snapshot of the available price to the new subscriber.
        const price = symbolPriceCache[symbol].price;

        // Check first whether a price is available.
        if (price) {
            const data = { symbol, price };

            // Unicast data directly to this subscriber.
            streamSubscription.push(data);
            console.log(`Sent snapshot price for symbol "${symbol}".`);
        };
    };
};

function startDataRequests(symbol) {
    // Here you can make requests to a real-time data source.
};
```

#### Handling Last Subscription Removal

Example of a handler for removed subscriptions:

```javascript
function onSubscriptionRemoved(streamSubscription) {
    
    const symbol = streamSubscription.arguments.symbol;
    const branch = streamSubscription.stream.branch(symbol);

    // If there are no more subscriptions for that symbol,
    // stop requesting data and remove the symbol from the cache.
    if (branch === undefined) {
        stopDataRequests(symbol);
        delete symbolPriceCache[symbol];
        console.warn(`Branch was closed, no more active subscriptions for symbol "${symbol}".`);
    };
};

function stopDataRequests(symbol) {
    // Terminate the requests to the data source.
};
```

### Using Stream Branches

If your stream publishing code uses branches (e.g., creates a branch for each unique set of subscription arguments and associates the subscriptions with that branch), whenever a data arrives from your underlying source, you can use the branch to publish the data to the subscribers on that branch instead of manually going over all subscriptions and pushing data to the interested clients.

Example:

```javascript
// Extract the data returned in the response from the data source, e.g.:
// const symbol = responseData.symbol;
// const price = responseData.price;
const data = { symbol, price };

// The subscriptions have been accepted on branches with the `symbol`
// provided in the subscription requests as a branch key,
// so now the same `symbol` is used to identify the branch to which to push data.
stream.push(data, symbol);
```

### Server Side Subscription Object

The [StreamSubscription](../../../reference/core/latest/interop/index.html#StreamSubscription) object has the following properties and methods:

| Name | Description |
|------|-------------|
| `arguments` | The arguments used by the client application to subscribe. |
| `stream` | The stream object you have registered, so you don't need to keep track of it. |
| `branchKey` | The key of the branch (if any) with which the stream publisher has associated the client subscription. |
| `instance` | The instance of the subscriber. |
| `push()` | A method to push data directly to a subscription (unicast). |
| `close()` | method which closes the subscription forcefully on the publisher side, e.g. if the publisher shuts down. |

### Stream Object

The [Stream](../../../reference/core/latest/interop/index.html#Stream) object has the following properties and methods:

| Name | Description |
|------|-------------|
| `definition` | The definition object with which the stream was created. |
| `name` | The name of the stream as specified in the definition object. |
| `subscriptions()` | Returns a list of all subscriptions. |
| `branches()` | Returns a list of all branches. |
| `close()` | Closes the stream and unregisters the corresponding Interop method. |

### Branch Object

The [StreamBranch](../../../reference/core/latest/interop/index.html#StreamBranch) object has the following properties and methods:

| Name | Description |
|------|-------------|
| `key` | The key with which the branch was created. |
| `subscriptions()` | Returns all subscriptions which are associated with this branch. |
| `close()` | Closes the branch (and drops all subscriptions on it). |
| `push()` | Multicasts data to all subscriptions on the branch. This is always more efficient than keeping track of the subscriptions manually and doing it yourself. |

## Consuming Stream Data

### Subscribing to a Stream

Streams are simply special Interop methods, so subscribing to a stream resembles very much invoking a method. To subscribe, create a subscription using the [`subscribe()`](../../../reference/core/latest/interop/index.html#API-subscribe) method. It accepts a string or a [`MethodDefinition`](../../../reference/core/latest/interop/index.html#MethodDefinition) object as a first required parameter and a [`SubscriptionParams`](../../../reference/core/latest/interop/index.html#SubscriptionParams) object as a second optional one:

```javascript
const subscriptionOptions = {
    arguments: { symbol: "GOOG" }
};

// Creating the subscription.
let subscription;

async function createSubscription() {
    subscription = await glue.interop.subscribe("MarketData.LastTrades", subscriptionOptions);
};

createSubscription().catch(console.error);

// Use subscription here.
```

The [`SubscriptionParams`](../../../reference/core/latest/interop/index.html#SubscriptionParams) object has the following properties:

| Property | Description |
|----------|-------------|
| `arguments` | Object containing arguments for the stream subscription. Passing `arguments` enables you to group subscribers that use the same `arguments` on a stream branch (see [Publishing Stream Data](#publishing_stream_data)), and/or use these as a filter on the publisher side. |
| `target` | An [`InstanceTarget`](../../../reference/core/latest/interop/index.html#InstanceTarget) object that can be one of `"best"`, `"all"`, `"skipMine"`, `Instance` or `Instance[]` (see [Invoking Methods](#method_invocation)). |
| `waitTimeoutMs` | Timeout to discover the stream if not immediately available. |
| `methodResponseTimeout` | Timeout to wait for the stream reply. |
| `onData` | Callback for handling new data. |
| `onClosed` | Callback to handle the event when the subscription is closed by the server. |
| `onConnected` | Callback to handle the event when the subscription is connected to a server. |

### Handling Subscriptions Client Side

The client side [`Subscription`](../../../reference/core/latest/interop/index.html#Subscription) object has several useful properties providing information about the subscription instance:

| Property | Description |
|----------|-------------|
| `requestArguments` | Arguments used for the subscription. |
| `serverInstance` | Instance of the application providing the stream. |
| `stream` | The stream definition object. |

Once you have a subscription, use its [`onData()`](../../../reference/core/latest/interop/index.html#Subscription-onData) method to handle stream data. The callback you register with the `onData()` method of the `Subscription` object will fire every time new stream data is received:

```javascript
subscription.onData((streamData) => {
	// Use stream data here.
});
```

The [`StreamData`](../../../reference/core/latest/interop/index.html#StreamData) object has the following properties:

| Property | Description |
|----------|-------------|
| `requestArguments` | The subscription request arguments. |
| `data` | The data object sent by the stream publisher. |
| `private` | A flag indicating whether the data was unicast to this subscription (`false`, if multicast from a stream or a stream branch). |
| `server` | The Interop instance which pushed the data. |
| `message` | Message from the publisher of the stream. |

#### Closed or Rejected Subscriptions

A stream subscription can be closed at any time due to the publisher shutting down or due to an error. Two methods handle these events:

```javascript
subscription.onClosed(() => {
	// Closed gracefully by the publisher.
});

subscription.onFailed((error) => {
	// Unexpected error in the publisher.
});
```

## Stream Discovery

Streams are special Interop methods, so you can use the Interop [discovery](#discovery) methods to find available streams. The only difference is that streaming methods are flagged with a property `supportsStreaming: true`.

Finding all streams:

```javascript
const streams = glue.interop.methods().filter(method => method.supportsStreaming === true);
```

Finding a known stream:

```javascript
const stream = glue.interop.methods().find(method => method.name === "MarketData.LastTrades");
```

## Live Examples

### Registering and Invoking Methods

The applications below demonstrate how to register and invoke Interop methods using the [`register()`](../../../reference/core/latest/interop/index.html#API-register) and [`invoke()`](../../../reference/core/latest/interop/index.html#API-invoke) methods of the Interop API. 

On load, Application B registers a method called "G42Core.Basic". Click the "Invoke" button in Application A to invoke this method and print the result from the method invocation.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/basic-interop" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://fmzr7.csb.app" style="border: none;"></iframe>
</div>

### Targeting

The applications below demonstrate targeting Interop servers when invoking Interop methods. 

On load, Applications B and C register a method with the same name. Click one of the buttons in Application A to invoke this method and print the result from the method invocation. There are four buttons - "Invoke Default" (invokes the method by targeting the server that has registered it first), "Invoke All" (invokes the method by targeting all servers offering it), "Invoke App B" (invokes the method by targeting Application B) and "Invoke App C" (invokes the method by targeting Application C). 

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/invocation-target" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://nsjxl.csb.app" style="border: none;"></iframe>
</div>

### Discovery

#### Methods

The applications below demonstrate discovering Interop methods by a method name. 

Use Application B and Application C to register Interop methods by providing a method name. Input a method name in Application A and click the "Invoke" button to invoke the method and print the result from the method invocation.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/method-discovery-by-name" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://whkfw.csb.app" style="border: none;"></iframe>
</div>

The applications below demonstrate discovering Interop methods by subscribing to the [`serverMethodAdded()`](../../../reference/core/latest/interop/index.html#API-serverMethodAdded) and the [`serverMethodRemoved()`](../../../reference/core/latest/interop/index.html#API-serverMethodRemoved) events of the Interop API. 

On load, Application A subscribes to the `serverMethodAdded()` and `serverMethodRemoved()` events and will print the names of the newly registered method and the server offering it. Use Application B and Application C to register Interop methods by providing a method name.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/method-discovery-by-event" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://b6t8l.csb.app" style="border: none;"></iframe>
</div>

#### Servers

The applications below demonstrate discovering Interop servers by a method name. 

Use Application B and Application C to register Interop methods by providing a method name. Input a method name in Application A and click the "Find Servers" button to print the Interop servers that provide the method. 

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/server-discovery" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://p9lot.csb.app" style="border: none;"></iframe>
</div>

### Streaming

#### Publishing and Subscribing

The applications below demonstrate publishing and subscribing for Interop streams. 

On load, Application B registers an Interop stream called "G42Core.Stream.Basic". Click the "Subscribe" button in Application A to subscribe to the registered stream. Each time Application A receives data, it will be printed on the page (time stamp and a message). Click the "Start Publishing" button in Application B to start publishing data to the stream every 3 seconds.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/stream-pub-sub" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://6zwf8.csb.app" style="border: none;"></iframe>
</div>

#### Events

The applications below demonstrate handling streaming events - adding/removing subscribers and closing the stream. 	

Click the "Create Stream" button in Application B to register an Interop stream called "G42Core.Stream.Basic". Click the "Subscribe" button in Application A to subscribe to the registered stream - Application B will print to the page when a new subscriber is added. Each time Application A receives data, it will be printed on the page (time stamp and a message). Click the "Start Publishing" button in Application B to start publishing data to the stream every 3 seconds. 	

Click the "Unsubscribe" button in Application A to close the subscription to the stream - Application B will print to the page when a subscriber is removed. Click the "Close Stream" button in Application B to close the stream - Application A will print to the page when the stream is closed.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/stream-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://fv3wc.csb.app" style="border: none;"></iframe>
</div>

#### Managing Subscriptions

The applications below demonstrate handling stream subscriptions - accepting/rejecting subscriptions, grouping subscribers on branches, pushing data to all subscribers or to a specific stream branch.

On load, Application C registers an Interop stream called "G42Core.Stream.Basic". Click the "Subscribe" button in Application A and Application B to subscribe to the registered stream. Application A and Application B will print to the page subscription success or error messages, as well as the received data from the stream (time stamp and a message).

When Application C receives a new subscription request, it will print the subscription info on the page and show three buttons for the subscription: "Accept", "Accept on Private" and "Reject".

- "Accept" - accepts the subscription on the default branch.
- "Accept on Private" - accepts the subscription on a branch called "Private".
- "Reject" - rejects the subscription.

Use the "Push" and "Push to Private" buttons to push stream data to the default streaming branch (to all subscriptions) or to the "Private" branch.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/stream-subscription-request" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex mb-3">
    <iframe src="https://t88ys.csb.app" style="border: none;"></iframe>
</div>


## Reference

[Interop API Reference](../../../reference/core/latest/interop/index.html) 