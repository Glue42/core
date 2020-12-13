## Overview 

The **Glue42 Angular** wrapper, [`@glue42/ng`](https://www.npmjs.com/package/@glue42/ng), provides you with an easy way to initialize the Glue42 JavaScript libraries and use Glue42 functionalities in your projects. It works with the [@glue42/web](../../../../reference/core/latest/glue42%20web/index.html) and [@glue42/web-platform](../../web-platform/overview/index.html) libraries, if you are working on a **Glue42 Core** project, and with the [@glue42/desktop](../../../../reference/glue/latest/glue/index.html) library, if you are working on a **Glue42 Enterprise** project. The examples below use the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library.

## Prerequisites

This package should be used only in Angular applications. If you created your app with the Angular CLI, then you don't need to take any additional steps. Otherwise, make sure to install the peer dependencies of `@glue42/ng`:

```json
"dependencies": {
    "@angular/common": "^9.1.3",
    "@angular/core": "^9.1.3",
    "rxjs": "^6.5.5",
    "tslib": "^1.10.0"
}
```

Please note that [`@glue42/ng`](https://www.npmjs.com/package/@glue42/ng) supports Angular 7+. 

The example below assumes that your app was created with the Angular CLI. Install `@glue42/ng` and the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library:

```cmd
npm install --save @glue42/ng @glue42/web
```

## Library Features

The Glue42 Angular library exposes two important elements:
- `Glue42Ng` - an Angular module that initializes the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library;
- `Glue42Store` - an Angular service that gives access to the Glue42 Web APIs;

### Glue42Ng Module

The `Glue42Ng` module is responsible for initializing the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library. You must import the `Glue42Ng` module **once** for the entire application - in the **root module** by using the `forRoot()` method. This methods accepts a settings object which has the following signature:

```typescript
export interface Glue42NgSettings {
    holdInit?: boolean;
    web?: {
        factory?: Glue42WebFactoryFunction;
        config?: Glue42Web.Config;
    };
    webPlatform?: {
        factory?: Glue42WebPlatformFactoryFunction;
        config?: Glue42WebPlatform.Config;
    };
    desktop?: {
        factory?: Glue42DesktopFactoryFunction;
        config?: Glue42.Config;
    };
}
```


- `web` - *Optional*. An object which contains the appropriate configuration object for a the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library and the factory function exposed by it. You should define this object, if you are building your application as a Glue42 Web Client.
- `webPlatform` - *Optional*. An object which contains the appropriate configuration object for a the [@glue42/web-platform](../../web-platform/overview/index.html)) library and the factory function exposed by it. You should define this object, if you are building your application as a Web Platform application (or "Main application") in the context of **Glue42 Core**.
- `desktop` - *Optional*. An object which contains the appropriate configuration object for a the [@glue42/desktop](../../../../reference/glue/latest/glue/index.html) library and the factory function exposed by it. You should define this object, if you are building your application as a Glue42 Enterprise Application.
- `holdInit` - *Optional*. Toggles whether or not your app initialization should wait for the Glue42 factory function to resolve. Defaults to `true`;

Please note that you cannot define a `web` and `webPlatform` property at the same time, but you can define one of those two options together with `desktop`, if you wish you application to have different initialization characteristics in Glue42 Core and Glue42 Enterprise.

What's more, all properties are optional, but we recommend that you provide the factory functions you need explicitly. If no factory functions are provided, the library will try and pick an appropriate function attached to the global `window` object.

The initialization of the Glue42 Web library is asynchronous and therefore may take anywhere from a few milliseconds to a couple of seconds. There are two main situations in which setting `holdInit` to `true` (default) or `false` will benefit your project: 

- `holdInit: false` - If the Glue42 functionalities play only a supporting role in your project, rather than being an essential part of it, it is recommended that you set `holdInit` to `false`. This way, your app will not have to wait for the Glue42 library to initialize in order to be able to function properly. You can use the `Glue42Store` service to get notified when the Glue42 Web library is ready. 

- `holdInit: true` - If the Glue42 functionalities are a critical part your project, then it is recommended to leave `holdInit` set to `true`. This way, Angular will wait for the Glue42 factory function to resolve before bootstrapping your first component. This will spare you the need to check whether the Glue42 Web library is available or not every time you want to use it in your app. As a negative result to this approach, when your users load the app, they will keep seeing a blank screen up until the first component has been bootstrapped. Of course, you can solve this by providing a loader animation as soon as your app is accessed.

The example below shows how to initialize the Glue42 Web library by passing a factory function and a custom configuration object:

```javascript
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        Glue42Ng.forRoot({ web: { factory: GlueWeb } })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

*It is important to note that if the Glue42 initialization fails for any reason (invalid configuration, missing factory function, connection problems or initialization timeout), your app will still initialize.*

### Glue42Store Service

The `Glue42Store` service is used to obtain the `glue` object which exposes the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) API. This service can also notify you when the Glue42 Web library has been initialized and enables you to check for any initialization errors.

Example of creating a `Glue42Store` service:

```javascript
import { Injectable } from "@angular/core";
import { Glue42Store } from "@glue42/ng";

@Injectable()
export class Glue42Service {
    constructor(private readonly glueStore: Glue42Store) { }
}
```

The `Glue42Store` service offers the following methods:

- `this.glueStore.ready()` - returns an `Observable`. If you subscribe to it, you will be notified when the Glue42 Web library has been initialized. If the initialization fails, you will receive an object with an `error` property, otherwise the object will be empty. This is particularly useful if you set `holdInit` to `false` when initializing the library, because you need to make sure that the Glue42 library is ready for use before accessing any of its APIs;
- `this.glueStore.getInitError()` - returns an initialization error object from the Glue42 factory function or `undefined`;
- `this.glueStore.getGlue()` - returns the Glue42 Web API object. If needed, it is up to the developer to cast the returned object to the respective type (either `Glue42.Glue` or `Glue42Web.API` depending on the used Glue42 JavaScript library);

You can now inject the service in the components that need it and access the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) API from the `this.glueStore.getGlue()` object. This gives you a decent level of encapsulation and control. If you prefer handling async actions with `Observables`, then this service is the perfect place to wrap the methods you want to use in `Observables`.

## Usage

The following examples demonstrate initializing and using the Glue42 Angular library.

### Initialization

Import the `Glue42Ng` module in the root module of your app and pass the factory function from `@glue42/web`:

```javascript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        Glue42Ng.forRoot({ web: { factory: GlueWeb } })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

### Consuming Glue42 Web APIs

Inject the `Glue42Store` service in your component/service of choice in order to use the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) API. It is recommended that you create your own Angular service that injects the `Glue42Store` and exposes only the functionality your app needs.

