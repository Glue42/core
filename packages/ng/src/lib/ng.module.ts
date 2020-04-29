// import { NgModule, APP_INITIALIZER, InjectionToken } from "@angular/core";
// import { ModuleWithProviders } from "@angular/compiler/src/core";
// import { Glue42ProviderService } from "./glue-provider.service";
// import { Glue42Web } from "@glue42/web";

// // import Glue, { Glue42 } from "@glue42/desktop";
// // import GlueWeb, { Glue42Web } from "@glue42/web";

// export function glueFactory(glueProvider: Glue42ProviderService, config: Glue42Web.Config, factory: any) {
//     return () => glueProvider.initialize(config, factory);
// }

// const GLUE_CONFIG = new InjectionToken<string>('GLUE_CONFIG');
// const GLUE_FACTORY = new InjectionToken<string>('GLUE_FACTORY');

// // @dynamic
// @NgModule()
// export class Glue42Ng {

//     public static with(settings: { config?: any, factory?: any } = { config: {} }): ModuleWithProviders {

//         return {
//             ngModule: Glue42Ng,
//             providers: [
//                 {
//                     provide: APP_INITIALIZER,
//                     useFactory: glueFactory,
//                     multi: true,
//                     deps: [Glue42ProviderService, GLUE_CONFIG, GLUE_FACTORY]
//                 },
//                 {
//                     provide: GLUE_CONFIG,
//                     useValue: settings.config
//                 },
//                 {
//                     provide: GLUE_FACTORY,
//                     useValue: settings.factory
//                 },
//                 Glue42ProviderService
//             ]
//         }
//     }
// }

import { NgModule, APP_INITIALIZER, ModuleWithProviders } from "@angular/core";
import { Glue42ProviderService } from "./glue-provider.service";

export function glueFactory(glueProvider: Glue42ProviderService): () => Promise<void> {
    return (): Promise<void> => glueProvider.initialize();
}

// @dynamic
@NgModule()
export class Glue42Ng {

    public static with(): ModuleWithProviders<Glue42Ng> {

        return {
            ngModule: Glue42Ng,
            providers: [
                {
                    provide: APP_INITIALIZER,
                    useFactory: glueFactory,
                    multi: true,
                    deps: [Glue42ProviderService]
                },
                Glue42ProviderService
            ]
        };
    }
}