/*
  The AGM Client analyses server presences, collects information about their methods and allows users to invoke these methods.
 */
import promisify from "../helpers/promisify";
import { Protocol, SubscribeError, InteropSettings, SubscriptionInner } from "../types";
import { ClientMethodInfo, ServerInfo, ServerMethodsPair } from "./types";
import { Glue42Core } from "../../../glue";
import ClientRepository from "./repository";
import { UnsubscribeFunction } from "callback-registry";
import random from "shortid";
import { rejectAfter } from "../helpers/promiseHelpers";
import { isSubset } from "../../contexts/helpers";
import InvocationResult = Glue42Core.AGM.InvocationResult;
import MethodDefinition = Glue42Core.AGM.MethodDefinition;
import Method = Glue42Core.Interop.Method;

export enum InvokeStatus {
    Success = 0,
    Error = 1,
}

export interface InvokeResultMessage {
    invocationId: string;
    result?: object;
    instance?: Glue42Core.AGM.Instance;
    status: InvokeStatus;
    message: string;
    error?: Error;
}

export default class Client {
    constructor(private protocol: Protocol, private repo: ClientRepository, private instance: Glue42Core.AGM.Instance, private configuration: InteropSettings) {
        //
    }

    /**
     * Subscribes to an AGM streaming method
     */
    public subscribe(method: string | Glue42Core.AGM.MethodDefinition, options: Glue42Core.AGM.SubscriptionParams, successCallback?: (subscription: Glue42Core.AGM.Subscription) => void, errorCallback?: (err: SubscribeError) => void, existingSub?: SubscriptionInner): Promise<Glue42Core.AGM.Subscription> {
        // options can have arguments:{}, target: 'best'/'all'/{server_instance}, waitTimeoutMs:10000

        const callProtocolSubscribe = (targetServers: ServerMethodsPair[], stream: Glue42Core.AGM.MethodDefinition, successProxy: (sub: Glue42Core.AGM.Subscription) => void, errorProxy: (err: SubscribeError) => void) => {

            options.methodResponseTimeout = options.methodResponseTimeout ?? options.waitTimeoutMs;

            this.protocol.client.subscribe(
                stream,
                options,
                targetServers,
                successProxy,
                errorProxy,
                existingSub
            );
        };

        const promise = new Promise<Glue42Core.AGM.Subscription>((resolve, reject) => {

            const successProxy = (sub: Glue42Core.AGM.Subscription) => {
                resolve(sub);
            };
            const errorProxy = (err: SubscribeError) => {
                reject(err);
            };

            if (!method) {
                reject(`Method definition is required. Please, provide either a unique string for a method name or a “methodDefinition” object with a required “name” property.`);
                return;
            }

            let methodDef: Glue42Core.AGM.MethodDefinition;
            if (typeof method === "string") {
                methodDef = { name: method };
            } else {
                methodDef = method;
            }

            if (!methodDef.name) {
                reject(`Method definition is required. Please, provide either a unique string for a method name or a “methodDefinition” object with a required “name” property.`);
                return;
            }

            if (options === undefined) {
                options = {};
            }
            let target = options.target;
            if (target === undefined) {
                target = "best";
            }
            if (typeof target === "string" && target !== "all" && target !== "best") {
                reject(new Error(`"${target}" is not a valid target. Valid targets are "all", "best", or an instance.`));
                return;
            }

            if (options.methodResponseTimeout === undefined) {
                // legacy support
                options.methodResponseTimeout = (options as any).method_response_timeout;
                if (options.methodResponseTimeout === undefined) {
                    // fallback to default
                    options.methodResponseTimeout = this.configuration.methodResponseTimeout;
                }
            }

            if (options.waitTimeoutMs === undefined) {
                // legacy support
                options.waitTimeoutMs = (options as any).wait_for_method_timeout;
                if (options.waitTimeoutMs === undefined) {
                    // fallback to default
                    options.waitTimeoutMs = this.configuration.waitTimeoutMs;
                }
            }

            const delayStep = 500;
            let delayTillNow = 0;

            // don't check if the method is streaming or not, subscribing to non-streaming method has to invoke it

            // get all servers that have method(s) matching the filter
            let currentServers = this.getServerMethodsByFilterAndTarget(methodDef, target);
            if (currentServers.length > 0) {
                callProtocolSubscribe(currentServers, currentServers[0].methods[0], successProxy, errorProxy);
            } else {
                const retry = () => {
                    if (!target || !(options.waitTimeoutMs)) {
                        return;
                    }
                    delayTillNow += delayStep;
                    // get all servers that have method(s) matching the filter
                    currentServers = this.getServerMethodsByFilterAndTarget(methodDef, target);
                    if (currentServers.length > 0) {
                        const streamInfo = currentServers[0].methods[0];
                        callProtocolSubscribe(currentServers, streamInfo, successProxy, errorProxy);
                    } else if (delayTillNow >= options.waitTimeoutMs) {
                        const def = typeof method === "string" ? { name: method } : method;
                        callProtocolSubscribe(currentServers, def, successProxy, errorProxy);
                    } else {
                        setTimeout(retry, delayStep);
                    }
                };
                setTimeout(retry, delayStep);
            }
        });

        return promisify(promise, successCallback, errorCallback);
    }

