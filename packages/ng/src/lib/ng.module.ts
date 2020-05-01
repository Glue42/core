import { NgModule, APP_INITIALIZER, ModuleWithProviders, Optional, SkipSelf } from "@angular/core";
import { Glue42Store } from "./glue-store.service";
import { Glue42NgSettings } from "./types";
import { Glue42Initializer } from "./glue-initializer.service";

// @dynamic
@NgModule()
export class Glue42Ng {

    constructor(@Optional() @SkipSelf() parentModule?: Glue42Ng) {
        if (parentModule) {
            throw new Error("Glue42Ng Module is already loaded. Import it in the AppModule only");
        }
    }

    public static forRoot(settings?: Glue42NgSettings): ModuleWithProviders<Glue42Ng> {

        settings = Object.assign({ holdInit: true }, settings);

        const initializerFactory = settings.holdInit ?
            (initializer: Glue42Initializer) => (): Promise<void> => initializer.start(settings.config, settings.factory) :
            (initializer: Glue42Initializer) => (): void => { initializer.start(settings.config, settings.factory); };

        return {
            ngModule: Glue42Ng,
            providers: [
                {
                    provide: APP_INITIALIZER,
                    useFactory: initializerFactory,
                    multi: true,
                    deps: [Glue42Initializer, Glue42Store]
                },
                Glue42Store,
                Glue42Initializer
            ]
        };
    }
}