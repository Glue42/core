import { Transport } from "../types";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { Glue42Core } from "../../../glue";
import { Logger } from "../../logger/logger";

export default class InProcTransport implements Transport {

    private gw: Glue42Core.Connection.GW3Facade;
    private registry: CallbackRegistry = CallbackRegistryFactory();
    private client?: Glue42Core.Connection.GW3Client;

    constructor(settings: Glue42Core.InprocGWSettings, logger: Logger) {
        this.gw = settings.facade;
        this.gw.connect((_client, message) => {
            this.messageHandler(message);
        }).then((client) => {
            this.client = client;
        });
    }

    public get isObjectBasedTransport() {
        return true;
    }

    public sendObject(msg: object): Promise<void> {
        if (this.client) {
            this.client.send(msg);
            return Promise.resolve(undefined);
        } else {
            return Promise.reject(`not connected`);
        }
    }

    public send(_msg: string) {
        return Promise.reject("not supported");
    }

    public onMessage(callback: (msg: string | object) => void): UnsubscribeFunction {
        return this.registry.add("onMessage", callback);
    }

    public onConnectedChanged(callback: (connected: boolean) => void) {
        callback(true);
    }

    public close() {
        // DO NOTHING
        return Promise.resolve();
    }

    public open() {
        return Promise.resolve();
    }

    public name(): string {
        return "in-memory";
    }

    public reconnect(): Promise<void> {
        return Promise.resolve();
    }

    private messageHandler(msg: object) {
        this.registry.execute("onMessage", msg);
    }
}
