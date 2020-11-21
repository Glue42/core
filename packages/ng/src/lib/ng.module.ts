import { NgModule, APP_INITIALIZER, ModuleWithProviders, Optional, SkipSelf } from "@angular/core";
import { Glue42Store } from "./glue-store.service";
import { Glue42NgSettings } from "./types";
import { Glue42Initializer } from "./glue-initializer.service";
import { CONFIG_TOKEN } from "./tokens";
import { GlueConfigService } from "./glue-config-service";

const initFactory = (initializer: Glue42Initializer): void | Promise<void> => initializer.start();

// @dynamic
@NgModule()
export class Glue42Ng {

    constructor(@Optional() @SkipSelf() parentModule?: Glue42Ng) {
        if (parentModule) {
            throw new Error("Glue42Ng Module is already loaded. Import it in the AppModule only");
        }
    }

    public static forRoot(settings?: Glue42NgSettings): ModuleWithProviders<Glue42Ng> {

        return {
            ngModule: Glue42Ng,
            providers: [
                {
                    provide: CONFIG_TOKEN,
                    useValue: settings
                },
                GlueConfigService,
                Glue42Store,
                Glue42Initializer,
                {
                    provide: APP_INITIALIZER,
                    useFactory: initFactory,
                    multi: true,
                    deps: [GlueConfigService, Glue42Initializer, Glue42Store]
                }
            ]
        };
    }
}