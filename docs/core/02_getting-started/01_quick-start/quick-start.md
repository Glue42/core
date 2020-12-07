*RAW*

Quick starting a Glue42 Core project is very simple, all you need is to set up a main application and optionally a second applications - a client.

To set up a main applications you need to:
1. create a basic html file + a basic index.js file
2. in the html -> 
```html
<script src="https://unpkg.com/@glue42/web-platform@latest/dist/platform.web.umd.js"></script>
<script src="./index.js"></script>
```
3. in the index.js ->
```javascript
const init = async () => {
    const { glue } = await window.GlueWebPlatform();
    console.log(`Glue42 initialized successfully! Glue42 version: ${glue.version}`);
};

init().catch(console.error);
```
Now we have a fully working Main application
In order to add another application -> repeat the same steps, but use different package and factory function:
```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
<script src="./index.js"></script>
```
```javascript
const init = async () => {
    const glue = await window.GlueWeb();
    console.log(`Glue42 initialized successfully! Glue42 version: ${glue.version}`);
};

init().catch(console.error);
```

Now we also have a client, which can be opened by using the windows library and the url that the app was deployed to.

*END*

## Guide

This guide will show you how to easily create, setup and run a simple **Glue42 Core** project.

<!-- TODO -->

2. Create a root project directory with basic `index.html` and `index.js` files in it and reference the `index.js` file in the `index.html` file with a `<script>` tag.

Your project directory should look like something this:

```cmd
/myApp
    /index.html
    /index.js
```

Your `index.html` should contain this:

```html
<script src="index.js"></script>
```


4. In your `index.html` file, reference the latest [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library module from `UNPKG`:

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
<script src="./index.js"></script>
```

5. Go to your `index.js` file and declare a simple initialization function like the one below:

```javascript
const init = async () => {
    const glue = await window.GlueWeb();
    console.log(`Glue42 initialized successfully! Glue42 version: ${glue.version}`);
};

init().catch(console.error);
```



## Next Steps

Congratulations, you now have your very first **Glue42 Core** app! 

*For deploying your project, see the [Project Deployment](../project-deployment/index.html) section.*

*For more information on the **Glue42 Web** library, see the [Reference](../../../reference/core/latest/glue42%20web/index.html) section.*