import { Glue42Core } from "../../../../glue";
import { SubscriptionInner } from "../../types";
import ClientRepository from "../../client/repository";

export class UserSubscription implements Glue42Core.Interop.Subscription {
    public get requestArguments() {
        return this.subscriptionData.params.arguments || {};
    }

    public get servers(): Glue42Core.Interop.Instance[] {
        return this.subscriptionData.trackedServers
            .filter((pair) => pair.subscriptionId)
            .map((pair) => this.repository.getServerById(pair.serverId).instance);
    }

    public get serverInstance(): Glue42Core.Interop.Instance {
        return this.servers[0];
    }

    public get stream(): Glue42Core.Interop.MethodDefinition {
        return this.subscriptionData.method;
    }

    constructor(private repository: ClientRepository, private subscriptionData: SubscriptionInner) {
    }

    public onData(dataCallback: (data: Glue42Core.Interop.StreamData) => void): void {
        if (typeof dataCallback !== "function") {
            throw new TypeError("The data callback must be a function.");
        }

        this.subscriptionData.handlers.onData.push(dataCallback);
        if (this.subscriptionData.handlers.onData.length === 1 && this.subscriptionData.queued.data.length > 0) {
            this.subscriptionData.queued.data.forEach((dataItem) => {
                dataCallback(dataItem);
            });
        }
    }

    public onClosed(closedCallback: () => void): void {
        if (typeof closedCallback !== "function") {
            throw new TypeError("The callback must be a function.");
        }
        this.subscriptionData.handlers.onClosed.push(closedCallback);
    }

    public onFailed(callback: (err: any) => void): void {
        // DO NOTHING
    }

    public onConnected(callback: (server: Glue42Core.Interop.Instance, reconnect: boolean) => void): void {
        if (typeof callback !== "function") {
            throw new TypeError("The callback must be a function.");
        }
        this.subscriptionData.handlers.onConnected.push(callback);
    }

    public close(): void {
        this.subscriptionData.close();
    }

    public setNewSubscription(newSub: SubscriptionInner) {
        this.subscriptionData = newSub;
    }
}
