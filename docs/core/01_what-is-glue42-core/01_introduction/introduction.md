## Overview

Glue42 Core is toolkit, which allows for same-origin (protocol, host and port) web application integration. This means that multiple applications can share data between each other, expose functionality, open and manipulate windows.

Glue42 Core really shines when used with the native-like feel of Progressive Web Applications. Combining both allows you to build coherent workflows, which opens a whole new world of possibilities using just web technologies and a browser.

## High Level Structure

A Glue42 Core project consists of [**Environment**](../core-concepts/environment/index.html) and one or more [**Clients**](../core-concepts/glue42-client/index.html), all of which share the same origin - protocol, host and port.

### Environment

This is the engine behind Glue42 Core - a collection of resources, which once hosted the browser will execute on a separate thread, allowing the [**Environment**](../core-concepts/environment/index.html) to be accessible by all applications on the same host and port, even if they run in different windows. Once connected, the inter-app communication is conducted via the [**Environment**](../core-concepts/environment/index.html). To achieve that we utilized the Shared Web Worker Interface, which is widely adopted by all major browsers. This means no additional software is required to run your Glue42 Core project.

### Glue42 Client

A [**Glue42 Client**](../core-concepts/glue42-client/index.html) is any application which connects to the [**Environment**](../core-concepts/environment/index.html), we also called them **glue-enabled apps**. This is done by our `@glue42/web` JavaScript library. The Glue42 Web library also exposes an [API](../../../reference/core/latest/glue42%20web/index.html) for utilizing the Glue42 Core functionalities.

### Glue42 Core CLI

The[**Glue42 Core CLI**](../core-concepts/cli/index.html) is a development tool, which makes extending your existing project or starting new one with Glue42 Core a breeze. The CLI can:
- set up your development environment
- host your applications under the same host and port - by either serving them from the file system or proxying to a live server listening on `localhost`
- bundle the Glue42 Core Environment in a package ready for deployment

## Requirements

The only requirement for the users of your Glue42 Core project is a modern browser. That's it, no additional software is required.

Developing a Glue42 Core project requires:
- installed `Node.js` greater than version 10.14.X and `npm` 
- general JavaScript knowledge
- general web development knowledge

If all of that sounds awesome, why don't you checkout our [**Quick Start**](../../getting-started/quick-start/index.html) page or the [**Capabilities**](../capabilities/index.html) page for more information on the Glue42 Core functionality.
