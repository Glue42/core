import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { BasicInstanceData, InstanceData, operations } from "./protocol";

export class InstanceModel {
    private me!: Glue42Web.AppManager.Instance;
    private readonly myCtxKey: string;

    constructor(private readonly data: InstanceData, private readonly bridge: GlueBridge, private readonly application: Glue42Web.AppManager.Application) {
        this.myCtxKey = `___instance___${this.data.id}`;
    }

    public toApi(): Glue42Web.AppManager.Instance {
        const agm = this.bridge.getInteropInstance(this.data.id);

        const api: Glue42Web.AppManager.Instance = {
            id: this.data.id,
            agm,
            application: this.application,
            stop: this.stop.bind(this),
            getContext: this.getContext.bind(this)
        };

        this.me = Object.freeze(api);

        return this.me;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getContext(): Promise<any> {
        return this.bridge.contextLib.get(this.myCtxKey);
    }

    private async stop(): Promise<void> {
        await this.bridge.send<BasicInstanceData, void>("appManager", operations.instanceStop, { id: this.data.id });
    }
}