    /**
     * Returns all servers. If methodFilter is specified will return a list of servers
     * having a method matching the filter.
     */
    public servers(methodFilter: Glue42Core.AGM.MethodDefinition): Glue42Core.AGM.Instance[] {
        const filterCopy = methodFilter === undefined
            ? undefined
            : { ...methodFilter };

        // We want only the announced servers
        return this.getServers(filterCopy).map((serverMethodMap) => {
            return serverMethodMap.server.instance;
        });
    }

    /**
     * Returns all methods that match the given filter. If no filter specified returns all methods.
     */
    public methods(methodFilter: Glue42Core.AGM.MethodDefinition | string): Glue42Core.AGM.Method[] {
        if (typeof methodFilter === "string") {
            methodFilter = { name: methodFilter };
        } else {
            // Must not be mutated
            methodFilter = { ...methodFilter };
        }

        return this.getMethods(methodFilter);
    }

    /**
     * Returns all agm method registered by some server
     */
    public methodsForInstance(instance: Glue42Core.AGM.Instance): Glue42Core.AGM.Method[] {
        return this.getMethodsForInstance(instance);
    }

    /**
     * Called when a method is added for the first time by any application
     */
    public methodAdded(callback: (def: Glue42Core.AGM.Method) => void): UnsubscribeFunction {
        return this.repo.onMethodAdded(callback);
    }

    /**
     * Called when a method is removed from the last application offering it
     * @function methodRemoved
     * @param {MethodCallback} callback
     */
    public methodRemoved(callback: (def: Glue42Core.AGM.Method) => void): UnsubscribeFunction {
        return this.repo.onMethodRemoved(callback);
    }

    /**
     * Called when an application offering methods (server) is discovered
     * @param {InstanceCallback} callback Callback that will be invoked with the {@link Instance} of the new sever
     */
    public serverAdded(callback: (instance: Glue42Core.AGM.Instance) => void): UnsubscribeFunction {
        return this.repo.onServerAdded(callback);
    }

    /**
     * Called when an app offering methods stops offering them or exits
     * @param {InstanceCallback} callback Callback that will be invoked with the {@link Instance} of the removed server
     */
    public serverRemoved(callback: (instance: Glue42Core.AGM.Instance, reason: string) => void): UnsubscribeFunction {
        return this.repo.onServerRemoved((server: Glue42Core.AGM.Instance, reason: string) => {
            callback(server, reason);
        });
    }

    /**
     * Called when a method is offered by an application. This will be called for each server offering the method
     * where {@link methodAdded} will be called only for the first time the method is registered.
     *
     * @param {ServerMethodCallback} callback
     */
    public serverMethodAdded(callback: (info: { server: Glue42Core.AGM.Instance, method: Glue42Core.AGM.Method }) => void): UnsubscribeFunction {
        return this.repo.onServerMethodAdded((server: Glue42Core.AGM.Instance, method: ClientMethodInfo) => {
            callback({ server, method });
        });
    }

    /**
     * Called when a server stops offering a method
     * @param {ServerMethodCallback} callback
     */
    public serverMethodRemoved(callback: (info: { server: Glue42Core.AGM.Instance, method: Glue42Core.AGM.Method }) => void): UnsubscribeFunction {
        return this.repo.onServerMethodRemoved((server: Glue42Core.AGM.Instance, method: ClientMethodInfo) => {
            callback({ server, method });
        });
    }

