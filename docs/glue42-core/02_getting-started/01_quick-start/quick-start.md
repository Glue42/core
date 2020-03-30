## Overview

The idea here is to get you up and running as fast as possible with a new simple application.

## Step One

Install the Glue42 Core CLI globally.

```javascript
npm install --global @glue42/cli-core
```

## Step Two

Create a new app directory with a basic html and a basic JS file.

Your directory should look like this:

```text
/myApp
    /index.html
    /script.js
``` 

Reference the JS file with a `<script>` tag.

## Step Three

Open a terminal inside the directory and initiate Glue42 Core:

```javascript
gluec init
```

## Step Four

Initiate npm and get the `@glue42/web` npm package:

```javascript
npm init --yes
npm install --save @glue42/web 
```

## Step Five

Go to the `index.html` and reference the `@glue42/web` dist file. Your html should look like this

```html
<script src="/glueweb.js">
<script src="./script.js">
```

## Initiate Glue42Web

Go to `./script.js`, declare a simple `init` function like this:

```javascript

const init = async () => {
    const glue = await GlueWeb();
    console.log(`Glue initialized with version: ${glue.version}`);
}

init().catch(console.error);

```

## Configure the Glue42 Core CLI

Configure the CLI to serve your app and the Glue42 Web script. To do that go over to `glue.config.dev.json` and modify it to look like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/",
                "file": {
                    "path": "./"
                }
            }
        ],
        "sharedAssets": [
            {
                "route": "/glueweb.js",
                "path": "./node_modules/@glue42/web/dist/web.umd.min.js"
            }
        ]
    }
}
```

## Step Six

Launch your app:

```javascript
gluec serve
```

Now when you head over to `localhost:4242` your app will be served and if you open the console you will see the printed message that Glue is initialized.

This is how you get from 0 to Glue42 Core App as quickly as possible. For more information on setting up your Glue42 Core Environment **TODO: link**, head over to Setting Up Single Application **TODO: Link**. Or if you wish to launch a React app, you can check out our React library **TODO: Link**.