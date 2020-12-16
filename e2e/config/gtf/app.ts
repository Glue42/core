import { Glue42Web } from "../../../packages/web/web";
import { Gtf, ControlArgs, SubscriptionFacade, StreamFacade } from "./types";

export class GtfApp implements Gtf.App {
    private registerResponseCounter = 0;

    constructor(
        private readonly glue: Glue42Web.API,
        public readonly myInstance: Glue42Web.AppManager.Instance,
        private readonly controlMethodName: string
    ) { }

    public get agm() {
        const methodDefinitionToParams = (methodDefinition: string | Glue42Web.Interop.MethodDefinition) => {
            let params;

            if (typeof methodDefinition === "string") {
                params = {
                    methodDefinition: {
                        name: methodDefinition
                    }
                };
            } else {
                params = {
                    methodDefinition
                };
            }

            return params;
        };

        return {
            instance: this.myInstance.agm,
            register: (methodDefinition: string | Glue42Web.Interop.MethodDefinition): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: "register",
                    params: methodDefinitionToParams(methodDefinition)
                };
                return this.sendControl<void>(controlArgs);
            },
            unregister: (methodDefinition: string | Glue42Web.Interop.MethodDefinition): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: "unregisterMethod",
                    params: methodDefinitionToParams(methodDefinition)
                };
                return this.sendControl<void>(controlArgs);
            },
            registerAsync: async (methodDefinition: string | Glue42Web.Interop.MethodDefinition, callback: (args: any, caller: Glue42Web.Interop.Instance, successCallback: (args?: any) => void, errorCallback: (error?: string | object) => void) => void): Promise<void> => {
                const responseMethodName = `agm.integration.tests.onMethodInvoke.${this.myInstance.id}.${++this.registerResponseCounter}`;

                await this.glue.interop.register(responseMethodName, (args) => {
                    const success = () => { };

                    const error = () => { };

                    return callback(args.args, this.myInstance.agm, success, error);
                });

                const controlArgs: ControlArgs = {
                    operation: "registerAsync",
                    params: {
                        ...methodDefinitionToParams(methodDefinition),
                        responseName: responseMethodName
                    }
                };

                await this.sendControl<void>(controlArgs);
            },
            createStream: async (methodDefinition: string | Glue42Web.Interop.MethodDefinition): Promise<StreamFacade> => {
                const params = methodDefinitionToParams(methodDefinition);

                const registerStreamOptions: ControlArgs = {
                    operation: "createStream",
                    params
                };

                const closeStream = async (): Promise<void> => {
                    const closeStreamOptions: ControlArgs = {
                        operation: "closeStream",
                        params
                    };

                    await this.sendControl<void>(closeStreamOptions);
                };

                const pushStream = async (data: object, branches: string | string[] = []): Promise<void> => {
                    const pushStreamOptions: ControlArgs = {
                        operation: "pushStream",
                        params: {
                            ...params,
                            data,
                            branches
                        }
                    };

                    await this.sendControl<void>(pushStreamOptions);
                };

                await this.sendControl<void>(registerStreamOptions);

                const streamFacade: StreamFacade = {
                    close: closeStream,
                    push: pushStream,
                    name: (methodDefinition as Glue42Web.Interop.MethodDefinition).name || methodDefinition as string
                };

                return streamFacade;
            },
            subscribe: async (methodDefinition: string | Glue42Web.Interop.MethodDefinition, parameters: Glue42Web.Interop.SubscriptionParams = {}): Promise<SubscriptionFacade> => {
                const callbacks: ((data: any) => void)[] = [];
                const responseMethodName = `agm.integration.tests.onSubscriptionData.${this.myInstance.id}.${++this.registerResponseCounter}`;

                await this.glue.interop.register(responseMethodName, (args) => {
                    callbacks.forEach((callback) => callback(args));
                });

                const controlArgs: ControlArgs = {
                    operation: "subscribe",
                    params: {
                        ...methodDefinitionToParams(methodDefinition),
                        parameters,
                        responseName: responseMethodName
                    }
                };

                await this.sendControl<void>(controlArgs);

                const subscriptionFacade: SubscriptionFacade = {
                    onData: (callback: (data: any) => void): void => {
                        callbacks.push(callback);
                    }
                };

                return subscriptionFacade;
            },
            unsubscribe: (methodDefinition: string | Glue42Web.Interop.MethodDefinition): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: "unsubscribe",
                    params: methodDefinitionToParams(methodDefinition)
                };
                return this.sendControl<void>(controlArgs);
            },
            waitForMethodAdded: (methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance: string = this.glue.interop.instance.instance): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: "waitForMethodAdded",
                    params: {
                        ...methodDefinitionToParams(methodDefinition),
                        targetAgmInstance
                    }
                };
                return this.sendControl<void>(controlArgs);
            }
        }
    }

    public get intents() {
        return {
            addIntentListener: (intent: string | Glue42Web.Intents.AddIntentListenerRequest): Promise<ReturnType<Glue42Web.Intents.API['addIntentListener']>> => {
                const controlArgs: ControlArgs = {
                    operation: 'addIntentListener',
                    params: {
                        intent: typeof intent === "string" ? { intent } : intent
                    }
                };

                return this.sendControl<ReturnType<Glue42Web.Intents.API['addIntentListener']>>(controlArgs);
            },
            unregisterIntent: (intent: string | Glue42Web.Intents.AddIntentListenerRequest): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: 'unregisterIntent',
                    params: {
                        intent: typeof intent === "string" ? { intent } : intent
                    }
                };

                return this.sendControl<void>(controlArgs);
            }
        };
    }

    public get channels() {
        return {
            publish: (data: any, name: string): Promise<void> => {
                const controlArgs: ControlArgs = {
                    operation: 'publish',
                    params: {
                        data,
                        name
                    }
                };

                return this.sendControl<void>(controlArgs);
            }
        };
    }

    public async stop(): Promise<void> {
        await this.myInstance.stop();
    }

    public async setContext(ctxName: string, ctxData: any): Promise<void> {
        const controlArgs: ControlArgs = {
            operation: "setContext",
            params: {
                name: ctxName,
                data: ctxData
            }
        };

        return this.sendControl<void>(controlArgs);
    }

    public async updateContext(ctxName: string, ctxData: any): Promise<void> {
        const controlArgs: ControlArgs = {
            operation: "updateContext",
            params: {
                name: ctxName,
                data: ctxData
            }
        };

        return this.sendControl<void>(controlArgs);
    }

    public async getContext(ctxName: string): Promise<any> {
        const controlArgs: ControlArgs = {
            operation: "getContext",
            params: {
                name: ctxName
            }
        };

        return this.sendControl<any>(controlArgs);
    }

    public async getAllContextNames(): Promise<string[]> {
        const controlArgs: ControlArgs = {
            operation: "getAllContextNames",
            params: {}
        };

        return this.sendControl<string[]>(controlArgs);
    }

    private async sendControl<T>(controlArgs: ControlArgs): Promise<T> {
        const invResult = await this.glue.interop.invoke<{ result: T }>(this.controlMethodName, controlArgs, this.myInstance.agm);

        return invResult.returned.result;
    }
}