    /**
     * Invokes an AGM method
     * @param {MethodDefinition} methodFilter Method to invoke
     * @param {Object} argumentObj Arguments for the invocation
     * @param {Instance|Instance[]|string} [target] Defines which server(s) to target with the invocation - can be one of:
     * * ’best' - executes the method on the best (or first) server
     * * 'all' - executes the method on all servers offering it
     * * AGM instance (or a subset, used for filtering), e.g. { application: 'appName' }
     * * an array of AGM instances/filters
     * @param {InvocationOptions} [additionalOptions] Additional options for the invocation
     * @param {function} [success] - (use this if you prefer callback style instead of promises)
     * Callback that will be called with {@link InvocationResult} object when the invocation is successful
     * @param {function} [error] -  (use this if you prefer callback style instead of promises)
     * Callback that will be called with {@link InvocationError} object when the invocation is not successful
     * @returns {Promise<InvocationResult>}
     * @example
     * const result = await glue.agm.invoke("Sum", { a: 37, b: 5 }); // everything else is optional
     * console.log('37 + 5 = ' + result.returned.answer);
     */

    public async invoke(methodFilter: string | Glue42Core.AGM.MethodDefinition, argumentObj?: object, target?: Glue42Core.AGM.InstanceTarget, additionalOptions?: Glue42Core.AGM.InvokeOptions, success?: Glue42Core.AGM.InvokeSuccessHandler<any>, error?: Glue42Core.AGM.InvokeErrorHandler)
        : Promise<Glue42Core.AGM.InvocationResult<any>> {
        const getInvokePromise = async () => {

            let methodDefinition: Glue42Core.AGM.MethodDefinition;
            if (typeof methodFilter === "string") {
                methodDefinition = { name: methodFilter };
            } else {
                methodDefinition = { ...methodFilter };
            }

            if (!methodDefinition.name) {
                return Promise.reject(`Method definition is required. Please, provide either a unique string for a method name or a “methodDefinition” object with a required “name” property.`);
            }

            if (!argumentObj) {
                argumentObj = {};
            }
            if (!target) {
                target = "best";
            }
            if (typeof target === "string" && target !== "all" && target !== "best" && target !== "skipMine") {
                return Promise.reject(new Error(`"${target}" is not a valid target. Valid targets are "all" and "best".`));
            }
            if (!additionalOptions) {
                additionalOptions = {};
            }

            if (additionalOptions.methodResponseTimeoutMs === undefined) {
                // legacy support
                additionalOptions.methodResponseTimeoutMs = (additionalOptions as any).method_response_timeout;
                if (additionalOptions.methodResponseTimeoutMs === undefined) {
                    // fallback to default
                    additionalOptions.methodResponseTimeoutMs = this.configuration.methodResponseTimeout;
                }
            }

            if (additionalOptions.waitTimeoutMs === undefined) {
                // legacy support
                additionalOptions.waitTimeoutMs = (additionalOptions as any).wait_for_method_timeout;
                if (additionalOptions.waitTimeoutMs === undefined) {
                    // fallback to default
                    additionalOptions.waitTimeoutMs = this.configuration.waitTimeoutMs;
                }
            }

            if (additionalOptions.waitTimeoutMs !== undefined && typeof additionalOptions.waitTimeoutMs !== "number") {
                return Promise.reject(new Error(`"${additionalOptions.waitTimeoutMs}" is not a valid number for "waitTimeoutMs" `));
            }

            // Check if the arguments are an object
            if (typeof argumentObj !== "object") {
                return Promise.reject(new Error(`The method arguments must be an object. method: ${methodDefinition.name}`));
            }

            let serversMethodMap: ServerMethodsPair[] = this.getServerMethodsByFilterAndTarget(methodDefinition, target);

            // Try to await them and then continue
            if (serversMethodMap.length === 0) {
                try {
                    // because of the additionalOptions
                    serversMethodMap = await this.tryToAwaitForMethods(methodDefinition, target, additionalOptions);
                } catch (err) {
                    const method: Glue42Core.Interop.Method = {
                        ...methodDefinition,
                        getServers: () => [],
                        supportsStreaming: false,
                        objectTypes: methodDefinition.objectTypes ?? [],
                        flags: methodDefinition.flags?.metadata ?? {}
                    };
                    const errorObj: InvocationResult = {
                        method,
                        called_with: argumentObj,
                        message: `Can not find a method matching ${JSON.stringify(methodFilter)} with server filter ${JSON.stringify(target)}`,
                        executed_by: undefined,
                        returned: undefined,
                        status: undefined,
                    };

                    return Promise.reject(errorObj);
                }
            }

            const timeout = additionalOptions.methodResponseTimeoutMs;
            // ts be happy
            const additionalOptionsCopy: Glue42Core.AGM.InvokeOptions = additionalOptions;
            const invokePromises: Array<Promise<InvokeResultMessage>> = serversMethodMap.map(
                (serversMethodPair) => {
                    const invId = random();
                    const method = serversMethodPair.methods[0];
                    const server = serversMethodPair.server;
                    const invokePromise = this.protocol.client.invoke(invId, method, argumentObj, server, additionalOptionsCopy);

                    return Promise.race([
                        invokePromise,
                        rejectAfter(timeout, invokePromise, {
                            invocationId: invId,
                            message: `Invocation timeout (${timeout} ms) reached for method name: ${method?.name}, target instance: ${JSON.stringify(server.instance)}, options: ${JSON.stringify(additionalOptionsCopy)}`,
                            status: InvokeStatus.Error,
                        })
                    ]);
                }
            );

            const invocationMessages: InvokeResultMessage[] = await Promise.all(invokePromises);

            const results = this.getInvocationResultObj(invocationMessages, methodDefinition, argumentObj);

            const allRejected = invocationMessages.every((result) => result.status === InvokeStatus.Error);
            if (allRejected) {
                return Promise.reject(results);
            }

            return results;
        };

        // I would call this
        return promisify(getInvokePromise(), success, error);
    }

