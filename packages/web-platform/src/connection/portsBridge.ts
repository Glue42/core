/* tslint:disable:no-console no-empty */
import { Gateway } from "./gateway";
import { IoC } from "../shared/ioc";
import { defaultTargetString } from "../common/defaultConfig";
import { Glue42CoreMessageTypes } from "../common/constants";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { CoreClientData } from "../common/types";
import { SessionStorageController } from "../controllers/session";
import { Glue42WebPlatform } from "../../platform";

export class PortsBridge {

    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private clients: { [key: string]: Window } = {};
    private unLoadStarted = false;

    constructor(
        private readonly gateway: Gateway,
        private readonly sessionStorage: SessionStorageController,
        private readonly ioc: IoC
    ) { }

    public async start(config?: Glue42WebPlatform.Gateway.Config): Promise<void> {
        await this.gateway.start(config);
        this.setUpGenericMessageHandler();
        this.setUpBeforeUnload();
    }

    public async createInternalClient(): Promise<MessagePort> {

        const channel = this.ioc.createMessageChannel();

        await this.gateway.connectClient(channel.port1);

        return channel.port2;
    }

    public onClientUnloaded(callback: (client: CoreClientData) => void): UnsubscribeFunction {
        return this.registry.add("client-unloaded", callback);
    }

    private setUpBeforeUnload(): void {
        window.addEventListener("beforeunload", () => {

            this.unLoadStarted = true;
            const message = {
                glue42core: {
                    type: Glue42CoreMessageTypes.platformUnload.name
                }
            };

            for (const id in this.clients) {
                this.clients[id].postMessage(message, defaultTargetString);
            }
        });
    }

    private setUpGenericMessageHandler(): void {
        window.addEventListener("message", (event) => {
            const data = event.data?.glue42core;

            if (!data || this.unLoadStarted) {
                return;
            }

            // todo: domain whitelisting

            if (data.type === Glue42CoreMessageTypes.clientUnload.name) {

                const client = {
                    windowId: data.data.ownWindowId,
                    win: event.source
                };

                return this.registry.execute("client-unloaded", client);
            }

            if (data.type === Glue42CoreMessageTypes.connectionRequest.name) {
                return this.handleRemoteConnectionRequest(event.source as Window, event.origin, data.clientId, data.clientType, data.bridgeInstanceId);
            }

            if (data.type === Glue42CoreMessageTypes.platformPing.name) {
                return this.handlePlatformPing(event.source as Window, event.origin);
            }
        });
    }

    private async handleRemoteConnectionRequest(source: Window, origin: string, clientId: string, clientType: "child" | "grandChild", bridgeInstanceId: string): Promise<void> {
        const channel = this.ioc.createMessageChannel();

        await this.gateway.connectClient(channel.port1, this.removeClient.bind(this));

        const foundData = this.sessionStorage.getBridgeInstanceData(bridgeInstanceId);
        const appName = foundData?.appName;

        const message = {
            glue42core: {
                type: Glue42CoreMessageTypes.connectionAccepted.name,
                port: channel.port2,
                appName, clientId, clientType
            }
        };

        if (clientType === "child") {
            this.clients[clientId] = source;
        }

        source.postMessage(message, origin, [channel.port2]);
    }

    private handlePlatformPing(source: Window, origin: string): void {
        const message = {
            glue42core: {
                type: Glue42CoreMessageTypes.platformReady.name
            }
        };

        source.postMessage(message, origin);
    }

    private removeClient(clientId: string): void {
        if (!clientId) {
            return;
        }
        if (this.clients[clientId]) {
            delete this.clients[clientId];
        }

        // this.registry.execute("client-unloaded", client);
    }
}