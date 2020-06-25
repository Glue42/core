import { Glue42Web } from "../../web";
import { Control } from "../control/control";

/**
 * Our local application instance.
 * Implements Glue42Web.AppManager.Instance by calling direct methods of the browser window object.
 */
export class LocalInstance implements Glue42Web.AppManager.Instance {
    public context = {};
    public startedByScript = false;
    public application: Glue42Web.AppManager.Application = undefined as unknown as Glue42Web.AppManager.Application;

    constructor(public id: string, private control: Control, private _appManager: Glue42Web.AppManager.API, public agm: Glue42Web.Interop.Instance) {
        control.setLocalInstance(this);
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.startedByScript) {
                const unsubscribe = this._appManager.onInstanceStopped((instance) => {
                    if (instance.id === this.id) {
                        unsubscribe();
                        resolve();
                    }
                });

                window.close();
            } else {
                reject("Can't close a window that wasn't started by a script.");
            }
        });
    }
}
