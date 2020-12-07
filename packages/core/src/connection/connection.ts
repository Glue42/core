import {
    default as CallbackFactory,
    CallbackRegistry,
} from "callback-registry";
import {
    GW3Protocol,
    Transport,
    ConnectionSettings,
    Identity,
} from "./types";
import { Logger } from "../logger/logger";

import { Glue42Core } from "../../glue";
import InProcTransport from "./transports/inProc";
import SharedWorkerTransport from "./transports/worker";
import WS from "./transports/ws";
import GW3ProtocolImpl from "./protocols/gw3";
import { MessageReplayerImpl } from "./replayer";
import timer from "../utils/timer";
import WebPlatformTransport from "./transports/webPlatform";

/**
 * A template for gateway connections - this is extended from specific protocols and transports.
 */
export default class Connection implements Glue42Core.Connection.API {

    public peerId!: string;
    public token!: string;
    public info!: object;
    public resolvedIdentity!: any;
    public availableDomains!: Glue42Core.Connection.GWDomainInfo[];
    public gatewayToken: string | undefined;
    public replayer?: MessageReplayerImpl;

    protected protocol: GW3Protocol;

    // The message handlers that have to be executed for each received message
    protected messageHandlers: {
        [key: string]: { [key: string]: (msg: any) => void };
    } = {};
    protected ids = 1;
    protected registry: CallbackRegistry = CallbackFactory();
    protected _connected = false;
    private isTrace = false;
    private transport: Transport;

    public get protocolVersion() {
        return this.protocol?.protocolVersion;
    }

    constructor(private settings: ConnectionSettings, private logger: Logger) {
        settings = settings || {};
        settings.reconnectAttempts = settings.reconnectAttempts || 10;
        settings.reconnectInterval = settings.reconnectInterval || 1000;

        if (settings.inproc) {
            this.transport = new InProcTransport(settings.inproc, logger.subLogger("inMemory"));
        } else if (settings.sharedWorker) {
            this.transport = new SharedWorkerTransport(settings.sharedWorker, logger.subLogger("shared-worker"));
        } else if (settings.webPlatform) {
            this.transport = new WebPlatformTransport(settings.webPlatform, logger.subLogger("web-platform"), settings.identity);
        } else if (settings.ws !== undefined) {
            this.transport = new WS(settings, logger.subLogger("ws"));
        } else {
            throw new Error("No connection information specified");
        }

        this.isTrace = logger.canPublish("trace");
        logger.debug(`starting with ${this.transport.name()} transport`);

        this.protocol = new GW3ProtocolImpl(this, settings, logger.subLogger("protocol"));
        this.transport.onConnectedChanged(
            this.handleConnectionChanged.bind(this)
        );
        this.transport.onMessage(this.handleTransportMessage.bind(this));

        if (settings.replaySpecs && settings.replaySpecs.length) {
            this.replayer = new MessageReplayerImpl(settings.replaySpecs);
            this.replayer.init(this);
        }
    }

    public send(message: object, options?: Glue42Core.Connection.SendMessageOptions): Promise<void> {
        // create a message using the protocol
        if (
            this.transport.sendObject &&
            this.transport.isObjectBasedTransport
        ) {
            const msg = this.protocol.createObjectMessage(message);
            if (this.isTrace) {
                this.logger.trace(`>> ${JSON.stringify(msg)}`);
            }
            return this.transport.sendObject(msg, options);
        } else {
            const strMessage = this.protocol.createStringMessage(message);
            if (this.isTrace) {
                this.logger.trace(`>> ${strMessage}`);
            }
            return this.transport.send(strMessage, options);
        }
    }

    public on<T>(
        type: string,
        messageHandler: (msg: T) => void
    ): any {
        type = type.toLowerCase();
        if (this.messageHandlers[type] === undefined) {
            this.messageHandlers[type] = {};
        }

        const id = this.ids++;
        this.messageHandlers[type][id] = messageHandler;

        return {
            type,
            id,
        };
    }

    // Remove a handler
    public off(info: { type: string; id: number }) {
        delete this.messageHandlers[info.type.toLowerCase()][info.id];
    }

    public get isConnected() {
        return this.protocol.isLoggedIn;
    }

    public connected(callback: (server: string) => void): () => void {
        return this.protocol.loggedIn(() => {
            callback(this.settings.ws || this.settings.sharedWorker || "");
        });
    }

    public disconnected(callback: () => void): () => void {
        return this.registry.add("disconnected", callback);
    }

    public async login(authRequest: Glue42Core.Auth, reconnect?: boolean): Promise<Identity> {
        // open the protocol in case it was closed by explicity logout
        await this.transport.open();
        timer("connection").mark("transport-opened");
        const identity = this.protocol.login(authRequest, reconnect);
        timer("connection").mark("protocol-logged-in");
        return identity;
    }

    public async logout() {
        await this.protocol.logout();
        await this.transport.close();
    }

    public loggedIn(callback: () => void) {
        return this.protocol.loggedIn(callback);
    }

    public domain(
        domain: string,
        successMessages?: string[],
        errorMessages?: string[]
    ): Glue42Core.Connection.GW3DomainSession {
        return this.protocol.domain(
            domain,
            this.logger.subLogger(`domain=${domain}`),
            successMessages,
            errorMessages
        );
    }

    public authToken(): Promise<string> {
        return this.protocol.authToken();
    }

    public reconnect(): Promise<void> {
        return this.transport.reconnect();
    }

    private distributeMessage(message: object, type: string) {
        // Retrieve handlers for the message type
        const handlers = this.messageHandlers[type.toLowerCase()];
        if (handlers !== undefined) {
            // Execute them
            Object.keys(handlers).forEach((handlerId) => {
                const handler = handlers[handlerId];
                if (handler !== undefined) {
                    try {
                        handler(message);
                    } catch (error) {
                        try {
                            // logger might not be there yet
                            this.logger.error(`Message handler failed with ${error.stack}`, error);
                        } catch (loggerError) {
                            // tslint:disable-next-line:no-console
                            console.log("Message handler failed", error);
                        }
                    }
                }
            });
        }
    }

    private handleConnectionChanged(connected: boolean) {
        if (this._connected === connected) {
            return;
        }
        this._connected = connected;

        if (connected) {
            this.registry.execute("connected");
        } else {
            this.registry.execute("disconnected");
        }
    }

    private handleTransportMessage(msg: string | object) {
        let msgObj;
        if (typeof msg === "string") {
            msgObj = this.protocol.processStringMessage(msg);
        } else {
            msgObj = this.protocol.processObjectMessage(msg);
        }

        if (this.isTrace) {
            this.logger.trace(`<< ${JSON.stringify(msgObj)}`);
        }

        this.distributeMessage(msgObj.msg, msgObj.msgType);
    }
}
