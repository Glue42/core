/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "@glue42/web";
import { ApplicationStartConfig, BridgeOperation, LibController } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { IoC } from "../../shared/ioc";
import { PromisePlus } from "../../shared/promisePlus";
import { intentsOperationTypesDecoder, wrappedIntentsDecoder, wrappedIntentFilterDecoder, intentRequestDecoder, intentResultDecoder } from "./decoders";
import { IntentsOperationTypes, AppDefinitionWithIntents, IntentInfo, IntentStore, WrappedIntentFilter, WrappedIntents } from "./types";
import logger from "../../shared/logger";
import { GlueWebIntentsPrefix } from "../../common/constants";

export class IntentsController implements LibController {
    private operations: { [key in IntentsOperationTypes]: BridgeOperation } = {
        getIntents: { name: "getIntents", resultDecoder: wrappedIntentsDecoder, execute: this.getWrappedIntents.bind(this) },
        findIntent: { name: "findIntent", dataDecoder: wrappedIntentFilterDecoder, resultDecoder: wrappedIntentsDecoder, execute: this.findIntent.bind(this) },
        raiseIntent: { name: "raiseIntent", dataDecoder: intentRequestDecoder, resultDecoder: intentResultDecoder, execute: this.raiseIntent.bind(this) }
    };
    private started = false;

    constructor(
        private readonly glueController: GlueController,
        private readonly sessionStorage: SessionStorageController,
        private readonly ioc: IoC
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("intents.controller");
    }

    public async start(): Promise<void> {
        this.started = true;
    }

