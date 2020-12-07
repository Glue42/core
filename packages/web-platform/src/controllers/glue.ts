/* eslint-disable @typescript-eslint/no-explicit-any */
import GlueCore, { Glue42Core } from "@glue42/core";
import GlueWeb, { Glue42Web, GlueWebFactoryFunction } from "@glue42/web";
import { GlueClientControlName, GlueWebPlatformControlName, GlueWebPlatformStreamName, GlueWebPlatformWorkspacesStreamName, GlueWorkspaceFrameClientControlName } from "../common/constants";
import { BridgeOperation, InternalPlatformConfig, LibDomains } from "../common/types";
import { PortsBridge } from "../connection/portsBridge";
import { generate } from "shortid";
import { SessionStorageController } from "./session";
import logger from "../shared/logger";
import { PromisePlus } from "../shared/promisePlus";
import { waitFor } from "../shared/utils";

export class GlueController {
    private _systemGlue!: Glue42Core.GlueCore;
    private _clientGlue!: Glue42Web.API;
    private _systemStream: Glue42Core.Interop.Stream | undefined;
    private _workspacesStream: Glue42Core.Interop.Stream | undefined;
    private _platformClientWindowId!: string;

    constructor(
        private readonly portsBridge: PortsBridge,
        private readonly sessionStorage: SessionStorageController
    ) { }

    public get platformWindowId(): string {
        return this._platformClientWindowId.slice();
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this._systemGlue = await this.initSystemGlue(config.glue);
        logger.setLogger(this._systemGlue.logger);
    }

    public async initGlue(config?: Glue42Web.Config, factory?: GlueWebFactoryFunction): Promise<Glue42Web.API> {
        const port = await this.portsBridge.createInternalClient();

        const platformWindowData = this.sessionStorage.getWindowDataByName("Platform");

        this._platformClientWindowId = platformWindowData ? platformWindowData.windowId : generate();

        if (!platformWindowData) {
            this.sessionStorage.saveWindowData({ name: "Platform", windowId: this.platformWindowId });
        }

        const webConfig = {
            application: "Platform",
            gateway: { webPlatform: { port, windowId: this.platformWindowId } }
        };

        const c = Object.assign({}, config, webConfig);

        this._clientGlue = factory ? await factory(c) : await GlueWeb(c) as any;

        return this._clientGlue;
    }

    public async createPlatformSystemMethod(handler: (args: unknown, caller: Glue42Web.Interop.Instance, success: (args?: unknown) => void, error: (error?: string | object) => void) => void): Promise<void> {
        await this.createMethodAsync(GlueWebPlatformControlName, handler);
    }

    public async createPlatformSystemStream(): Promise<void> {
        this._systemStream = await this.createStream(GlueWebPlatformStreamName);
    }

    public async createWorkspacesStream(): Promise<void> {
        this._workspacesStream = await this.createStream(GlueWebPlatformWorkspacesStreamName);
    }

    public async createWorkspacesEventsReceiver(callback: (data: any) => void): Promise<void> {
        await this._systemGlue.interop.register("T42.Workspaces.Events", (args) => callback(args));
    }

    public pushSystemMessage(domain: LibDomains, operation: string, data: any): void {
        if (!this._systemStream) {
            throw new Error(`Cannot push data to domain: ${domain}, because the system stream is not created`);
        }

        this._systemStream.push({ domain, operation, data });
    }

    public pushWorkspacesMessage(data: any): void {
        if (!this._workspacesStream) {
            throw new Error("Cannot push data to domain: workspaces, because the workspaces stream is not created");
        }

        this._workspacesStream.push({ data });
    }

    public async callFrame<OutBound extends object, InBound>(operationDefinition: BridgeOperation, operationArguments: OutBound, windowId: string): Promise<InBound> {
        const messageData = { operation: operationDefinition.name, operationArguments };

        const baseErrorMessage = `Internal Platform->Frame Communication Error. Attempted calling workspace frame: ${windowId} for operation ${operationDefinition.name} `;

        if (operationDefinition.dataDecoder) {
            const decodeResult = operationDefinition.dataDecoder.run(messageData.operationArguments);

            if (!decodeResult.ok) {
                throw new Error(`${baseErrorMessage} OutBound validation failed: ${JSON.stringify(decodeResult.error)}`);
            }
        }

        const result = await this.transmitMessage<InBound>(GlueWorkspaceFrameClientControlName, messageData, baseErrorMessage, { windowId }, { methodResponseTimeoutMs: 30000, waitTimeoutMs: 30000 });

        if (operationDefinition.resultDecoder) {
            const decodeResult = operationDefinition.resultDecoder.run(result);

            if (!decodeResult.ok) {
                throw new Error(`${baseErrorMessage} Result validation failed: ${JSON.stringify(decodeResult.error)}`);
            }
        }

        return result;
    }

