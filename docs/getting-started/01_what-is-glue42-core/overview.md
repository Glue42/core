## Overview

[**Glue42 Core**](https://glue42.com/core/) is a toolkit that enables integration of web applications. This means that multiple standalone web applications can share data between each other, expose functionality, open and manipulate windows. For example, combining Progressive Web Applications with [**Glue42 Core**](https://glue42.com/core/) not only leverages the advantages of PWAs (native-like feel, working offline, enhanced performance, etc.), but incorporates an interoperability layer in your web application ecosystem as well. 

In industries and businesses depending on tens or hundreds of different applications for processing information (e.g., financial market data, client data) interoperability between applications has become an urgent necessity. Enabling applications to expose functionality, share data between each other and control other windows allows you to create meaningful window arrangements and define coherent workflows for the user. [**Glue42 Core**](https://glue42.com/core/) solves user-oriented problems, like errors from copy/pasting between apps, wasting time in finding and launching the right app, constant switching between many already running apps or making the best use of the precious screen real estate. This dramatically increases task completion times and user satisfaction. On a larger scale, enhancing employee productivity leads to reduced costs and higher customer satisfaction.  

## High Level Structure

A [**Glue42 Core**](https://glue42.com/core/) project consists of a Main application using the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library and multiple client applications using the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library. The Main application acts as a hub through which the user can access all other applications part of the [**Glue42 Core**](https://glue42.com/core/) project while the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library it uses provides the communication connection between all client applications. The [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library provides Glue42 functionality to the client applications through sets of Glue42 APIs (for more details, see the [Capabilities](../../capabilities/application-management/index.html) section).

## Requirements

The only requirement for users of your [**Glue42 Core**](https://glue42.com/core/) project is a modern browser. No additional software is required.

Developing a [**Glue42 Core**](https://glue42.com/core/) project requires:
- `Node.js` (version 10.14.X and up) and `npm` installed;
- general JavaScript knowledge;
- general web development knowledge;

If all this intrigues you, visit the [Quick Start](../quick-start/index.html) and [Capabilities](../../capabilities/application-management/index.html) to start exploring [**Glue42 Core**](https://glue42.com/core/).