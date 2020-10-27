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

    constructor(public id: string, private control: Control, public agm: Glue42Web.Interop.Instance) {
        this.control.setLocalInstance(this);
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.startedByScript) {
                // The calling party is responsible for tracking the resolve condition.
                resolve();

                window.close();
            } else {
                reject("Can't close a window that wasn't started by a script.");
            }
        });
    }
}
