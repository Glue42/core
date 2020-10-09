import { Glue42Web } from "../../web";
import { IntentInfo, AppDefinition } from "./types";
import { UnsubscribeFunction } from "callback-registry";
import { glue42CoreIntentFilterDecoder, glue42CoreIntentDefinitionDecoder, glue42CoreIntentRequestDecoder } from "../shared/decoders/intents";

const GLUE42_FDC3_INTENTS_METHOD_PREFIX = "Tick42.FDC3.Intents.";

export class Intents implements Glue42Web.Intents.API {
    constructor(private interop: Glue42Web.Interop.API, private windows: Glue42Web.Windows.API, private appManager: Glue42Web.AppManager.API) {
    }

    public async find(intentFilter?: string | Glue42Web.Intents.IntentFilter): Promise<Glue42Web.Intents.Intent[]> {
        glue42CoreIntentFilterDecoder.runWithException(intentFilter);

        let intents = await this.all();
        if (typeof intentFilter === "undefined") {
            return intents;
        }

        if (typeof intentFilter === "string") {
            return intents.filter((intent) => intent.name === intentFilter);
        }

        if (intentFilter.contextType) {
            const ctToLower = intentFilter.contextType.toLowerCase();
            intents = intents.filter((intent) => intent.handlers.some((handler) => handler.contextTypes?.some((ct) => ct.toLowerCase() === ctToLower)));
        }

        if (intentFilter.name) {
            intents = intents.filter((intent) => intent.name === intentFilter.name);
        }

        return intents;
    }

    public async raise(intent: string | Glue42Web.Intents.IntentRequest): Promise<Glue42Web.Intents.IntentResult> {
        glue42CoreIntentRequestDecoder.runWithException(intent);

        if (typeof intent === "string") {
            intent = {
                intent
            };
        }

        const intentName = intent.intent;
        const intentDef = await this.get(intentName);

        if (typeof intentDef === "undefined") {
            throw new Error(`Intent ${intentName} not found.`);
        }

        const isDynamicIntent = !intentDef.handlers.some((intentDefHandler) => intentDefHandler.type === "app");

        // Default to "reuse" in the case of a dynamic intent and to "startNew" if target isn't provided.
        const target = intent.target || (isDynamicIntent ? "reuse" : "startNew");
        // The handler that will execute the intent.
        let handler: Glue42Web.Intents.IntentHandler;
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
            throw new Error(`Can not raise intent for request ${JSON.stringify(intent)} - can not find intent handler.`);
        }

        let instanceId = handler.instanceId;
        if (handler.type === "app") {
            instanceId = await this.startApp(handler.applicationName, intent.options);
        }

        const result: Partial<Glue42Web.Intents.IntentResult> = await this.raiseIntentToInstance(instanceId, intentName, intent.context);
        result.request = intent;
        result.handler = handler;

