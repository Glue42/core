import promisify from "../helpers/promisify";
import ServerStreaming from "./streaming";
import { Protocol, InteropSettings } from "../types";
import ServerRepository from "./repository";
import { Glue42Core } from "../../../glue";
import { WrappedCallbackFunction, ResultContext, ServerMethodInfo } from "./types";
import ServerStream from "./stream";

/*
 The AGM Server allows users register AGM methods.
 It exposes these methods to AGM clients (using presence messages) and listens for their invocation
 */
export default class Server {
    private streaming: ServerStreaming;
    private invocations: number = 0;
    private currentlyUnregistering: { [method: string]: Promise<void> } = {};

    constructor(private protocol: Protocol, private serverRepository: ServerRepository) {
        // An array of the server's methods
        this.streaming = new ServerStreaming(protocol, this);

        this.protocol.server.onInvoked(this.onMethodInvoked.bind(this));
    }

    // Registers a new streaming agm method
    public createStream(streamDef: string | Glue42Core.AGM.MethodDefinition, callbacks?: Glue42Core.AGM.StreamOptions, successCallback?: (args?: object) => void, errorCallback?: (error?: string | object) => void, existingStream?: ServerStream): Promise<Glue42Core.AGM.Stream> {
        // in callbacks we have subscriptionRequestHandler, subscriptionAddedHandler, subscriptionRemovedHandler
        const promise = new Promise((resolve, reject) => {
            if (!streamDef) {
                reject(`The stream name must be unique! Please, provide either a unique string for a stream name to “glue.interop.createStream()” or a “methodDefinition” object with a unique “name” property for the stream.`);
            }

            // transform to a definition
            let streamMethodDefinition: Glue42Core.AGM.MethodDefinition;

            // This is important because if you change the name for example this will change here as well and it shouldn't change by reference
            if (typeof streamDef === "string") {
                streamMethodDefinition = { name: "" + streamDef };
            } else {
                streamMethodDefinition = { ...streamDef };
            }

            if (!streamMethodDefinition.name) {
                return reject(`The “name” property is required for the “streamDefinition” object and must be unique. Stream definition: ${JSON.stringify(streamMethodDefinition)}`);
            }

            const nameAlreadyExists = this.serverRepository.getList()
                .some((serverMethod) => serverMethod.definition.name === streamMethodDefinition.name);

            if (nameAlreadyExists) {
                return reject(`A stream with the name "${streamMethodDefinition.name}" already exists! Please, provide a unique name for the stream.`);
            }

            streamMethodDefinition.supportsStreaming = true;

            // User-supplied subscription callbacks
            if (!callbacks) {
                callbacks = {};
            }

            if (typeof callbacks.subscriptionRequestHandler !== "function") {
                callbacks.subscriptionRequestHandler = (request: Glue42Core.AGM.SubscriptionRequest) => {
                    request.accept();
                };
            }
            // Add the method
            const repoMethod = this.serverRepository.add({
                definition: streamMethodDefinition, // store un-formatted definition for checkups in un-register method
                streamCallbacks: callbacks,
                protocolState: {},
            });

            this.protocol.server.createStream(repoMethod)
                .then(() => {
                    let streamUserObject: ServerStream;
                    if (existingStream) {
                        streamUserObject = existingStream;
                        existingStream.updateRepoMethod(repoMethod);
                    } else {
                        streamUserObject = new ServerStream(this.protocol, repoMethod, this);
                    }
                    repoMethod.stream = streamUserObject;
                    resolve(streamUserObject);
                })
                .catch((err) => {
                    if (repoMethod.repoId) {
                        this.serverRepository.remove(repoMethod.repoId);
                    }
                    reject(err);
                });
        });

        return promisify(promise, successCallback, errorCallback);
    }

    /**
     * Registers a new agm method
     * @param {MethodDefinition} methodDefinition
     * @param {MethodHandler} callback Callback that will be called when the AGM server is invoked
     */

