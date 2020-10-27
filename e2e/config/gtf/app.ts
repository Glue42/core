import { Glue42Web } from "../../../packages/web/web";
import { Gtf, ControlArgs } from "./types";

export class GtfApp implements Gtf.App {
    constructor(
        private readonly glue: Glue42Web.API,
        public readonly myInstance: Glue42Web.AppManager.Instance,
        private readonly controlMethodName: string
    ) { }

    // hristo react tutorial on tuesday
    public get agm() {
        return {
            register: (methodDefinition: string | object) => {
                const controlArgs: ControlArgs = {
                    operation: 'register',
                    params: {
                        methodDefinition
                    }
                }
                return this.sendControl<void>(controlArgs);
            },
            unregister: (methodDefinition: string | object) => {
                const controlArgs: ControlArgs = {
                    operation: 'unregister',
                    params: {
                        methodDefinition
                    }
                }
                return this.sendControl<void>(controlArgs);
            },
            registerAsync: (methodDefinition: string | object) => {
                const controlArgs: ControlArgs = {
                    operation: 'registerAsync',
                    params: {
                        methodDefinition
                    }
                }
                return this.sendControl<void>(controlArgs);
            },
            createStream: (methodDefinition: any): Promise<any> => {
                return new Promise(async (resolve, reject) => {
                    const registerStreamOptions: ControlArgs = {
                        operation: "createStream",
                        params: {
                            methodDefinition
                        }
                    };
                    const closeStream = async (): Promise<void> => {
                        const closeStreamOptions: ControlArgs = {
                            operation: "closeStream",
                            params: {
                                methodDefinition
                            }
                        };

                        await this.sendControl<void>(closeStreamOptions);
                    };

                    const pushStream = (data: object, branches?: string | string[]) => {
                        const pushStreamOptions: ControlArgs = {
                            operation: "pushStream",
                            params: {
                                data,
                                branches
                            }
                        };

                        this.sendControl<void>(pushStreamOptions);
                    };

                    try {
                        await this.sendControl<void>(registerStreamOptions);
                        const streamFacade = {
                            close: closeStream,
                            push: pushStream,
                            name: methodDefinition.name
                        };
                        resolve(streamFacade);
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        }
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
