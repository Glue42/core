*RAW*

I am not 100% sure that info to give here, because the clients function exactly the same was as in V1. I will just throw some info, which comes to mind, maybe it will help.

A client is a web application, which connections to Glue via @glue42/web package. This app does not configure and launch the glue core environment and it expects that it will be set by a Main application.

A client web application cannot initialize @glue42/web more than once. Doing so will result in an initiation rejection and error.

It si highly recommended that initializing @glue42/web is performed as a start-up step for the application, so that it is discovered and registered as a Glue Client by the rest of the running apps and Main app as soon as possible.

Possible reasons for rejecting initializing
- incorrect config
- the app has not been opened by a glue app

*END*

## 

<!-- TODO -->