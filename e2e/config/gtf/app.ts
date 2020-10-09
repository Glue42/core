import { Glue42Web } from "../../../packages/web/web";
import { Gtf, ControlArgs } from "./types";

export class GtfApp implements Gtf.App {
    constructor(
        private readonly glue: Glue42Web.API,
        private readonly myInstance: Glue42Web.AppManager.Instance,
        private readonly controlMethodName: string
    ) { }

    public async stop(): Promise<void> {
        const foundWindow = this.glue.windows.findById(this.myInstance.agm.windowId);
        await foundWindow.close();
    }

    public async setContext(ctxName: string, ctxData: any): Promise<void> {
        const controlArgs: ControlArgs = {
            operation: "setContext",
            params: {
                name: ctxName,
                data: ctxData
            }
        };

        return this.sendControl<void>(controlArgs);
    }

    public async updateContext(ctxName: string, ctxData: any): Promise<void> {
        const controlArgs: ControlArgs = {
            operation: "updateContext",
            params: {
                name: ctxName,
                data: ctxData
            }
        };

        return this.sendControl<void>(controlArgs);
    }

    public async getContext(ctxName: string): Promise<any> {
        const controlArgs: ControlArgs = {
            operation: "getContext",
            params: {
                name: ctxName
            }
        };

        return this.sendControl<any>(controlArgs);
    }

    public async getAllContextNames(): Promise<string[]> {
        const controlArgs: ControlArgs = {
            operation: "getAllContextNames",
            params: {}
        };

        return this.sendControl<string[]>(controlArgs);
    }

    private async sendControl<T>(controlArgs: ControlArgs): Promise<T> {
        console.log(`Sending control message with args: ${JSON.stringify(controlArgs)}`);

        const invResult = await this.glue.interop.invoke<{ result: T }>(this.controlMethodName, controlArgs, this.myInstance.agm);

        console.log(`Received response: ${JSON.stringify(invResult.returned)}`);

        return invResult.returned.result;
    }
}
