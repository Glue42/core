/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import { Glue42NgConfig, Glue42NgFactory } from "./types";
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Subject, Observable } from "rxjs";

@Injectable()
export class Glue42Initializer {
    private readonly defaultInitTimeoutMilliseconds = 3000;
    private initializationSource = new Subject<{ glueInstance?: Glue42Web.API | Glue42.Glue; error?: any }>();

    public async start(config: Glue42NgConfig, factory: Glue42NgFactory): Promise<void> {

        const glueFactory = factory || this.getGlueFactory();

        if (!glueFactory) {
            const errorMessage = "Initialization failed, because no Glue Factory function was found. Please provide a factory function when importing the Glue42Ng module. Alternatively make sure there is a GlueWeb or Glue function attached to the global window object";
            this.initializationSource.next({ error: { message: errorMessage } });
            this.initializationSource.complete();
            return;
        }

        try {
            const glueInstance = await this.safeCallFactory(config, glueFactory, this.defaultInitTimeoutMilliseconds, `Glue factory timeout hit. Set at: ${this.defaultInitTimeoutMilliseconds} milliseconds`);
            this.initializationSource.next({ glueInstance });
            this.initializationSource.complete();
        } catch (error) {
            this.initializationSource.next({ error });
            this.initializationSource.complete();
        }
    }

    public onState(): Observable<{ glueInstance?: Glue42Web.API | Glue42.Glue; error?: any }> {
        return this.initializationSource.asObservable();
    }

    private getGlueFactory(): Glue42NgFactory {
        return (window as any).GlueWeb || (window as any).Glue;
    }

    private safeCallFactory(config: Glue42NgConfig, factory: Glue42NgFactory, timeoutMilliseconds: number, timeoutMessage: string): Promise<Glue42Web.API | Glue42.Glue> {
        return new Promise((resolve, reject) => {
            let timeoutHit = false;

            const timeout = setTimeout(() => {
                timeoutHit = true;

                const message = timeoutMessage;

                reject(message);
            }, timeoutMilliseconds);

            factory(config)
                .then((result) => {
                    if (!timeoutHit) {
                        clearTimeout(timeout);
                        resolve(result);
                    }
                })
                .catch((error) => {
                    if (!timeoutHit) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                });
        });
    }
}
