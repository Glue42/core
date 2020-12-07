*RAW*

A "Platform" or "Platform app" or "Main app" in the context of Glue42 Core V2 is a web applications, which imports, configures and initializes the @glue42/web-platform package.

This app is effectively in charge of configuring and running the whole Glue environment and serves as a central hub for all Glue Core clients.

As such, if this applications is closed - all clients will lose their glue connections and as a result, their glue capabilities.

If the main app is refreshed - the existing clients will detect that and reconnect as soon as the main app is back online.

Closing the main app and then opening it again will NOT cause the existing clients to reconnect, because this will effectively be a new window, with a new session and new context.

All glue operations are routed through the main app, which means that this is place where you can get centralized logging and information about the operations and state of your glue project.

It is the job of the main app to configure how to use AppManager, Layouts, Channels, Workspaces, Plugins and Notifications.

The main applications is also able to provide tracking and control over non-glue apps opened by it. The level of control over non-glue apps is limited, but all the basic operations are there like: opening, getting events, closing, listing and adding and manipulating via workspaces. 

*END*

## Overview