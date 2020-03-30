## Overview

We have already covered how to set up your environment for a single application **TODO: Link** and multiple applications **TODO: Link**. Now we will take a look at how to initialize a simple Vanilla JS app as a Glue42 Client **TODO: Link**.

We will assume that the application is a simple, light app, with just an index.html and a couple of JS files.

## Prerequisites 

We will assume that this is the only application in the project and that you have already did the environment setup. Next we need to get the `@glue42/web` npm package which will connect our client to the environment and give us access to the Glue42 Web API **TODO: Link**.

## Set up Glue42 Web

First, we need to get the package:

```javascript
npm install --save @glue42/web
```

Next we need to reference it from the **index.html** with a simple `<script>` tag, like this:

```html
<script src="./node_modules/@glue42/web/dist/web.umd.min.js">
<script src="./index.js">
```

Generally it is not a good idea to serve your entire node_modules directory, so it would be better to set the source to something like `/web.js` and configure your server to correctly serve this resource or you can take advantage of the Glue42 Core CLI **TODO: Link**. We are using `web.umd.min.js` just to keep it simple, this script will attach a factory function `GlueWeb` to the `window` object.

Next we go to the `./index.js`, which in our example is just a simple JS file with an `init` method and we initialize Glue42 Web.

```javascript
const init = async () => {

    const glue = await GlueWeb();

    // here glue is initialized, the app has connected to the Glue42 Environment
    // your custom app logic here
};

init().catch(console.error);
```

When `GlueWeb()` resolves, we get a `glue` object which we can use to access the full Glue42 Web API **TODO: Link**. By default we are not required to pass a config object to `GlueWeb()`, but if you wish you can do so. Check out the Glue42 Client **TODO: Link** section for more info on the possible options.

That's it, the application is now configured as a Glue42 Client and can connect to the Glue42 Environment.

What remains now is to serve it. You can do that with your own server or you can use the Glue42 Core CLI as we have shown in the Single Application Setup section **TODO: Link**.