    public register(methodDefinition: string | Glue42Core.AGM.MethodDefinition, callback: (args: object, caller: Glue42Core.AGM.Instance) => object | Promise<object>): Promise<void> {
        if (!methodDefinition) {
            return Promise.reject(`Method definition is required. Please, provide either a unique string for a method name or a “methodDefinition” object with a required “name” property.`);
        }

        if (typeof callback !== "function") {
            return Promise.reject(`The second parameter must be a callback function. Method: ${typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name}`);
        }

        const wrappedCallbackFunction: WrappedCallbackFunction = async (context: ResultContext, resultCallback: (err: string | undefined, result: object) => void) => {
            // get the result as direct invocation of the callback and return it using resultCallback
            try {
                const result = callback(context.args, context.instance);
                if (result && typeof (result as any).then === "function") {
                    const resultValue = await result;
                    resultCallback(undefined, resultValue);
                } else {
                    resultCallback(undefined, result);
                }
            } catch (e) {
                if (!e) {
                    e = "";
                }
                resultCallback(e, e);
            }
        };

        wrappedCallbackFunction.userCallback = callback;

        return this.registerCore(methodDefinition, wrappedCallbackFunction);
    }

    // registers a new async agm method (the result can be returned in async way)
    public registerAsync(methodDefinition: string | Glue42Core.AGM.MethodDefinition, callback: (args: object, caller: Glue42Core.AGM.Instance, successCallback: (args?: object) => void, errorCallback: (error?: string | object) => void) => Promise<object> | void): Promise<void> {
        if (!methodDefinition) {
            return Promise.reject(`Method definition is required. Please, provide either a unique string for a method name or a “methodDefinition” object with a required “name” property.`);
        }

        if (typeof callback !== "function") {
            return Promise.reject(`The second parameter must be a callback function. Method: ${typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name}`);
        }

        const wrappedCallback: WrappedCallbackFunction = (context: ResultContext, resultCallback: (err: string | undefined, result: object | undefined) => void) => {
            // invoke the callback passing success and error callbacks
            try {
                let resultCalled = false;
                const success = (result?: object) => {
                    if (!resultCalled) {
                        resultCallback(undefined, result);
                    }
                    resultCalled = true;
                };
                const error = (e: any) => {
                    if (!resultCalled) {
                        if (!e) {
                            e = "";
                        }
                        resultCallback(e, e);
                    }
                    resultCalled = true;
                };

                const methodResult = callback(context.args,
                    context.instance,
                    success,
                    error
                );

                if (methodResult && typeof methodResult.then === "function") {
                    methodResult
                        .then(success)
                        .catch(error);
                }
            } catch (e) {
                resultCallback(e, undefined);
            }
        };
        wrappedCallback.userCallbackAsync = callback;

        return this.registerCore(methodDefinition, wrappedCallback);
    }

    // Unregisters a previously registered AGM method
    public async unregister(methodFilter: string | Glue42Core.AGM.MethodDefinition, forStream: boolean = false): Promise<void> {
        if (methodFilter === undefined) {
            return Promise.reject(`Please, provide either a unique string for a name or an object containing a “name” property.`);
        }

        // WHEN A FUNCTION IS PASSED
        if (typeof methodFilter === "function") {
            await this.unregisterWithPredicate(methodFilter, forStream);
            return;
        }

        // WHEN string / object is passed
        let methodDefinition: Glue42Core.AGM.MethodDefinition;
        if (typeof methodFilter === "string") {
            methodDefinition = { name: methodFilter };
        } else {
            methodDefinition = methodFilter;
        }

        if (methodDefinition.name === undefined) {
            return Promise.reject(`Method name is required. Cannot find a method if the method name is undefined!`);
        }

        const methodToBeRemoved: ServerMethodInfo | undefined = this.serverRepository.getList().find((serverMethod) => {
            return serverMethod.definition.name === methodDefinition.name
                && (serverMethod.definition.supportsStreaming || false) === forStream;
            // return this.containsProps(methodFilter, method.definition);
        });

        if (!methodToBeRemoved) {
            return Promise.reject(`Method with a name "${methodDefinition.name}" does not exist or is not registered by your application!`);
        }

        await this.removeMethodsOrStreams([methodToBeRemoved]);
    }