    public async callWindow<OutBound extends object, InBound>(operationDefinition: BridgeOperation, data: OutBound, windowId: string): Promise<InBound> {

        const operation = operationDefinition.name;

        const messageData = { domain: "windows", operation, data };

        const baseErrorMessage = `Internal Platform->Window Communication Error. Attempted calling client window: ${windowId} for operation ${operation}. `;

        if (operationDefinition.dataDecoder) {
            const decodeResult = operationDefinition.dataDecoder.run(messageData.data);

            if (!decodeResult.ok) {
                throw new Error(`${baseErrorMessage} OutBound validation failed: ${JSON.stringify(decodeResult.error)}`);
            }
        }

        const result = await this.transmitMessage<InBound>(GlueClientControlName, messageData, baseErrorMessage, { windowId }, { methodResponseTimeoutMs: 30000, waitTimeoutMs: 30000 });

        if (operationDefinition.resultDecoder) {
            const decodeResult = operationDefinition.resultDecoder.run(result);

            if (!decodeResult.ok) {
                throw new Error(`${baseErrorMessage} Result validation failed: ${JSON.stringify(decodeResult.error)}`);
            }
        }

        return result;
    }

    public async setInstanceStartContext(windowId: string, context: any): Promise<void> {
        const key = `___instance___${windowId}`;
        await this._systemGlue.contexts.set(key, context);
    }

    public setWindowStartContext(windowId: string, context: any): Promise<void> {
        return PromisePlus((resolve, reject) => {
            let unsub: () => void;

            const ready = waitFor(3, () => {
                resolve();
                unsub();
            });
            const key = `___window___${windowId}`;

            this._clientGlue.contexts.subscribe(key, ready)
                .then((un) => {
                    unsub = un;
                    ready();
                });
            this._systemGlue.contexts.set(key, context).then(ready).catch(reject);
        }, 10000, `Timed out waiting to set the window context for: ${windowId}`);
    }

    private async initSystemGlue(config?: Glue42Web.Config): Promise<Glue42Core.GlueCore> {

        const port = await this.portsBridge.createInternalClient();

        const logLevel = config?.systemLogger?.level ?? "trace";

        return await GlueCore({
            application: "Platform",
            gateway: { webPlatform: { port } },
            logger: logLevel
        });
    }

    private async createMethodAsync(name: string, handler: (args: unknown, caller: Glue42Web.Interop.Instance, success: (args?: unknown) => void, error: (error?: string | object) => void) => void): Promise<void> {
        await this._systemGlue.interop.registerAsync(name, handler);
    }

    private async createStream(name: string): Promise<Glue42Web.Interop.Stream> {
        return this._systemGlue.interop.createStream(name);
    }

    private async transmitMessage<T>(methodName: string, messageData: any, baseErrorMessage: string, target?: "best" | "all" | Glue42Core.Interop.Instance, options?: Glue42Core.Interop.InvokeOptions): Promise<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let invocationResult: Glue42Core.Interop.InvocationResult<T>;

        try {
            invocationResult = await this._systemGlue.interop.invoke<T>(methodName, messageData, target, options);

            if (!invocationResult) {
                throw new Error(`${baseErrorMessage} Received unsupported result from the client - empty result`);
            }

            if (!Array.isArray(invocationResult.all_return_values) || invocationResult.all_return_values.length === 0) {
                throw new Error(`${baseErrorMessage} Received unsupported result from the client - empty values collection`);
            }
        } catch (error) {
            if (error && error.all_errors && error.all_errors.length) {
                // IMPORTANT: Do NOT change the `Inner message:` string, because it is used by other programs to extract the inner message of a communication error
                const invocationErrorMessage = error.all_errors[0].message;
                throw new Error(`${baseErrorMessage} -> Inner message: ${invocationErrorMessage}`);

            }
            // IMPORTANT: Do NOT change the `Inner message:` string, because it is used by other programs to extract the inner message of a communication error
            throw new Error(`${baseErrorMessage} -> Inner message: ${error.message}`);
        }

        return invocationResult.all_return_values[0].returned;
    }
}
