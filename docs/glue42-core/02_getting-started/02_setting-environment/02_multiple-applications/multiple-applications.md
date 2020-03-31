## Overview

There are situations where your project is not a single app with multiple modules or components, but instead it is composed of multiple applications. Some created using Vanilla JS, others with React maybe Angular, etc. This is exactly the case where Glue42 Core and it's CLI really expands your dev toolkit.

Setting up a multi-app Glue42 Core environment is easy and almost identical to single-app environment, discussed in the Single Application Set Up **TODO: Link**. That's why we are not going go in details, rather we will go over each step and expand on the information from the Single Application Set Up.

If you a working on a multi-app project, then your file structure looks something like this

```text
/ProjectA
    /ApplicationA-SRC
    /ApplicationB-SRC
    /ApplicationC-SRC
    /shared
```

We will continue forward with the assumption that in our case:
- ApplicationA-SRC is the source of a React app
- ApplicationB-SRC is the source of an Angular app
- ApplicationC-SRC is the source of a Vanilla JS app
- shared is a directory which contains assets shared by all three apps, like fonts, icons, etc

## CLI

### Step One

First, go to your project's root, in our case `/ProjectA` and initiate Glue42 Core:

```javascript
gluec init
```

Naturally, we are doing this in the project root, not inside the applications like we did in Single Application Set Up **TODO: Link**. The output of this command will be identical - we have the dependencies in `./node_modules` and the three scaffolded Glue42 Environment files. 

### Step Two

In Single Application Set Up **TODO: Link** we went through two basic scenarios - proxying to a served app or serving an app from the file system. All of this is completely valid, but this time, we can define in `glue.config.dev.json` multiple applications. On top of that we can mix them - some might be hosted by our framework of choice, other might just be built. Let's look at a practical example.

We will assume the following arrangement:
- ApplicationA-SRC will be served by React at `localhost:3000`
- ApplicationB-SRC will be served by Angular at `localhost:4200`
- ApplicationC-SRC will be built at `/ApplicationC-SRC/dist`

Our goal is to have the following:
- `localhost:4242` -> ApplicationA
- `localhost:4242/apptwo` -> ApplicationB
- `localhost:4242/appthree` -> ApplicationC

Here is how the `glue.config.dev.json` should look like:
```json
{
    // some other stuff
    "apps": [
        {
            "route": "/",
            "localhost": {
                "port": 3000
            }
        },
        {
            "route": "/apptwo/",
            "localhost": {
                "port": 4200
            }
        },
        {
            "route": "/appthree",
            "file": {
                "path": "./ApplicationC-SRC/dist"
            }
        }
    ]
    // some other stuff
}
```

Like we explained in Single Application Set Up **TODO: Link**, you are free to choose between serving your app with it's framework's tools or simply building it and letting Glue42 Core Cli serve it from the file system.

Before we continue, we need to tell our Angular app (ApplicationB) that it is no longer served at root. By default React, Angular and basically any other framework will configure their assets, scripts, client-side routing logic, etc as if the app is served at root level. This makes sense from the frameworks' perspective, but in our case, ApplicationB is served from a route `/apptwo/`. This is framework-specific and has nothing to do with Glue42 Core, but we will explain it for Angular and React.

#### React

If you have a standard app created by Create React App, then you need to two things.

First go to the `package.json` and add:

```json
{
    "homepage": "/apptwo/"
}
```

This will instruct React to search of assets at `/apptwo/...`, instead of `/...`.

Second, you need to tell the React Router that the basename is no longer `/`. This looks like this:

```javascript
<BrowserRouter basename="/apptwo/" />
<Link to="/today"/> // renders <a href="/apptwo/today">
```

#### Angular

In Angular your achieve the same by going to the `angular.json` and adding `baseHref` next to our `outputPath` and `index`

```json
{
    "outputPath": "dist/appone",
    "index": "src/index.html",
    "main": "src/main.ts",
    "baseHref": "/apptwo/",
}
```

**Note** that in some cases you might also need to specify `deployUrl` next to `baseHref`.

**Important for all frameworks!** Notice that everywhere we specified the new base with **starting** and **ending** slashes `/apptwo/`. It is important to include both.

**Important for all frameworks!** We used `/apptwo/` as base value, because this is the route value we used in `glue.config.dev.json` in the example above. Keep in mind that the `route` value in `glue.config.dev.json` and base value you configure should be identical.

**Important for all frameworks!** Currently version 1.0.0 of the CLI does **not** support deep levels of app route declaration. Meaning that `"route": "/myapps/apptwo"` is not currently supported. Please stick to only one level of depth: `"route": "/apptwo"`.

After we have configured the applications, we need to either serve or build them. In our example we are serving both the React and Angular apps with their respective built-in tools.

### Step Three

Great, so we have our apps declared in `glue.config.dev.json` and the necessary configurations for baseHref and routing are also done. Let's start the dev server:

```javascript
gluec serve
```

The server fires up at port `4242` and indeed all of our apps are at the expected locations. Furthermore, because we proxied to the Angular and React apps which are served by their respective built-in servers, we have fully working Life Reloading (as configured per app).

**Note** that any client-side routing you might have will still be working as expected.

### Shared Assets

When you are working on a multi-app project, it is natural to have some assets shared by all apps. If you wish the Glue42 Core CLI dev server to also serve those assets, you can easily set this up in the `glue.config.dev.json`. Here is how.

```json
{
    "server": {
        "sharedAssets": [
            {
                "route": "/shared",
                "path": "./shared/"
            }
        ]
    },
}
```

You can use this to define entire directories like we have done, or you can just specify individual files.

## Manual

If you wish to set everything up on your own, because none of the built-in solutions fits you, then we got you covered too. Head over to the manual section of Single Application Set Up **TODO: Link**. The procedures and steps are identical with the only exception that you have to do them on project level, not on application level.  

However, bear in mind that setting up our example case (as defined in the beginning of this section) is harder than it seems, because the major requirement of Glue42 Core is that all Glue42 Clients and Glue42 Environment must be hosted on the same domain and port.