import { LocalWebWindow } from "../windows/my";
import { LocalInstance } from "../app-manager/my";
import { RemoteCommand, ControlDomain } from "./commands";
import { Glue42Web } from "../../web";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";

/**
 * This component wraps the internal message exchange between this and other Glue42 enabled windows.
 */
export class Control {
    public static CONTROL_METHOD = "GC.Control";

    private myWindow: LocalWebWindow | undefined;
    private myInstance: LocalInstance | undefined;
    private interop!: Glue42Web.Interop.API;
    private callbacks: { [domain: string]: (command: RemoteCommand) => void } = {};
    private logger!: Glue42Web.Logger.API;
    private registry: CallbackRegistry = CallbackRegistryFactory();

    public async start(interop: Glue42Web.Interop.API, logger: Glue42Web.Logger.API): Promise<void> {
        this.interop = interop;
        this.logger = logger;
        await this.interop.register(Control.CONTROL_METHOD, async (arg: any) => {
            const command = arg as RemoteCommand;
            logger.trace(`received control command ${JSON.stringify(command)}`);
            if (command.domain === "windows") {
                if (!this.myWindow) {
                    return;
                }
                const result = (this.myWindow as any)[command.command].call(this.myWindow, command.args);
                if (command.skipResult) {
                    return {};
                } else {
                    return result;
                }
            }
            if (command.domain === "appManager") {
                if (!this.myInstance) {
                    return;
                }
                const result = (this.myInstance as any)[command.command].call(this.myInstance, command.args);
                if (command.skipResult) {
                    return {};
                } else {
                    return result;
                }
            }
            if (command.domain === "layouts") {
                const callback = this.callbacks[command.domain];
                if (callback) {
                    callback(command);
                }
            }
        });
        this.registry.execute("started");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public send(command: RemoteCommand, target: Glue42Web.Interop.Instance): Promise<Glue42Web.Interop.InvocationResult<any>> {
        if (!this.interop) {
            throw new Error("Control not started");
        }
        this.logger.info(`sending control command ${JSON.stringify(command)} to ${JSON.stringify(target)}}`);
        return this.interop.invoke(Control.CONTROL_METHOD, command, target);
    }

    public subscribe(domain: ControlDomain, callback: (command: RemoteCommand) => void): void {
        this.callbacks[domain] = callback;
    }

    public setLocalWindow(window: LocalWebWindow): void {
        this.myWindow = window;
    }

    public setLocalInstance(instance: LocalInstance): void {
        this.myInstance = instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onStart(callback: () => any): UnsubscribeFunction {
        return this.registry.add("started", callback);
    }
}
