## Overview 

Initializing Glue42 Web JS in Vanilla JS is as simple as calling a function, which returns a promise, waiting the promise and consuming the API exposed by the returned `glue` object. This is not complicated at all, but we can make it even more convenient for Angular developers and we did just that with `@glue42/ng`. The `@glue42/ng` package is a simple, lightweight, angular-friendly wrapper which makes initializing a Glue42 Client easy and consuming the Glue42 Web API painless. What's more, `@glue42/ng` is also fully compatible with Glue42 Enterprise JS. 

The `@glue42/ng` package exposes two important elements:
- `Glue42Ng` - an Angular module, which initializes Glue42 Web JS or Glue42 Enterprise JS.
- `Glue42Store` - an Angular service, which gives access to the Glue42 Web API or the Glue42 Enterprise JS API.

## Prerequisites

This package should be used only in Angular applications. If your app was created with the Angular CLI, then you don't need to make any additional steps. If you have manually created your app, then you need to make sure the peer dependencies of `@glue42/ng` are also installed:
- `"@angular/common": "^9.1.3"`
- `@angular/core": "^9.1.3"`
- `rxjs": "^6.5.5`
- `tslib": "^1.10.0`

## Getting Started

We will assume your app was created with the Angular CLI, if not then make sure you have the above packages installed. Install `@glue42/ng` and the Glue Js library you need:

```cmd
npm install --save @glue42/ng
```

Next, import the **Glue42Ng** module in your app's **root module only** and pass in the factory function from `@glue42/web` (or `@glue42/desktop`, if you are building a Glue42 Enterprise application):

```javascript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";
// import Glue from "@glue42/desktop" -> use this for Glue42 Enterprise

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Glue42Ng.forRoot({ factory: GlueWeb })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Now when your app starts, it will initiate the Glue Web JS library. Finally you need to inject the **Glue42Store** service in your component/service of choice in order to use the API:

```javascript
import { Component } from '@angular/core';
import { Glue42Store } from '@glue42/ng';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private glueStore: Glue42Store) { }

}

```

You can now access the Glue42 Web JS API from `this.glueStore.glue`. Next we will take a deep look into the `Glue42Ng` module, `Glue42Store` service and the respective configuration options.

## Glue42Ng

The **Glue42Ng** module is responsible for initialing the correct Glue JS library (`@glue42/web` or `@glue42/desktop`). You can use the module to pass in the factory function of the Glue which you want to connect to, you can also pass the configuration object for the factory function and, last but not least, you can configure whether or not the Angular app bootstrap sequence should wait for the glue factory function to resolve or not.

Importing the **Glue42Ng** module must be done **once** for the entire application, in the **root module**, using the `.forRoot()` method. This methods accepts a settings object, which has the following properties:

|Property|Type|Description|Default|
|--------|----|-----------|-------|
|`config`|`Glue42Web.Config or Glue42.Config`|**Optional** The config object, which is optionally accepted by the Glue42 Web and Enterprise factory functions | - |
|`factory`|`Glue42 factory function`|**Optional** The Glue42 Web or Enterprise factory function | `window.Glue or window.GlueWeb` |
|`holdInit`|`boolean`|**Optional** Toggles whether or not your app initialization should wait for the glue factory | `true` |

Example:
```javascript
// previous code
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Glue42Ng.forRoot({ factory: GlueWeb, config: { extends: false } })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

In this example `@glue42/ng` will use the `GlueWeb` factory function and the provided config object to initialize the JS library. What's more, the app initialization will wait for the factory function to resolve, before continuing with the app initialization.

It is important to note that if the Glue initialization fails for whatever reason (invalid config, missing factory function, connection problems or initiation timeout), your app will still initialize.

## Glue42Store

The **Glue42Store** service is used to obtain the `glue` object which exposes the Glue42 Web API or Glue42 Enterprise API (depending on environment in which your application is running: either Glue42 Enterprise or the browser in the case of Glue42 Core). This service is also useful in order to get notified when Glue was initialized and to check for any initiation errors.

```javascript
constructor(private glueStore: Glue42Store) { }
```

