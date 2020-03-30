## Overview

Glue42 Core gives you the tools to enhance your traditional web apps and take your PWA apps to the next level. And all of this without requiring your users to install any additional software.

## Interop

The **Interop API** **TODO: Link** enables applications to:

- **offer functionality** to other applications (JavaScript **and** native executables) by **registering** Interop methods
- **discover applications which offer methods**
- **invoke** (call) methods on the user's desktop and across the network
- **stream and subscribe to real-time data** using the Streaming API.

We call applications which offer methods and streams *Interop servers*, and applications which consume them - *Interop clients*, and collectively - **Interop instances**.

Head over to the **Interop** **TODO: LINK** section for detailed explanation of methods, streams, discovery and more.

## Window Management

Using the **Windows API** your application can easily open and manipulate browser windows. This allows you to transform your traditional single-window web app into a multi-window native-like PWA application. The **Window Management** API enables applications to:
- **open multiple windows**
- **manipulate the position and size** of opened windows
- **pass data upon opening new windows**
- **listen to events** for opening and closing windows
- **automatically save and restore** your application's windows positions and contexts, so that the next time your user launches your app everything is restored as before


## Shared Contexts

A **Shared Context** is a named object (holding a `map` of `key`/`value` pairs) that stores cross application data. The context object can hold any cross-application data on your domain. Any application can update a context or subscribe for update notifications (by using the name of the context). Apps can also react to context changes (by subscribing for context updates) or update the context at runtime.

The **Shared Contexts API** **TODO: Link** offers a simple and effective solution for sharing data between the applications on your domain. Imagine that on your domain you have an application showing a list of clients (served at `/clients`) and an application showing a list of stocks (served at `/stocks`). What you need, is your "Stocks" app to show all stocks by default, but if the "Clients" app is also opened (in a different window) and user selects a client, then you want the "Stocks" app to only show stocks owned by the selected client. You can easily achieve this in a few simple steps by using the **Shared Contexts** API:

- instruct the "Clients" app to publish updates to a context object, holding the `id` of the currently selected client;
- instruct the "Stocks" app to subscribe for updates of that same context object and specify how the "Stocks" app should handle the received data in order to update its current state;

This is just a simple example, for more details head over to the **Shared Contexts** **TODO: link** section.