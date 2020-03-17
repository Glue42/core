import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
} from "callback-registry";
import { Transport, ConnectionSettings } from "../types";
import { Logger } from "../../logger/logger";
import { Glue42Core } from "../../../glue";
import Utils from "../../utils/utils";
import { PromiseWrapper } from "../../utils/pw";

const WebSocketConstructor = Utils.isNode() ? require("ws") : window.WebSocket;

export default class WS implements Transport {
    private ws: WebSocket | undefined;
    private logger: Logger;
    private settings: ConnectionSettings;

    /**
     * If the flag is true the connection should keep trying to connect.
     * If false the user explicitly closed it and it should not reconnect
     */
    private _running = true;

    private _registry: CallbackRegistry = CallbackRegistryFactory();
    private wsRequests: Array<{ callback: () => void, failed?: (err?: string) => void }> = [];

    constructor(settings: ConnectionSettings, logger: Logger) {
        this.settings = settings;
        this.logger = logger;
        if (!this.settings.ws) {
            throw new Error("ws is missing");
        }
    }

    public onMessage(callback: (msg: string) => void): () => void {
        return this._registry.add("onMessage", callback);
    }

    // Create a function for sending a message
    public send(msg: string, options?: Glue42Core.Connection.SendMessageOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            options = options || {};
            this.waitForSocketConnection(
                () => {
                    try {
                        this.ws?.send(msg);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                },
                reject
            );
        });
    }

    public open() {
        this.logger.info(`opening ws...`);
        this._running = true;
        return new Promise<void>((resolve, reject) => {
            this.waitForSocketConnection(
                resolve,
                reject
            );
        });
    }

    public close() {
        this._running = false;
        if (this.ws) {
            this.ws.close();
        }
        return Promise.resolve();
    }

    public onConnectedChanged(callback: (connected: boolean, reason?: string) => void): () => void {
        return this._registry.add("onConnectedChanged", callback);
    }

    public name(): string {
        return `ws ${this.settings.ws}`;
    }

    public reconnect(): Promise<void> {
        this.ws?.close();
        const pw = new PromiseWrapper<void>();
        this.waitForSocketConnection(() => {
            pw.resolve();
        });
        return pw.promise;
    }

    // Holds callback execution until socket connection is established.
    private waitForSocketConnection(
        callback: () => void,
        failed?: (err?: string) => void
    ) {
        failed = failed ?? (() => { /** DO nothing */ });

        // check if we're still running
        if (!this._running) {
            failed(
                `wait for socket on ${this.settings.ws} failed - socket closed by user`
            );
            return;
        }

        // if socket is opened - returned immediately
        if (this.ws?.readyState === 1) {
            callback();
            return;
        }

        // store the callback
        this.wsRequests.push({ callback, failed });
        // if someone has already initiated the socket return
        if (this.wsRequests.length > 1) {
            return;
        }

        this.openSocket();
    }

    private async openSocket(retryInterval?: number, retriesLeft?: number) {
        if (retryInterval === undefined) {
            retryInterval = this.settings.reconnectInterval;
        }

        if (retriesLeft !== undefined) {
            if (retriesLeft === 0) {
                this.notifyForSocketState(
                    `wait for socket on ${this.settings.ws} failed - no more retries left`
                );
                return;
            }
            this.logger.debug(
                `will retry ${retriesLeft} more times (every ${retryInterval} ms)`
            );
        }

        try {
            await this.initiateSocket();
            this.notifyForSocketState();
        } catch {
            setTimeout(() => {
                const retries =
                    retriesLeft === undefined ? undefined : retriesLeft - 1;
                this.openSocket(
                    retryInterval,
                    retries,
                );
            }, retryInterval); // wait X milliseconds for the connection...
        }
    }

    private initiateSocket(): Promise<void> {
        const pw = new PromiseWrapper<void>();
        this.logger.debug(`initiating ws to ${this.settings.ws}...`);
        this.ws = new WebSocketConstructor(this.settings.ws || "") as WebSocket;
        this.ws.onerror = (err: any) => {
            let reason: string = "";
            try {
                reason = JSON.stringify(err);
            } catch (error) {
                const seen = new WeakSet();
                const replacer = (key: string, value: any) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };

                reason = JSON.stringify(err, replacer);
            }

            pw.reject("error");
            this.notifyStatusChanged(false, reason);
        };
        this.ws.onclose = (err) => {
            this.logger.info(`ws closed ${err}`);
            pw.reject("closed");
            this.notifyStatusChanged(false);
        };
        // Log on connection
        this.ws.onopen = () => {
            // tslint:disable-next-line:no-console
            this.logger.info(`ws opened ${this.settings.identity?.application}`);
            pw.resolve();
            this.notifyStatusChanged(true);
        };
        // Attach handler
        this.ws.onmessage = (message: { data: object }) => {
            this._registry.execute("onMessage", message.data);
        };

        return pw.promise;
    }

    private notifyForSocketState(error?: string) {
        this.wsRequests.forEach((wsRequest) => {
            if (error) {
                if (wsRequest.failed) {
                    wsRequest.failed(error);
                }
            } else {
                wsRequest.callback();
            }
        });
        this.wsRequests = [];
    }

    private notifyStatusChanged(status: boolean, reason?: string) {
        this._registry.execute("onConnectedChanged", status, reason);
    }
}