When initializing the Glue42 Web library with the `Glue42Ng` module, you can use the `holdInit` property (see [Glue42Ng Module](#library_features-glue42ng_module)) to configure the Angular framework to wait or not for the Glue42 factory function to resolve before bootstrapping your first component. Depending on this setting, you can use the `Glue42Store` service in different ways. Below are given examples and short explanations for both cases:

- #### holdInit: true

Creating the service:

```javascript
import { Injectable } from "@angular/core";
import { Glue42Store } from "@glue42/ng";

@Injectable()
export class Glue42Service {

    constructor(private readonly glueStore: Glue42Store) { }

    public get glueAvailable() {
        return !this.glueStore.getInitError();
    }

    public registerMethod(name: string, callback: () => void): Promise<void> {
        if (!this.glueAvailable) {
            return Promise.reject("Glue42 was not initialized.");
        }
        return this.glueStore.getGlue().interop.register(name, callback);
    }
}
```

Using the service:

```javascript
import { Component, OnInit } from "@angular/core";
import { Glue42Service } from "./my-glue-service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

    constructor(private glueService: Glue42Service) { }

    public ngOnInit(): void {
        if (!this.glueService.glueAvailable) {
            // Тhere has been an error during the Glue42 initialization.
            return;
        }
        // Glue42 has been initialized without errors and is ready to use.
    }
}
``` 

If you set `holdInit` to `true` (default), you can be sure that everywhere you inject the `Glue42Store` service, the respective properties will be initialized and set. This is very convenient, because you don't have to subscribe and wait for an event in order to use the Glue42 Web library. However, you do need to always check if there is an initialization error by using `this.glueStore.getInitError()`. If the Glue42 factory function throws an error, your app will not crash, but Glue42 will not be available and the value returned by `getInitError()` will be set to the respective error object during initialization.

- #### holdInit: false

Creating the service:

```javascript
import { Injectable } from "@angular/core";
import { Glue42Store } from "@glue42/ng";

@Injectable()
export class Glue42Service {

    constructor(private readonly glueStore: Glue42Store) { }

    public ready() {
        return this.glueStore.ready;
    }

    public registerMethod(name: string, callback: () => void): Promise<void> {
        return this.glueStore.getGlue().interop.register(name, callback);
    }
}
```

Using the service:

```javascript
import { Component, OnInit } from "@angular/core";
import { Glue42Service } from "./my-glue-service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

    constructor(private glueService: Glue42Service) { }

    public ngOnInit(): void {
        // Show the loader.
        this.glueService
            .ready()
            .subscribe((glueStatus) => {
                if (glueStatus.error) {
                    // Hide the loader.
                    // Glue42 is not available.
                    return;
                }
                // Hide the loader.
                // Glue42 is ready, continue with your logic.
            })
    }
}
```

As you can see, this approach requires a little bit more code, but it gives you an easy way to provide pleasant user experience while Glue42 is initializing, handle gracefully any initialization errors, and when the initialization resolves normally, you don't need to check the error object as in the previous example.