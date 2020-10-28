import { Glue42Web } from "../../web";
import { Control } from "../control/control";
import { promisePlus } from "../shared/promise-plus";

export class RemoteInstance implements Glue42Web.AppManager.Instance {
    public context: object;
    private WINDOW_DID_NOT_HAVE_TIME_TO_RESPOND = "Peer has left while waiting for result";

    // window can be undefined in the case when `serverMethodAdded()` is fired after the window is already closed.
    constructor(public id: string, public application: Glue42Web.AppManager.Application, private control: Control, public agm: Glue42Web.Interop.Instance, private appManager: Glue42Web.AppManager.API, private window?: Glue42Web.Windows.WebWindow) {
        // `getContext()` relies on the control having been started.
        const unsub = control.onStart(() => {
            this.window?.getContext().then((context: object) => {
                unsub();
                this.context = context;
            });
        });
    }

    public async stop(): Promise<void> {
        const instanceStoppedPromise: Promise<void> = new Promise((resolve) => {
            this.appManager.onInstanceStopped((instance) => {
                if (instance.id === this.id) {
                    resolve();
                }
            });
        });

        try {
            await this.callControl("stop", {}, false);
        } catch (error) {
            if (error.message !== this.WINDOW_DID_NOT_HAVE_TIME_TO_RESPOND) {
                throw new Error(error);
            }
        }

        await promisePlus(() => instanceStoppedPromise, 10000, `Instance ${this.id} stop timeout!`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callControl(command: string, args: object, skipResult = false): Promise<Glue42Web.Interop.InvocationResult<any>> {
        return this.control.send(
            { command, domain: "appManager", args, skipResult },
            { instance: this.id });
    }
}