    public async handleControl(args: any): Promise<void> {
        if (!this.started) {
            new Error("Cannot handle this intents control message, because the controller has not been started");
        }

        const intentsData = args.data;

        const commandId = args.commandId;

        const operationValidation = intentsOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This intents request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(intentsData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`Intents request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(intentsData)}`);

        const result = await this.operations[operationName].execute(intentsData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`Intents request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    private extractAppIntents(apps: AppDefinitionWithIntents[]): IntentStore {
        const intents: IntentStore = {};

        const appsWithIntents = apps.filter((app) => app.intents.length > 0);
        //  Gather app handlers from application definitions.
        for (const app of appsWithIntents) {
            for (const intentDef of app.intents) {
                if (!intents[intentDef.name]) {
                    intents[intentDef.name] = [];
                }

                const handler: Glue42Web.Intents.IntentHandler = {
                    applicationName: app.name,
                    applicationTitle: app.title,
                    applicationDescription: app.caption,
                    displayName: intentDef.displayName,
                    contextTypes: intentDef.contexts,
                    applicationIcon: app.icon,
                    type: "app"
                };

                intents[intentDef.name].push(handler);
            }
        }

        return intents;
    }

    private async getInstanceIntents(apps: AppDefinitionWithIntents[], commandId: string): Promise<IntentStore> {
        const intents: IntentStore = {};

        // Discover all running instances that provide intents, and add them to the corresponding intent.
        for (const server of this.glueController.getServers()) {
            const serverIntentsMethods = (server.getMethods?.() || []).filter((method) => method.name.startsWith(GlueWebIntentsPrefix));

            await Promise.all(serverIntentsMethods.map(async (method) => {
                const intentName = method.name.replace(GlueWebIntentsPrefix, "");
                if (!intents[intentName]) {
                    intents[intentName] = [];
                }

                const info = method.flags as Glue42Web.Intents.AddIntentListenerRequest;

                const app = apps.find((appDef) => appDef.name === server.application);
                let appIntent: IntentInfo | undefined;
                // app can be undefined in the case of a dynamic intent.
                if (app && app.intents) {
                    appIntent = app.intents.find((appDefIntent) => appDefIntent.name === intentName);
                }

                let title: string | undefined;

                if (server.windowId) {
                    title = await this.ioc.windowsController.getWindowTitle(server.windowId, commandId);
                }

                const handler: Glue42Web.Intents.IntentHandler = {
                    // IFrames do not have windowIds but can still register intents.
                    instanceId: server.windowId || server.instance,
                    applicationName: server.application || "",
                    applicationIcon: info.icon || app?.icon,
                    applicationTitle: app?.title || "",
                    applicationDescription: info.description || app?.caption,
                    displayName: info.displayName || appIntent?.displayName,
                    contextTypes: info.contextTypes || appIntent?.contexts,
                    instanceTitle: title,
                    type: "instance"
                };
                intents[intentName].push(handler);
            }));
        }

        return intents;
    }

    private mergeIntentStores(storeOne: IntentStore, storeTwo: IntentStore): IntentStore {
        const intents: IntentStore = {};

        for (const name of new Set([...Object.keys(storeOne), ...Object.keys(storeTwo)])) {
            intents[name] = [...(storeOne[name] || []), ...(storeTwo[name] || [])];
        }

        return intents;
    }

    private wrapIntents(intents: Glue42Web.Intents.Intent[]): WrappedIntents {
        return {
            intents
        };
    }

    private async getIntents(commandId: string): Promise<Glue42Web.Intents.Intent[]> {
        /*
            Gathers all intents from:
            1. Application definitions
            2. Running instances (application can register dynamic intents by calling `addIntentListener()` that aren't predefined inside of their application definitions)
            It also populates intent handlers (actual entities that can handle the intent).
        */
        const apps: AppDefinitionWithIntents[] = this.sessionStorage.getAllApps().map((app) => {
            return {
                name: app.name,
                title: app.title || "",
                icon: app.icon,
                caption: app.caption,
                intents: app.userProperties.intents || []
            };
        });

        const appIntentsStore = this.extractAppIntents(apps);
        this.logger?.trace(`[${commandId}] got app intents`);

        const instanceIntentsStore = await this.getInstanceIntents(apps, commandId);
        this.logger?.trace(`[${commandId}] got instance intents`);

        const allIntentsStore = this.mergeIntentStores(appIntentsStore, instanceIntentsStore);

        const intents = Object.keys(allIntentsStore).map((name) => ({ name, handlers: allIntentsStore[name] }));

        return intents;
    }

    private async getWrappedIntents(commandId: string): Promise<WrappedIntents> {
        this.logger?.trace(`[${commandId}] handling getIntents command`);

        const intents = await this.getIntents(commandId);

        this.logger?.trace(`[${commandId}] getIntents command completed`);

        return this.wrapIntents(intents);
    }

    private async findIntent(wrappedIntentFilter: WrappedIntentFilter, commandId: string): Promise<WrappedIntents> {
        this.logger?.trace(`[${commandId}] handling findIntent command`);

        const intentFilter = wrappedIntentFilter.filter;

        let intents = await this.getIntents(commandId);

        if (!intentFilter) {
            return this.wrapIntents(intents);
        }

        if (typeof intentFilter === "string") {
            return this.wrapIntents(intents.filter((intent) => intent.name === intentFilter));
        }

        if (intentFilter.contextType) {
            const ctToLower = intentFilter.contextType.toLowerCase();
            intents = intents.filter((intent) => intent.handlers.some((handler) => handler.contextTypes?.some((ct) => ct.toLowerCase() === ctToLower)));
        }

        if (intentFilter.name) {
            intents = intents.filter((intent) => intent.name === intentFilter.name);
        }

        this.logger?.trace(`[${commandId}] findIntent command completed`);

        return this.wrapIntents(intents);
    }

    private async getIntent(intent: string, commandId: string): Promise<Glue42Web.Intents.Intent | undefined> {
        return (await this.getIntents(commandId)).find((registeredIntent) => registeredIntent.name === intent);
    }

    private async startApp(config: ApplicationStartConfig, commandId: string): Promise<string> {
        const instance = await this.ioc.applicationsController.handleApplicationStart(config, commandId);

        return instance.id;
    }

    private async waitForServer(instanceId: string): Promise<Glue42Web.Interop.Instance> {
        let unsub: () => void;

        const executor = (resolve: (value: Glue42Web.Interop.Instance) => void): void => {
            unsub = this.glueController.subscribeForServerAdded((server) => {
                if (server.windowId === instanceId || server.instance === instanceId) {
                    resolve(server);
                }
            });
        };
        return PromisePlus(executor, 30 * 1000, `Can not find interop server for instance ${instanceId}`).finally(() => unsub());
    }

    private async waitForMethod(methodName: string, instanceId: string): Promise<Glue42Web.Interop.MethodDefinition> {
        let unsub: () => void;

        const executor = (resolve: (value: Glue42Web.Interop.MethodDefinition) => void): void => {
            unsub = this.glueController.subscribeForMethodAdded((addedMethod) => {
                if (addedMethod.name === methodName) {
                    resolve(addedMethod);
                }
            });
        };
        return PromisePlus(executor, 10 * 1000, `Can not find interop method ${methodName} for instance ${instanceId}`).finally(() => unsub());
    }

    private instanceIdToInteropInstance(instanceId: string): string | undefined {
        const servers = this.glueController.getServers();

        return servers.find((server) => server.windowId === instanceId || server.instance === instanceId)?.instance;
    }

    private async raiseIntentToInstance(instanceId: string, intent: string, context?: Glue42Web.Intents.IntentContext): Promise<any> {
        const methodName = `${GlueWebIntentsPrefix}${intent}`;
        let interopServer = this.glueController.getServers().find((server) => server.windowId === instanceId || server.instance === instanceId);
        if (!interopServer) {
            interopServer = await this.waitForServer(instanceId);
        }

        const method = interopServer.getMethods?.().find((registeredMethod) => registeredMethod.name === methodName);
        if (!method) {
            await this.waitForMethod(methodName, instanceId);
        }

        const result = await this.glueController.invokeMethod<any>(methodName, context, { instance: this.instanceIdToInteropInstance(instanceId) });

        return result.returned;
    }

    private async raiseIntent(intentRequest: Glue42Web.Intents.IntentRequest, commandId: string): Promise<Glue42Web.Intents.IntentResult> {
        this.logger?.trace(`[${commandId}] handling raiseIntent command`);

        const intentName = intentRequest.intent;
        const intentDef = await this.getIntent(intentName, commandId);

        if (!intentDef) {
            throw new Error(`Intent ${intentName} not found!`);
        }

        const isDynamicIntent = !intentDef.handlers.some((intentDefHandler) => intentDefHandler.type === "app");

        // Default to "reuse" in the case of a dynamic intent and to "startNew" if target isn't provided.
        const target = intentRequest.target || (isDynamicIntent ? "reuse" : "startNew");
        // The handler that will execute the intent.
        let handler: Glue42Web.Intents.IntentHandler | undefined;
        const anAppHandler = intentDef.handlers.find((intentHandler) => intentHandler.type === "app");
        if (target === "startNew") {
            handler = anAppHandler;
        } else if (target === "reuse") {
            const anInstanceHandler = intentDef.handlers.find((intentHandler) => intentHandler.type === "instance");
            handler = anInstanceHandler || anAppHandler;
        } else if (target.instance) {
            handler = intentDef.handlers.find((intentHandler) => intentHandler.type === "instance" && intentHandler.instanceId === target.instance);
        } else if (target.app) {
            handler = intentDef.handlers.find((intentHandler) => intentHandler.type === "app" && intentHandler.applicationName === target.app);
        } else {
            throw new Error(`Invalid intent target: ${JSON.stringify(target)}`);
        }

        if (!handler) {
            throw new Error(`Can not raise intent for request ${JSON.stringify(intentRequest)} - can not find intent handler!`);
        }

        handler.instanceId;

        if (handler.type === "app") {
            handler.instanceId = await this.startApp({ name: handler.applicationName, ...intentRequest.options }, commandId);
        }

        if (!handler.instanceId) {
            throw new Error(`Can not raise intent for request ${JSON.stringify(intentRequest)} - handler is missing instanceId!`);
        }

        const result = await this.raiseIntentToInstance(handler.instanceId, intentName, intentRequest.context);

        this.logger?.trace(`[${commandId}] raiseIntent command completed`);

        return {
            request: intentRequest,
            handler,
            result
        };
    }
}
