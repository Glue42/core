import { Transport } from "../types";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { Logger } from "../../logger/logger";

// tslint:disable-next-line:no-namespace
declare namespace SharedWorker {
    interface AbstractWorker extends EventTarget {
        onerror: (ev: ErrorEvent) => any;
    }

    export interface SharedWorker extends AbstractWorker {
        /**
         * the value it was assigned by the object's constructor.
         * It represents the MessagePort for communicating with the shared worker.
         * @type {MessagePort}
         */
        port: MessagePort;
    }

    export interface SharedWorkerGlobalScope extends Worker {
        onconnect: (event: MessageEvent) => void;
    }
}

/**
 * Shared worker transport
 */
export default class SharedWorkerTransport implements Transport {
    private worker: any;
    private registry: CallbackRegistry = CallbackRegistryFactory();

    constructor(workerFile: string, private logger: Logger) {
        this.worker = new SharedWorker(workerFile);
        this.worker.port.onmessage = (e: { data: any; timestamp: number }) => {
            this.messageHandler(e.data);
        };
    }

    public get isObjectBasedTransport() {
        return true;
    }

    public sendObject(msg: object): Promise<void> {
        this.worker.port.postMessage(msg);
        return Promise.resolve();
    }

    public send(_msg: string) {
        return Promise.reject("not supported");
    }

    public onMessage(
        callback: (msg: string | object) => void
    ): UnsubscribeFunction {
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
        // DO NOTHING
        return Promise.resolve();
    }

    public name(): string {
        return "shared-worker";
    }

    public reconnect(): Promise<void> {
        return Promise.resolve();
    }

    private messageHandler(msg: object) {
        this.registry.execute("onMessage", msg);
    }
}

interface SharedWorkerOptions {
    credentials?: RequestCredentials;
    name?: string;
    type?: WorkerType;
}

// eslint-disable-next-line
declare var SharedWorker: {
    prototype: SharedWorker.SharedWorker;

    /**
     *
     * @param {string} stringUrl                          Pathname to JavaScript file
     * @param {string|SharedWorkerOptions} [options]      Name of the worker to execute
     *                                                    or an object containing option properties
     */
    new(
        stringUrl: string,
        options?: string | SharedWorkerOptions
    ): SharedWorker.SharedWorker;
};