The service has the following methods:
- `this.glueStore.ready()` - returns an observable. If you subscribe, you will be notified when Glue initializes. If the initialization fails, you will get an object with an `error` property, otherwise the object will be empty. This is particularly useful, if you set `.forRoot({ holdInit: false })`, because you need to make sure glue is ready to be used, before accessing any of the APIs.
- `this.glueStore.initError` - returns an error object of `undefined`. This will hold the glue factory initiation error object, if any.
- `this.glueStore.glue` - returns either a **Glue42 Web API** or **Glue42 Enterprise API** object, depending on the execution environment (Glue Desktop or a browser). If needed, it is up to the developer to cast the returned object to either `Glue42.Glue` or `Glue42Web.API`.

## Recommended usage

### Initialization

Example:
```javascript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Glue42Ng } from "@glue42/ng";
import GlueWeb from "@glue42/web";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Glue42Ng.forRoot({ factory: GlueWeb, holdInit: false })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

We recommend importing the module with `holdInit: false`. The Glue JS initialization (Web and Enterprise) is async and therefore can take anywhere between a few milliseconds to a couple of seconds. If `holdInit` is set to `true` (by default it is), then Angular will wait for this factory function to resolve before bootstrapping your first component. As a result when your users load the app, they will see a blank screen up until the first component is bootstrapped. There are two ways to avoid this unpleasant experience:

- Leave `holdInit: true` and provide a loader animation as soon as your app is accessed 
- Set `holdInit: false`, let Angular bootstrap normally and use the **Glue42Store** to get notified when Glue is ready

### Consuming the Glue JS API

We recommend creating your own Angular service, which injects the **Glue42Store** and exposes only the functionality your app needs.

Example with `holdInit: true`:
```javascript
import { Injectable } from "@angular/core";
import { Glue42Store } from '@glue42/ng';

@Injectable()
export class Glue42Service {
    constructor(private readonly glueStore: Glue42Store) { }

    public get glueAvailable() {
        return !!this.glueStore.initError;
    }

    public registerMethod(name: string, callback: () => void): Promise<void> {
        if (!this.glueAvailable) {
            return Promise.reject("Glue was not initialized");
        }
        return this.glueStore.glue.interop.register(name, callback);
    }

}
```

```javascript
import { Component, OnInit } from '@angular/core';
import { Glue42Service } from './my-glue-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private glueService: Glue42Service) { }

    public ngOnInit(): void {
        if (!this.glueService.glueAvailable) {
          // there was an error during the Glue initialization
          return;
        }
        // glue initialized without errors and is ready to be used
    }

}

```

Now you can inject your service in the components which need it. This gives your decent level of encapsulation and control. If you prefer handling async actions with observables, then this service is the perfect place to wrap the methods you use in observables.

When `holdInit: true`, you can be sure that everywhere you inject the **Glue42Store**, the respective properties will be initialized and set. This makes it very convenient, because you don't have to subscribe and wait for an event in order to use glue. However, you do need to always check if there is an `initError`. If the glue factory rejects or throws, your app will not crash, but glue will not be available and the `initError` will be set to the error object during initialization. 

Example with `holdInit: false`:

```javascript
import { Injectable } from "@angular/core";
import { Glue42Store } from '@glue42/ng';

@Injectable()
export class Glue42Service {
    constructor(private readonly glueStore: Glue42Store) { }

    public ready() {
        return this.glueStore.ready;
    }

    public registerMethod(name: string, callback: () => void): Promise<void> {
        return this.glueStore.glue.interop.register(name, callback);
    }

}
```

```javascript
import { Component, OnInit } from '@angular/core';
import { Glue42Service } from './my-glue-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private glueService: Glue42Service) { }

    public ngOnInit(): void {
        // show loader
        this.glueService
            .ready()
            .subscribe((glueStatus) => {
                if (glueStatus.error) {
                    // hide loader
                    // glue is not available
                    return;
                }

                // hide loader
                // glue is ready, continue with your logic
            })
    }

}

```

As you can see this approach requires a little bit more code, but it gives you easy way to provide pleasant user experience while Glue is initializing, handle gracefully any initialization errors and when the initialization resolved normally, you don't need to always check the error object like the previous example.