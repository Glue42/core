/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Subject, Observable } from "rxjs";
import { GlueConfigService } from "./glue-config.service";

@Injectable()
export class Glue42Initializer {
    private readonly defaultInitTimeoutMilliseconds = 3000;
    private initializationSource = new Subject<{ glueInstance?: Glue42Web.API | Glue42.Glue; error?: any }>();

    constructor(private readonly configService: GlueConfigService) { }

    public start(): Promise<void> {

        try {
            this.configService.verifyConfig();
        } catch (error) {
            this.initializationSource.next({ error: { message: error.message } });
            this.initializationSource.complete();
            return Promise.resolve();
        }

        const config = this.configService.getConfig();
        const factory = this.configService.getFactory();

        if (!factory) {
            const errorMessage = "Initialization failed, because no Glue Factory function was found. Please provide a factory function when importing the Glue42Ng module. Alternatively make sure there is a GlueWeb or Glue or GlueWebPlatform function attached to the global window object";
            this.initializationSource.next({ error: { message: errorMessage } });
            this.initializationSource.complete();
            return Promise.resolve();
        }

        const gluePromise = this.safeCallFactory(config, factory, this.defaultInitTimeoutMilliseconds, `Glue factory timeout hit. Set at: ${this.defaultInitTimeoutMilliseconds} milliseconds`)
            .then((glueResult) => {
                this.initializationSource.next({ glueInstance: glueResult.glue });
                this.initializationSource.complete();
            })
            .catch((error) => {
                this.initializationSource.next({ error });
                this.initializationSource.complete();
            });

        return this.configService.getSettings().holdInit ? gluePromise : Promise.resolve();
    }

    public onState(): Observable<{ glueInstance?: Glue42Web.API | Glue42.Glue; error?: any }> {
        return this.initializationSource.asObservable();
    }

    private safeCallFactory(config: any, factory: any, timeoutMilliseconds: number, timeoutMessage: string): Promise<{ glue: Glue42.Glue | Glue42Web.API }> {
        return new Promise((resolve, reject) => {
            let timeoutHit = false;

            const timeout = setTimeout(() => {
                timeoutHit = true;

                const message = timeoutMessage;

                reject(message);
            }, timeoutMilliseconds);

            factory(config)
                .then((result: any) => {
                    if (!timeoutHit) {
                        clearTimeout(timeout);

                        const glue = result.glue || result;

                        resolve({ glue });
                    }
                })
                .catch((error: any) => {
                    if (!timeoutHit) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                });
        });
    }
}