    private getInvocationResultObj(invocationResults: InvokeResultMessage[], method: MethodDefinition, calledWith: object): InvocationResult<any> {
        /* tslint:disable:variable-name*/
        const all_return_values = invocationResults
            .filter((invokeMessage) => invokeMessage.status === InvokeStatus.Success)
            .reduce<InvocationResult[]>(
                (allValues, currentValue) => {
                    allValues = [
                        ...allValues,
                        {
                            executed_by: currentValue.instance,
                            returned: currentValue.result,
                            called_with: calledWith,
                            method,
                            message: currentValue.message,
                            status: currentValue.status,
                        }
                    ];

                    return allValues;
                }, []
            );

        /* tslint:disable:variable-name*/
        const all_errors = invocationResults
            .filter((invokeMessage) => invokeMessage.status === InvokeStatus.Error)
            .reduce<object[]>((allErrors, currError) => {
                allErrors = [
                    ...allErrors,
                    {
                        executed_by: currError.instance,
                        called_with: calledWith,
                        name: method.name,
                        message: currError.message,
                    }
                ];

                return allErrors;
            }, []);

        const invResult = invocationResults[0];

        const result: InvocationResult = {
            method,
            called_with: calledWith,
            returned: invResult.result,
            executed_by: invResult.instance,
            all_return_values,
            all_errors,
            message: invResult.message,
            status: invResult.status
        };

        return result;
    }

    /**
     * Called when the user tries to invoke a method which does not exist
     */
    private tryToAwaitForMethods(methodDefinition: MethodDefinition, target: Glue42Core.AGM.InstanceTarget, additionalOptions: Glue42Core.AGM.InvokeOptions): Promise<ServerMethodsPair[]> {
        return new Promise((resolve, reject) => {
            if (additionalOptions.waitTimeoutMs === 0) {
                reject();
                return;
            }

            const delayStep = 500;
            let delayTillNow = 0;

            const retry = () => {
                delayTillNow += delayStep;

                // get all servers that have method(s) matching the filter
                const serversMethodMap = this.getServerMethodsByFilterAndTarget(methodDefinition, target);
                if (serversMethodMap.length > 0) {
                    clearInterval(interval);
                    resolve(serversMethodMap);
                } else if (delayTillNow >= (additionalOptions.waitTimeoutMs || 10000)) {
                    clearInterval(interval);
                    reject();
                    return;
                }
            };
            const interval = setInterval(retry, delayStep);
        });
    }

    /**
     * Filters an array of servers and returns the ones which match the target criteria
     */
    private filterByTarget(target: Glue42Core.AGM.InstanceTarget, serverMethodMap: ServerMethodsPair[]): ServerMethodsPair[] {
        // If the user specified target as string:
        if (typeof target === "string") {
            if (target === "all") {
                return [...serverMethodMap];
            } else if (target === "best") {
                // Returns first app found
                const localMachine = serverMethodMap
                    .find((s) => s.server.instance.isLocal);

                if (localMachine) {
                    return [localMachine];
                }

                if (serverMethodMap[0] !== undefined) {
                    return [serverMethodMap[0]];
                }
            } else if (target === "skipMine") {
                return serverMethodMap.filter(({ server }) => server.instance.peerId !== this.instance.peerId);
            }
        } else {
            let targetArray: Glue42Core.AGM.Instance[];
            if (!Array.isArray(target)) {
                targetArray = [target];
            } else {
                targetArray = target;
            }

            // Retrieve all getServers that match the filters
            const allServersMatching = targetArray.reduce((matches: ServerMethodsPair[], filter) => {
                // Add matches for each filter
                const myMatches = serverMethodMap.filter((serverMethodPair) => {
                    return this.instanceMatch(filter, serverMethodPair.server.instance);
                });
                return matches.concat(myMatches);
            }, []);

            return allServersMatching;
        }
        return [];
    }

