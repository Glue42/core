## Overview

The [Interop API](../../../reference/core/latest/interop/index.html) enables applications to:

- offer functionality to other applications in the same Glue42 Core project by registering Interop methods;
- discover applications in the same Glue42 Core project which offer methods;
- invoke registered Interop methods;
- stream and subscribe to real-time data using the streaming methods of the Interop API;

We call applications which offer methods and streams *Interop servers*, and applications which consume them - *Interop clients*, and collectively - **Interop instances**.

*For detailed information on the Interop API (methods, streams, discovery and more), see the [**Interop**](../../../glue42-concepts/data-sharing-between-apps/interop/javascript/index.html) documentation.*

In the next sections, you can see examples of using the Interop API. You can open the embedded examples directly in [CodeSandbox](https://codesandbox.io) to see the code and experiment with it.

## Registering and Invoking Methods

The applications below demonstrate how to register and invoke Interop methods using the [`register()`](../../../reference/core/latest/interop/index.html#!API-register) and [`invoke()`](../../../reference/core/latest/interop/index.html#!API-invoke) methods of the Interop API. 

On load, Application B registers a method called "G42Core.Basic". Click the "Invoke" button in Application A to invoke this method and print the result from the method invocation.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/basic-interop" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://fmzr7.csb.app/app-a/index.html"></iframe>
    <iframe src="https://fmzr7.csb.app/app-b/index.html"></iframe>
</div>

## Targeting

The applications below demonstrate targeting Interop servers when invoking Interop methods. 

On load, Applications B and C register a method with the same name. Click one of the buttons in Application A to invoke this method and print the result from the method invocation. There are four buttons - "Invoke Default" (invokes the method by targeting the server that has registered it first), "Invoke All" (invokes the method by targeting all servers offering it), "Invoke App B" (invokes the method by targeting Application B) and "Invoke App C" (invokes the method by targeting Application C). 

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/invocation-target" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://nsjxl.csb.app/app-a/index.html"></iframe>
    <iframe src="https://nsjxl.csb.app/app-b/index.html"></iframe>
    <iframe src="https://nsjxl.csb.app/app-c/index.html"></iframe>
</div>

## Discovery

### Methods

- #### Method Name

The applications below demonstrate discovering Interop methods by a method name. 

Use Application B and Application C to register Interop methods by providing a method name. Input a method name in Application A and click the "Invoke" button to invoke the method and print the result from the method invocation.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/method-discovery-by-name" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://whkfw.csb.app/app-a/index.html"></iframe>
    <iframe src="https://whkfw.csb.app/app-b/index.html"></iframe>
    <iframe src="https://whkfw.csb.app/app-c/index.html"></iframe>
</div>

- #### Method Events

The applications below demonstrate discovering Interop methods by subscribing to the [`serverMethodAdded()`](../../../reference/core/latest/interop/index.html#!API-serverMethodAdded) and the [`serverMethodRemoved()`](../../../reference/core/latest/interop/index.html#!API-serverMethodRemoved) events of the Interop API. 

On load, Application A subscribes to the `serverMethodAdded()` and `serverMethodRemoved()` events and will print the names of the newly registered method and the server offering it. Use Application B and Application C to register Interop methods by providing a method name.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/method-discovery-by-event" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://b6t8l.csb.app/app-a/index.html"></iframe>
    <iframe src="https://b6t8l.csb.app/app-b/index.html"></iframe>
    <iframe src="https://b6t8l.csb.app/app-c/index.html"></iframe>
</div>

### Servers

The applications below demonstrate discovering Interop servers by a method name. 

Use Application B and Application C to register Interop methods by providing a method name. Input a method name in Application A and click the "Find Servers" button to print the Interop servers that provide the method. 

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/server-discovery" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://p9lot.csb.app/app-a/index.html"></iframe>
    <iframe src="https://p9lot.csb.app/app-b/index.html"></iframe>
    <iframe src="https://p9lot.csb.app/app-c/index.html"></iframe>
</div>

## Streaming

### Publishing and Subscribing

The applications below demonstrate publishing and subscribing for Interop streams. 

On load, Application B registers an Interop stream called "G42Core.Stream.Basic". Click the "Subscribe" button in Application A to subscribe to the registered stream. Each time Application A receives data, it will be printed on the page (time stamp and a message). Click the "Start Publishing" button in Application B to start publishing data to the stream every 3 seconds.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/stream-pub-sub" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://6zwf8.csb.app/app-a/index.html"></iframe>
    <iframe src="https://6zwf8.csb.app/app-b/index.html"></iframe>
</div>

### Events

The applications below demonstrate handling streaming events - adding/removing subscribers and closing the stream. 	

Click the "Create Stream" button in Application B to register an Interop stream called "G42Core.Stream.Basic". Click the "Subscribe" button in Application A to subscribe to the registered stream - Application B will print to the page when a new subscriber is added. Each time Application A receives data, it will be printed on the page (time stamp and a message). Click the "Start Publishing" button in Application B to start publishing data to the stream every 3 seconds. 	

Click the "Unsubscribe" button in Application A to close the subscription to the stream - Application B will print to the page when a subscriber is removed. Click the "Close Stream" button in Application B to close the stream - Application A will print to the page when the stream is closed.

<a href="https://codesandbox.io/s/github/Glue42/core/tree/master/live-examples/interop/stream-events" target="_blank" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 296" preserveAspectRatio="xMidYMid meet" width="24" height="24" version="1.1" style="pointer-events: auto;">
        <path fill="#000000" d="M 115.498 261.088 L 115.498 154.479 L 23.814 101.729 L 23.814 162.502 L 65.8105 186.849 L 65.8105 232.549 L 115.498 261.088 Z M 139.312 261.715 L 189.917 232.564 L 189.917 185.78 L 232.186 161.285 L 232.186 101.274 L 139.312 154.895 L 139.312 261.715 Z M 219.972 80.8277 L 171.155 52.5391 L 128.292 77.4107 L 85.104 52.5141 L 35.8521 81.1812 L 127.766 134.063 L 219.972 80.8277 Z M 0 222.212 L 0 74.4949 L 127.987 0 L 256 74.182 L 256 221.979 L 127.984 295.723 L 0 222.212 Z" style="pointer-events: auto;"></path>
</svg> Open in CodeSandbox</a>
<div class="d-flex">
    <iframe src="https://fv3wc.csb.app/app-a/index.html"></iframe>
    <iframe src="https://fv3wc.csb.app/app-b/index.html"></iframe>
</div>

### Managing Subscriptions

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
    <iframe src="https://t88ys.csb.app/app-a/index.html"></iframe>
    <iframe src="https://t88ys.csb.app/app-b/index.html"></iframe>
    <iframe src="https://t88ys.csb.app/app-c/index.html"></iframe>
</div>