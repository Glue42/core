## Overview

**Glue42 Core** is a toolkit that enables integration of same-origin (protocol, host and port) web applications. This means that multiple applications can share data between each other, expose functionality, open and manipulate windows. **Glue42 Core** is mainly targeted for use with Progressive Web Applications. By combining PWAs with **Glue42 Core** you will not only leverage the advantages of PWAs (native-like feel, working offline, enhanced performance, etc.), but you will also be able to incorporate an interoperability layer in your web application ecosystem. 

In industries and businesses that depend on tens (even hundreds) of different applications for processing information (like financial market data, client data, etc.) interoperability between applications has become an urgent necessity. Enabling applications to expose functionality, share data between each other and control other windows allows you to create meaningful window arrangements and define coherent workflows for the user. **Glue42 Core** helps you solve user-oriented problems, like errors from copy/pasting between apps, wasting time in finding and launching the right app, constant switching between many already running apps or utilizing screen real estate, which dramatically increases task completion times and user satisfaction. On a larger scale, enhancing employee productivity by eliminating these issues means reduced costs and higher customer satisfaction.  

## High Level Structure

A **Glue42 Core** project consists of a [**Glue42 Environment**](../core-concepts/environment/overview/index.html) and one or more [**Glue42 Clients**](../core-concepts/glue42-client/overview/index.html), all of which share the same origin - protocol, host and port. The client applications connect to the environment through the [**Glue42 Web**](../../reference/core/latest/glue42%20web/index.html) library.

### Glue42 Environment

The [**Glue42 Environment**](../core-concepts/environment/overview/index.html) is a collection of resources which, once hosted, the browser will execute on a separate thread.  The resources are accessible to all applications on the same host and port even if the applications run in different windows. The communication between the applications is handled by the environment. To achieve that, **Glue42 Core** uses the [**Shared Web Worker**](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) interface which is widely adopted by all major browsers. This means that you do not need any additional software to run your **Glue42 Core** project.

### Glue42 Client

A [**Glue42 Client**](../core-concepts/glue42-client/overview/index.html) is any application that connects to the [**Glue42 Environment**](../core-concepts/environment/overview/index.html). The clients are also called **Glue42 enabled apps**. The connection to the environment is handled by the [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) JavaScript library. The [**Glue42 Web**](../../reference/core/latest/glue42%20web/index.html) library also exposes an API for utilizing the **Glue42 Core** functionalities.

### Glue42 CLI

The [**Glue42 Core CLI**](../core-concepts/cli/index.html) is a development tool that simplifies starting a new **Glue42 Core** project or extending your existing one. The CLI can:
- set up your development environment;
- host your applications under the same host and port by either serving them from the file system or proxying to a live server that listens on `localhost`;
- bundle the **Glue42 Core** Environment in a package ready for deployment;

### Glue42 Web Library

The [**Glue42 Web**](../../reference/core/latest/glue42%20web/index.html) library connects the client applications to the environment. It offer sets of APIs through which the connected applications can share data and control window behavior. For more information, see the [**Capabilities**](../capabilities/overview/index.html) section.

## Requirements

The only requirement for users of your **Glue42 Core** project is a modern browser. No additional software is required.

Developing a **Glue42 Core** project requires:
- `Node.js` (version 10.14.X and up) and `npm` installed;
- general JavaScript knowledge;
- general web development knowledge;

If all this intrigues you, see the [**Quick Start**](../getting-started/quick-start/index.html) and the [**Capabilities**](../capabilities/overview/index.html) sections for more information on **Glue42 Core**.