import { Protocol } from "../types";
import { Glue42Core } from "../../../glue";
import ServerSubscription from "./subscription";
import { ServerMethodInfo } from "./types";

export default class ServerBranch implements Glue42Core.AGM.StreamBranch {

    constructor(public key: string, private protocol: Protocol, private repoMethod: ServerMethodInfo) {
    }

    public subscriptions() {
        const subList = this.protocol.server.getSubscriptionList(this.repoMethod, this.key);
        return subList.map((sub) => {
            return new ServerSubscription(this.protocol, this.repoMethod, sub);
        });
    }

    public close() {
        this.protocol.server.closeAllSubscriptions(this.repoMethod, this.key);
    }

    public push(data: object) {
        this.protocol.server.pushData(this.repoMethod, data, [this.key]);
    }
}
