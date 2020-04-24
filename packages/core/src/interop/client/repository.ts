/*
 * Repository holding servers and methods visible by this peer including those created by the peer itself.
 */
import { default as CallbackRegistryFactory, UnsubscribeFunction } from "callback-registry";
import { Glue42Core } from "../../../glue";
import { ClientMethodInfo, ServerInfo } from "./types";
import { MethodInfoMessage } from "../protocols/gw3/messages";
import { Logger } from "../../logger/logger";
import { InstanceWrapper } from "../instance";

export default class ClientRepository {

    // each server has format {id:'', info:{}, methods:{}}
    // where methods has format {id:'', info:{}}
    private servers: { [id: string]: ServerInfo } = {};

    // object keyed by method identifier - value is number of servers that offer that method
    private methodsCount: { [id: string]: number } = {};

    // store for callbacks
    private callbacks = CallbackRegistryFactory();

    constructor(private logger: Logger) {

    }

    // add a new server to internal collection
    public addServer(info: Glue42Core.AGM.Instance, serverId: string): string {
        this.logger.debug(`adding server ${serverId}`);

        const current = this.servers[serverId];
        if (current) {
            return current.id;
        }

        const wrapper = new InstanceWrapper(info);
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
            getServers: () => {
                return that.getServersByMethod(identifier);
            }
        };
        // now add some legacy stuff
        (methodDefinition as any).object_types = methodDefinition.objectTypes;
        (methodDefinition as any).display_name = methodDefinition.displayName;
        (methodDefinition as any).version = methodDefinition.version;

        server.methods[method.id] = methodDefinition;

        // increase the ref and notify listeners
        if (!this.methodsCount[identifier]) {
            this.methodsCount[identifier] = 0;
            this.callbacks.execute("onMethodAdded", methodDefinition);
        }
        this.methodsCount[identifier] = this.methodsCount[identifier] + 1;

        this.callbacks.execute("onServerMethodAdded", server.instance, methodDefinition);
        return methodDefinition;
    }

    public removeServerMethod(serverId: string, methodId: string) {
        const server = this.servers[serverId];
        if (!server) {
            throw new Error("server does not exists");
        }

        const method = server.methods[methodId];
        delete server.methods[methodId];

        // update ref counting
        this.methodsCount[method.identifier] = this.methodsCount[method.identifier] - 1;
        if (this.methodsCount[method.identifier] === 0) {
            this.callbacks.execute("onMethodRemoved", method);
        }

        this.callbacks.execute("onServerMethodRemoved", server.instance, method);
    }

    public getMethods(): ClientMethodInfo[] {
        const allMethods: { [key: string]: ClientMethodInfo } = {};
        Object.keys(this.servers).forEach((serverId) => {
            const server = this.servers[serverId];
            Object.keys(server.methods).forEach((methodId) => {
                const method: ClientMethodInfo = server.methods[methodId];
                allMethods[method.identifier] = method;
            });
        });

        const methodsAsArray = Object.keys(allMethods).map((id) => {
            return allMethods[id];
        });

        return methodsAsArray;
    }

    public getServers(): ServerInfo[] {
        const allServers: ServerInfo[] = [];
        Object.keys(this.servers).forEach((serverId) => {
            const server = this.servers[serverId];
            allServers.push(server);
        });

        return allServers;
    }

    public getServerMethodsById(serverId: string): ClientMethodInfo[] {
        const server = this.servers[serverId];

        return Object.keys(server.methods).map((id) => {
            return server.methods[id];
        });
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
        return this.servers[id];
    }

    public reset() {
        Object.keys(this.servers).forEach((key) => {
            this.removeServerById(key, "reset");
        });

        this.servers = {};
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
        Object.keys(this.servers).forEach((serverId) => {
            const server = this.servers[serverId];
            Object.keys(server.methods).forEach((methodId) => {
                const methodInfo = server.methods[methodId];
                if (methodInfo.identifier === identifier) {
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
}