        return result as Glue42Web.Intents.IntentResult;
    }

    public async all(): Promise<Glue42Web.Intents.Intent[]> {
        // Gathers all intents from:
        // 1. Application definitions
        // 2. Running instances (application can register dynamic intents by calling `addIntentListener()` that aren't predefined inside of their application definitions)
        // It also populates intent handlers (actual entities that can handle the intent).
        const apps: AppDefinition[] = this.appManager.applications().map((app: Glue42Web.AppManager.Application) => {
            return {
                name: app.name,
                title: app.title,
                icon: app.icon,
                caption: app.caption,
                intents: app.userProperties.intents
            };
        });
        const intents: { [key: string]: Glue42Web.Intents.Intent } = {};
        const appsWithIntents = apps.filter((app) => app.intents && app.intents.length > 0);
        //  Gather app handlers from application definitions.
        for (const app of appsWithIntents) {
            for (const intentDef of app.intents) {
                let intent = intents[intentDef.name];
                if (!intent) {
                    intent = {
                        name: intentDef.name,
                        handlers: [],
                    };
                    intents[intentDef.name] = intent;
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

                intent.handlers.push(handler);
            }
        }

        // Discover all running instances that provide intents, and add them to the corresponding intent.
        for (const server of this.interop.servers()) {
            await Promise.all(server.getMethods()
                .filter((method) => method.name.startsWith(GLUE42_FDC3_INTENTS_METHOD_PREFIX))
                .map(async (method) => {
                    const intentName = method.name.replace(GLUE42_FDC3_INTENTS_METHOD_PREFIX, "");
                    let intent = intents[intentName];
                    if (!intent) {
                        intent = {
                            name: intentName,
                            handlers: [],
                        };
                        intents[intentName] = intent;
                    }

                    let info: Glue42Web.Intents.AddIntentListenerRequest;
                    if (method.description) {
                        try {
                            info = JSON.parse(method.description);
                        } catch { /* DO NOTHING */ }
                    }

                    const app = apps.find((appDef) => appDef.name === server.application);
                    let appIntent: IntentInfo | undefined;
                    // app can be undefined in the case of a dynamic intent.
                    if (app && app.intents) {
                        appIntent = app.intents.find((appDefIntent) => appDefIntent.name === intentName);
                    }

                    const window = this.windows.findById(server.windowId);
                    const title = await window?.getTitle();
                    const handler: Glue42Web.Intents.IntentHandler = {
                        instanceId: server.instance,
                        applicationName: server.application,
                        applicationIcon: info?.icon || app?.icon,
                        applicationTitle: app?.title,
                        applicationDescription: info?.description || app?.caption,
                        displayName: info?.displayName || appIntent?.displayName,
                        contextTypes: info?.contextTypes || appIntent?.contexts,
                        instanceTitle: title,
                        type: "instance"
                    };
                    intent.handlers.push(handler);
                }));
        }

        return Object.values(intents);
    }

    public addIntentListener(intent: string | Glue42Web.Intents.AddIntentListenerRequest, handler: (context: Glue42Web.Intents.IntentContext) => any): { unsubscribe: UnsubscribeFunction } {
        glue42CoreIntentDefinitionDecoder.runWithException(intent);
        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }

        // `addIntentListener()` is sync.
        // tslint:disable-next-line:no-console
        const result: { unsubscribe: () => void } = { unsubscribe: () => console.log("Could not unsubscribe!") };
        const intentName = typeof intent === "string" ? intent : intent.intent;
        const methodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${intentName}`;
        const methodDescription = typeof intent === "string" ? undefined : JSON.stringify(intent);

        this.interop.register({ name: methodName, description: methodDescription }, (args: Glue42Web.Intents.IntentContext) => {
            return handler(args);
        }).then(() => {
            result.unsubscribe = () => {
                this.interop.unregister(methodName);
            };
        });

        return result;
    }

    private async get(intent: string): Promise<Glue42Web.Intents.Intent> {
        return (await this.all()).find((registeredIntent) => registeredIntent.name === intent);
    }

    private async startApp(application: string, options?: Glue42Web.AppManager.ApplicationStartOptions) {
        const instance = await this.appManager.application(application).start({}, options);

        return instance.id;
    }

    private async raiseIntentToInstance(instanceId: string, intent: string, context?: Glue42Web.Intents.IntentContext): Promise<{ result: any }> {
        const methodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${intent}`;
        let interopServer = this.interop.servers().find((server) => server.instance === instanceId);
        if (!interopServer) {
            // Wait 30 sec for the server to appear.
            await (new Promise((resolve, reject) => {
                let timeoutId: any;

                const unsub = this.interop.serverAdded((server) => {
                    if (server.instance === instanceId) {
                        interopServer = server;
                        resolve();
                        clearTimeout(timeoutId);
                        unsub();
                    }
                });

                timeoutId = setTimeout(() => {
                    unsub();
                    reject(new Error(`Can not find interop server for instance ${instanceId}`));
                }, 30 * 1000);
            }));
        }

        const method = interopServer.getMethods().find((registeredMethod) => registeredMethod.name === methodName);
        if (!method) {
            // Wait 10 sec for the method to appear.
            await (new Promise((resolve, reject) => {
                let timeoutId: any;

                const unsub = this.interop.methodAdded((addedMethod) => {
                    if (addedMethod.name === methodName) {
                        resolve();
                        clearTimeout(timeoutId);
                        unsub();
                    }
                });

                timeoutId = setTimeout(() => {
                    unsub();
                    reject(new Error(`Can not find interop method ${methodName} for instance ${instanceId}`));
                }, 10 * 1000);
            }));
        }

        const result = await this.interop.invoke(methodName, context, { instance: instanceId });

        return {
            result: result.returned
        };
    }
}