    /**
     * Matches a server definition against a server filter
     */
    private instanceMatch(instanceFilter: Glue42Core.AGM.Instance, instanceDefinition: Glue42Core.AGM.Instance): boolean {
        return this.containsProps(instanceFilter, instanceDefinition);
    }

    /**
     * Matches a method definition against a method filter
     */
    private methodMatch(methodFilter: Glue42Core.AGM.MethodDefinition, methodDefinition: Glue42Core.AGM.MethodDefinition): boolean {
        return this.containsProps(methodFilter, methodDefinition);
    }

    /**
     * Checks if all properties of filter match properties in object
     */
    private containsProps(filter: any, repoMethod: any): boolean {
        const filterProps = Object.keys(filter)
            .filter((prop) => {
                return filter[prop] !== undefined
                    && typeof filter[prop] !== "function"
                    && prop !== "object_types"
                    && prop !== "display_name"
                    && prop !== "id"
                    && prop !== "gatewayId"
                    && prop !== "identifier"
                    && prop[0] !== "_";
            });

        return filterProps.every((prop) => {
            let isMatch;

            const filterValue = filter[prop];
            const repoMethodValue = repoMethod[prop];

            switch (prop) {
                case "objectTypes":
                    // filterValue needs to be a subset of repoMethodValue.
                    isMatch = ((filterValue || []) as string[]).every((filterValueEl) => {
                        return ((repoMethodValue || []) as string[]).includes(filterValueEl);
                    });
                    break;
                case "flags":
                    // filterValue needs to be a subset of repoMethodValue.
                    isMatch = isSubset(repoMethodValue || {}, filterValue || {});
                    break;
                default:
                    isMatch = String(filterValue).toLowerCase() === String(repoMethodValue).toLowerCase();
            }

            return isMatch;
        });
    }

    private getMethods(methodFilter: Glue42Core.AGM.MethodDefinition): ClientMethodInfo[] {
        if (methodFilter === undefined) {
            return this.repo.getMethods();
        }

        const methods = this.repo.getMethods().filter((method) => {
            return this.methodMatch(methodFilter, method);
        });

        return methods;
    }

    private getMethodsForInstance(instanceFilter: Glue42Core.AGM.Instance): ClientMethodInfo[] {
        const allServers: ServerInfo[] = this.repo.getServers();

        const matchingServers = allServers.filter((server) => {
            return this.instanceMatch(instanceFilter, server.instance);
        });

        if (matchingServers.length === 0) {
            return [];
        }

        let resultMethodsObject: { [key: string]: ClientMethodInfo } = {};

        if (matchingServers.length === 1) {
            resultMethodsObject = matchingServers[0].methods;
        } else {
            // we have more than one server matching, join all methods
            matchingServers.forEach((server) => {
                Object.keys(server.methods).forEach((methodKey) => {
                    const method = server.methods[methodKey];
                    // group by method identifier
                    resultMethodsObject[method.identifier] = method;
                });
            });
        }

        // transform the object to array
        return Object.keys(resultMethodsObject)
            .map((key) => {
                return resultMethodsObject[key];
            });
    }

    private getServers(methodFilter?: Glue42Core.AGM.MethodDefinition): ServerMethodsPair[] {
        const servers = this.repo.getServers();

        // No method - get all getServers
        if (methodFilter === undefined) {
            return servers.map((server) => {
                return { server, methods: [] };
            });
        }

        // // Non-existing method - return an empty array
        // const methods = this.getMethods(methodFilter);
        // if (methods === undefined) {
        //     return [];
        // }

        return servers.reduce<ServerMethodsPair[]>((prev, current) => {

            const methodsForServer = Object.values(current.methods);

            const matchingMethods = methodsForServer.filter((method) => {
                return this.methodMatch(methodFilter, method);
            });

            if (matchingMethods.length > 0) {
                prev.push({ server: current, methods: matchingMethods });
            }

            return prev;
        }, []);
    }

    /**
     * Returns an array of server-methods pairs for all servers that match the target and have at lease one method matching the method filter
     */
    private getServerMethodsByFilterAndTarget(methodFilter: Glue42Core.AGM.MethodDefinition, target: Glue42Core.AGM.InstanceTarget): ServerMethodsPair[] {
        // get all servers that have method(s) matching the filter
        const serversMethodMap = this.getServers(methodFilter);
        // filter the server-method map by target
        return this.filterByTarget(target, serversMethodMap);
    }

}
