import { Protocol } from "../types";
import { Glue42Core } from "../../../glue";

import { WrappedCallbackFunction, ResultContext, ServerMethodInfo, ServerSubscriptionInfo } from "./types";

export default class ServerSubscription implements Glue42Core.AGM.StreamSubscription {

    constructor(private protocol: Protocol, private repoMethod: ServerMethodInfo, private subscription: ServerSubscriptionInfo) {
    }

    public get stream(): Glue42Core.AGM.Stream {
        if (!this.repoMethod.stream) {
            throw new Error("no stream");
        }
        return this.repoMethod.stream;
    }
    public get arguments() { return this.subscription.arguments || {}; }
    public get branchKey(): string { return this.subscription.branchKey; }
    public get instance(): Glue42Core.AGM.Instance {
        if (!this.subscription.instance) {
            throw new Error("no instance");
        }
        return this.subscription.instance;
    }

    public close() {
        this.protocol.server.closeSingleSubscription(this.repoMethod, this.subscription);
    }

    public push(data: object) {
        this.protocol.server.pushDataToSingle(this.repoMethod, this.subscription, data);
    }
}
