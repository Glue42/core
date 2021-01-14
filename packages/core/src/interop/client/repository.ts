/*
 * Repository holding servers and methods visible by this peer including those created by the peer itself.
 */
import { default as CallbackRegistryFactory, UnsubscribeFunction } from "callback-registry";
import { Glue42Core } from "../../../glue";
import { ClientMethodInfo, ServerInfo } from "./types";
import { MethodInfoMessage } from "../protocols/gw3/messages";
import { Logger } from "../../logger/logger";
import { InstanceWrapper } from "../instance";
import Client from "./client";

const hideMethodSystemFlags = (method: ClientMethodInfo): ClientMethodInfo => {
    return {
        ...method,
        flags: method.flags.metadata || {}
    };
};

export default class ClientRepository {

    // each server has format {id:'', info:{}, methods:{}}
    // where methods has format {id:'', info:{}}
    private servers: { [id: string]: ServerInfo } = {};
    private myServer: ServerInfo;

    // object keyed by method identifier - value is number of servers that offer that method
    private methodsCount: { [id: string]: number } = {};

    // store for callbacks
    private callbacks = CallbackRegistryFactory();

    constructor(private logger: Logger, private API: Glue42Core.AGM.API & { unwrappedInstance: InstanceWrapper }) {
        const peerId = this.API.instance.peerId as string;
        this.myServer = {
            id: peerId,
            methods: {},
            instance: this.API.instance,
            wrapper: this.API.unwrappedInstance,
        };
        this.servers[peerId] = this.myServer;
    }

    // add a new server to internal collection
    public addServer(info: Glue42Core.AGM.Instance, serverId: string): string {
        this.logger.debug(`adding server ${serverId}`);

        const current = this.servers[serverId];
        if (current) {
            return current.id;
        }

        const wrapper = new InstanceWrapper(this.API, info);
        const serverEntry: ServerInfo = {
            id: serverId,
            methods: {},
            instance: wrapper.unwrap(),
            wrapper,
        };

        this.servers[serverId] = serverEntry;
        this.callbacks.execute("onServerAdded", serverEntry.instance);
        return serverId;
    }

    public removeServerById(id: string, reason?: string) {
        const server = this.servers[id];
        if (!server) {
            // tslint:disable-next-line:no-console
            this.logger.warn(`not aware of server ${id}, my state ${JSON.stringify(Object.keys(this.servers))}`);
            return;
        } else {
            // tslint:disable-next-line:no-console
            this.logger.debug(`removing server ${id}`);
        }

        Object.keys(server.methods).forEach((methodId) => {
            this.removeServerMethod(id, methodId);
        });

        delete this.servers[id];
        this.callbacks.execute("onServerRemoved", server.instance, reason);
    }

    public addServerMethod(serverId: string, method: MethodInfoMessage) {

        const server = this.servers[serverId];
        if (!server) {
            throw new Error("server does not exists");
        }

        // server already has that method
        if (server.methods[method.id]) {
            return;
        }

        const identifier = this.createMethodIdentifier(method);
        const that = this;
        const methodDefinition: ClientMethodInfo = {
            identifier,
            gatewayId: method.id,
            name: method.name,
            displayName: method.display_name,
            description: method.description,
            version: method.version,
            objectTypes: method.object_types || [],
            accepts: method.input_signature,
            returns: method.result_signature,
            supportsStreaming: typeof method.flags !== "undefined" ? method.flags.streaming : false,
            flags: method.flags ?? {},
            getServers: () => {
                return that.getServersByMethod(identifier);
            }
        };
        // now add some legacy stuff
        (methodDefinition as any).object_types = methodDefinition.objectTypes;
        (methodDefinition as any).display_name = methodDefinition.displayName;
        (methodDefinition as any).version = methodDefinition.version;

        server.methods[method.id] = methodDefinition;

        const clientMethodDefinition = hideMethodSystemFlags(methodDefinition);

        // increase the ref and notify listeners
        if (!this.methodsCount[identifier]) {
            this.methodsCount[identifier] = 0;
            this.callbacks.execute("onMethodAdded", clientMethodDefinition);
        }
        this.methodsCount[identifier] = this.methodsCount[identifier] + 1;

        this.callbacks.execute("onServerMethodAdded", server.instance, clientMethodDefinition);
        return methodDefinition;
    }

    public removeServerMethod(serverId: string, methodId: string) {
        const server = this.servers[serverId];
        if (!server) {
            throw new Error("server does not exists");
        }

        const method = server.methods[methodId];
        delete server.methods[methodId];

        const clientMethodDefinition = hideMethodSystemFlags(method);

        // update ref counting
        this.methodsCount[method.identifier] = this.methodsCount[method.identifier] - 1;
        if (this.methodsCount[method.identifier] === 0) {
            this.callbacks.execute("onMethodRemoved", clientMethodDefinition);
        }

        this.callbacks.execute("onServerMethodRemoved", server.instance, clientMethodDefinition);
    }

