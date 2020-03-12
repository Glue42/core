import { Glue42Core } from "../../glue";
import Connection from "../connection/connection";
import { Logger } from "../logger/logger";

export interface BusSettings {
    connection: Connection;
    logger: Logger;
}
interface SubscriptionEntry {
    subscription_id: string;
    topic: string;
    callback: (data: object, topic: string, source: Glue42Core.Interop.Instance) => void;
    source?: object;
}

const successMessages = ["subscribed", "success"];

export class MessageBus implements Glue42Core.Bus.API {
    public connection: Connection;
    public logger: Logger;
    public peerId: string;
    public session: Glue42Core.Connection.GW3DomainSession;
    public subscriptions: SubscriptionEntry[];
    public readyPromise: Promise<object>;

    constructor(connection: Connection, logger: Logger) {
        this.connection = connection;
        this.logger = logger;
        this.peerId = connection.peerId;
        this.subscriptions = [];
        this.session = connection.domain("bus", successMessages);
        this.readyPromise = this.session.join();
        this.readyPromise.then(() => {
            this.watchOnEvent();
        });
    }

    public ready() {
        return this.readyPromise;
    }

    public publish = (topic: string, data: object, options?: Glue42Core.Bus.MessageOptions): void => {
        const { routingKey, target } = options || {} as any;
        const args = this.removeEmptyValues({
            type: "publish",
            topic,
            data,
            peer_id: this.peerId,
            routing_key: routingKey,
            target_identity: target
        });
        this.session.send(args);
    }

    public subscribe = (
        topic: string,
        callback: (data: object, topic: string, source: object) => void,
        options?: Glue42Core.Bus.MessageOptions
    ): Promise<Glue42Core.Bus.Subscription> => {
        return new Promise((resolve, reject) => {
            const { routingKey, target } = options || {} as any;
            const args = this.removeEmptyValues({
                type: "subscribe",
                topic,
                peer_id: this.peerId,
                routing_key: routingKey,
                source: target
            });

            this.session.send(args)
                .then((response: any) => {
                    const { subscription_id } = response;
                    this.subscriptions.push({ subscription_id, topic, callback, source: target });

                    resolve({
                        unsubscribe: () => {
                            this.session.send({ type: "unsubscribe", subscription_id, peer_id: this.peerId });
                            this.subscriptions = this.subscriptions.filter((s) => s.subscription_id !== subscription_id);
                            return Promise.resolve();
                        }
                    });
                })
                .catch((error: any) => reject(error));
        });
    }

    public watchOnEvent = () => {
        this.session.on("event", (args: any) => {
            const { data, subscription_id } = args;
            const source = args["publisher-identity"];
            const subscription = this.subscriptions.find((s) => s.subscription_id === subscription_id);

            if (subscription) {
                if (!subscription.source) {
                    subscription.callback(data, subscription.topic, source);
                } else {
                    if (this.keysMatch(subscription.source, source)) {
                        subscription.callback(data, subscription.topic, source);
                    }
                }
            }
        });
    }

    private removeEmptyValues(obj: any) {
        const cleaned: any = {};
        Object.keys(obj).forEach((key) => {
            if (obj[key] !== undefined && obj[key] !== null) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    }

    private keysMatch(obj1: any, obj2: any) {
        const keysObj1 = Object.keys(obj1);
        let allMatch = true;
        keysObj1.forEach((key) => {
            if (obj1[key] !== obj2[key]) {
                allMatch = false;
            }
        });
        return allMatch;
    }
}
