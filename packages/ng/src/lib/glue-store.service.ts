/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Observable, ReplaySubject } from "rxjs";
import { Injectable } from "@angular/core";
import { Glue42Initializer } from "./glue-initializer.service";

@Injectable()
export class Glue42Store {
    private readonly readySource: ReplaySubject<{ error?: any }>;
    private glueInstance: Glue42.Glue | Glue42Web.API;
    private _initError: any;

    constructor(private readonly initializer: Glue42Initializer) {
        this.readySource = new ReplaySubject<{ error?: any }>(1);
        this.initializer.onState().subscribe(this.handleState.bind(this));
    }

    public ready(): Observable<{ error?: any }> {
        return this.readySource.asObservable();
    }

    public getInitError(): any {
        return this._initError;
    }

    public getGlue(): Glue42.Glue | Glue42Web.API {
        if (!this.glueInstance) {
            throw new Error("Accessing uninitialized glue. This might happen, because Glue is not initialized yet or because there was an error during Glue initialization. Please check the initError object or subscribe to the ready observable.");
        }

        return this.glueInstance;
    }

    private handleState(result: { glueInstance?: Glue42Web.API | Glue42.Glue; error?: any }): void {
        if (result.glueInstance) {
            this.glueInstance = result.glueInstance;
            this.readySource.next({});
            return;
        }

        if (result.error) {
            this._initError = result.error;
            this.readySource.next({ error: this.getInitError() });
            return;
        }
    }
}