    public getMethods(): ClientMethodInfo[] {
        return this.extractMethodsFromServers(Object.values(this.servers)).map(hideMethodSystemFlags);
    }

    public getServers(): ServerInfo[] {
        return Object.values(this.servers).map(this.hideServerMethodSystemFlags);
    }

    public onServerAdded(callback: (server: Glue42Core.Interop.Instance) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onServerAdded", callback);

        // because we need the servers shapshot before we exist this stack
        const serversWithMethodsToReplay = this.getServers().map((s) => s.instance);

        return this.returnUnsubWithDelayedReplay(unsubscribeFunc, serversWithMethodsToReplay, callback);
    }

    public onMethodAdded(callback: (method: ClientMethodInfo) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onMethodAdded", callback);

        // because we need the servers snapshot before we return to the application code
        const methodsToReplay = this.getMethods();

        return this.returnUnsubWithDelayedReplay(unsubscribeFunc, methodsToReplay, callback);
    }

    public onServerMethodAdded(callback: (server: Glue42Core.AGM.Instance, method: ClientMethodInfo) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onServerMethodAdded", callback);

        // because we want to interrupt the loop with the existing methods
        let unsubCalled = false;

        // because we need the servers shapshot before we return to the application code
        const servers = this.getServers();

        // because we want to have the unsub function before the callback is called with all existing methods
        setTimeout(() => {
            servers.forEach((server) => {
                const methods = server.methods;
                Object.keys(methods).forEach((methodId) => {
                    if (!unsubCalled) {
                        callback(server.instance, methods[methodId]);
                    }
                });
            });
        }, 0);

        return () => {
            unsubCalled = true;
            unsubscribeFunc();
        };
    }

    public onMethodRemoved(callback: (method: ClientMethodInfo) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onMethodRemoved", callback);

        return unsubscribeFunc;
    }

    public onServerRemoved(callback: (server: Glue42Core.Interop.Instance, reason: string) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onServerRemoved", callback);

        return unsubscribeFunc;
    }

    public onServerMethodRemoved(callback: (server: Glue42Core.Interop.Instance, method: ClientMethodInfo) => void): UnsubscribeFunction {
        const unsubscribeFunc = this.callbacks.add("onServerMethodRemoved", callback);

        return unsubscribeFunc;
    }

    public getServerById(id: string) {
        return this.hideServerMethodSystemFlags(this.servers[id]);
    }

    public reset() {
        Object.keys(this.servers).forEach((key) => {
            this.removeServerById(key, "reset");
        });
        this.servers = {
            [this.myServer.id]: this.myServer
        };
        this.methodsCount = {};
    }

    private createMethodIdentifier(methodInfo: MethodInfoMessage) {
        // Setting properties to defaults:
        const accepts = methodInfo.input_signature !== undefined ? methodInfo.input_signature : "";
        const returns = methodInfo.result_signature !== undefined ? methodInfo.result_signature : "";
        return (methodInfo.name + accepts + returns).toLowerCase();
    }

    private getServersByMethod(identifier: string): Glue42Core.AGM.Instance[] {
        const allServers: Glue42Core.AGM.Instance[] = [];
        Object.values(this.servers).forEach((server) => {
            Object.values(server.methods).forEach((method) => {
                if (method.identifier === identifier) {
                    allServers.push(server.instance);
                }
            });
        });
        return allServers;
    }

    // collectionToReplay: because we need a snapshot before we exist this stack
    private returnUnsubWithDelayedReplay(unsubscribeFunc: UnsubscribeFunction, collectionToReplay: any[], callback: any) {

        // because we want to interrupt the loop with the existing methods
        let unsubCalled = false;

        // because we want to have the unsub function before the callback is called with all existing methods
        setTimeout(() => {
            collectionToReplay.forEach((item) => {
                if (!unsubCalled) {
                    callback(item);
                }
            });
        }, 0);

        return () => {
            unsubCalled = true;
            unsubscribeFunc();
        };
    }

    private hideServerMethodSystemFlags(server: ServerInfo): ServerInfo {
        const clientMethods: { [name: string]: ClientMethodInfo } = {};

        Object.entries(server.methods).forEach(([name, method]) => {
            clientMethods[name] = hideMethodSystemFlags(method);
        });

        return {
            ...server,
            methods: clientMethods
        };
    }

    private extractMethodsFromServers(servers: ServerInfo[]): ClientMethodInfo[] {
        const methods = Object.values(servers).reduce<ClientMethodInfo[]>((clientMethods, server) => {
            return [...clientMethods, ...Object.values(server.methods)];
        }, []);

        return methods;
    }
}