    private async unregisterWithPredicate(filterPredicate: (methodDefinition: Glue42Core.AGM.MethodDefinition) => ServerMethodInfo, forStream?: boolean) {
        const methodsOrStreamsToRemove = this.serverRepository.getList()
            .filter((sm) => filterPredicate(sm.definition))
            .filter((serverMethod) =>
                // because both can be undefined or false
                (serverMethod.definition.supportsStreaming || false) === forStream
            );

        if (!methodsOrStreamsToRemove || methodsOrStreamsToRemove.length === 0) {
            return Promise.reject(`Could not find a ${forStream ? "stream" : "method"} matching the specified condition!`);
        }

        await this.removeMethodsOrStreams(methodsOrStreamsToRemove);
    }

    private removeMethodsOrStreams(methodsToRemove: ServerMethodInfo[]) {
        const methodUnregPromises: Array<Promise<void>> = [];

        methodsToRemove.forEach((method) => {
            const promise = this.protocol.server.unregister(method)
                .then(() => {
                    if (method.repoId) {
                        this.serverRepository.remove(method.repoId);
                    }
                });

            methodUnregPromises.push(promise);
            this.addAsCurrentlyUnregistering(method.definition.name, promise);
        });

        return Promise.all(methodUnregPromises);
    }

    private async addAsCurrentlyUnregistering(methodName: string, promise: Promise<void>) {
        const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

        // will be cleared when promise resolved
        this.currentlyUnregistering[methodName] = Promise.race([promise, timeout]).then(() => {
            delete this.currentlyUnregistering[methodName];
        });
    }

    // Core method for registering agm method
    private async registerCore(method: string | Glue42Core.AGM.MethodDefinition, theFunction: WrappedCallbackFunction): Promise<void> {
        // transform to a definition
        let methodDefinition: Glue42Core.AGM.MethodDefinition;

        // This is important because if you change the name for example this will change here as well and it shouldn't change by reference
        if (typeof method === "string") {
            methodDefinition = { name: "" + method };
        } else {
            methodDefinition = { ...method };
        }

        if (!methodDefinition.name) {
            return Promise.reject(`Please, provide a (unique) string value for the “name” property in the “methodDefinition” object: ${JSON.stringify(method)}`);
        }

        const unregisterInProgress = this.currentlyUnregistering[methodDefinition.name];
        if (unregisterInProgress) {
            await unregisterInProgress;
        }

        const nameAlreadyExists = this.serverRepository.getList()
            .some((serverMethod) => serverMethod.definition.name === methodDefinition.name);

        if (nameAlreadyExists) {
            return Promise.reject(`A method with the name "${methodDefinition.name}" already exists! Please, provide a unique name for the method.`);
        }

        if (methodDefinition.supportsStreaming) {
            return Promise.reject(`When you create methods with “glue.interop.register()” or “glue.interop.registerAsync()” the property “supportsStreaming” cannot be “true”. If you want “${methodDefinition.name}” to be a stream, please use the “glue.interop.createStream()” method.`);
        }

        // Add the method ()
        const repoMethod = this.serverRepository.add({
            definition: methodDefinition, // store un-formatted definition for checkups in un-register method
            theFunction,
            protocolState: {},
        });

        // make it then .catch for those error/success callbacks
        return this.protocol.server.register(repoMethod)
            .catch((err: any) => {
                if (repoMethod?.repoId) {
                    this.serverRepository.remove(repoMethod.repoId);
                }
                throw err;
            });
    }

    private onMethodInvoked(methodToExecute: ServerMethodInfo, invocationId: string, invocationArgs: ResultContext) {
        if (!methodToExecute || !methodToExecute.theFunction) {
            return;
        }

        // Execute it and save the result
        methodToExecute.theFunction(invocationArgs, (err: any, result) => {
            if (err !== undefined && err !== null) {
                // handle error case
                if (err.message && typeof err.message === "string") {
                    err = err.message;
                } else if (typeof err !== "string") {
                    try {
                        err = JSON.stringify(err);
                    } catch (unStrException) {
                        err = `un-stringifyable error in onMethodInvoked! Top level prop names: ${Object.keys(err)}`;
                    }
                }
            }

            // The AGM library only transfers objects. If the result is not an object, put it in one
            if (typeof result !== "object" || result.constructor === Array) {
                result = { _value: result };
            }
            if (!result) {
                result = {};
            }

            this.protocol.server.methodInvocationResult(methodToExecute, invocationId, err, result);
        });
    }
}
