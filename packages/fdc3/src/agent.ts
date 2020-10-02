import { FDC3 } from "../types";
import { Glue42 } from "@glue42/desktop";
import createChannelsAgent from "./channels/channels";
import { WindowType } from "./windowtype";

const convertGlue42IntentToFDC3AppIntent = (glueIntent: Glue42.Intents.Intent): FDC3.AppIntent => {
    const { name, handlers } = glueIntent;

    const appIntent: FDC3.AppIntent = {
        // Issue with the FDC3 specification: there are multiple displayNames.
        intent: { name, displayName: handlers[0].displayName || "" },
        apps: glueIntent.handlers.map((handler) => {
            const app = (window as WindowType).glue.appManager.application(handler.applicationName);

            return {
                name: app.name,
                title: app.title,
                tooltip: app.userProperties.tooltip,
                description: app.userProperties.description,
                icons: app.userProperties.icons,
                images: app.userProperties.images
            };
        })
    };

    return appIntent;
};

const createIntentsAgent = (): Partial<FDC3.DesktopAgent> => {
    const open = async (name: string, context?: FDC3.Context): Promise<void> => {
        const app = (window as WindowType).glue.appManager.application(name);
        if (!app) {
            throw new Error(FDC3.OpenError.AppNotFound);
        }

        try {
            await app.start(context);
        } catch (error) {
            // `start()` is expected to reject as the started application needs to pass in application name to `GlueWeb()`
        }
    };

    const findIntent = async (intent: string, context?: FDC3.Context): Promise<FDC3.AppIntent> => {
        if (typeof intent !== "string") {
            throw new Error("Please provide the intent as a string!");
        }
        if (typeof context !== "undefined" && typeof context.type !== "string") {
            throw new Error("Please provide the context.type as a string!");
        }

        const glueIntents = await (window as WindowType).glue.intents.find({ name: intent, contextType: context?.type });

        if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
            throw new Error(FDC3.ResolveError.NoAppsFound);
        }

        // We will receive only one intent as they are grouped by name.
        return convertGlue42IntentToFDC3AppIntent(glueIntents[0]);
    };

    const findIntentsByContext = async (context: FDC3.Context): Promise<FDC3.AppIntent[]> => {
        if (typeof context !== "undefined" && typeof context.type !== "string") {
            throw new Error("Please provide the context.type as a string!");
        }

        const glueIntents = await (window as WindowType).glue.intents.find({ contextType: context.type });

        if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
            throw new Error(FDC3.ResolveError.NoAppsFound);
        }

        return glueIntents.map((glueIntent) => convertGlue42IntentToFDC3AppIntent(glueIntent));
    };

    const raiseIntent = async (intent: string, context: FDC3.Context, target?: string): Promise<FDC3.IntentResolution> => {
        if (typeof intent !== "string") {
            throw new Error("Please provide the intent as a string!");
        }
        if (typeof context !== "undefined" && typeof context.type !== "string") {
            throw new Error("Please provide the context.type as a string!");
        }
        if (typeof target !== "undefined" && typeof target !== "string") {
            throw new Error("Please provide the target as a string!");
        }

        // target not provided => reuse (@glue42/web takes care of starting a new instance if there isn't a running one)
        // target provided; no running instance => target app
        // target provided; there is a running instance => target instance
        let glueTarget: "startNew" | "reuse" | { app?: string; instance?: string } = "reuse";
        if (typeof target !== "undefined") {
            const app = (window as WindowType).glue.appManager.application(target);
            if (typeof app === "undefined") {
                throw new Error(`Application ${target} not found.`);
            }
            const appInstances = app.instances;
            if (appInstances.length === 0) {
                glueTarget = { app: target };
            } else {
                // Issue with the FDC3 specification: there is no instance targeting.
                glueTarget = { instance: appInstances[0].id };
            }
        }

        const glueIntentResult = await (window as WindowType).glue.intents.raise({ intent, context, target: glueTarget });

        return {
            source: glueIntentResult.handler.applicationName,
            version: "1.0.0",
            data: glueIntentResult.result
        };
    };

    const addIntentListener = (intent: string, handler: (context: FDC3.Context) => void): FDC3.Listener => {
        if (typeof intent !== "string") {
            throw new Error("Please provide the intent as a string!");
        }
        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }
        const unsub = {
            unsubscribe: () => console.error("Could not unsubscribe!")
        };

        (window as WindowType).gluePromise.then(() => {
            unsub.unsubscribe = (window as WindowType).glue.intents.addIntentListener(intent, handler as (context: object) => void).unsubscribe;
        });

        return unsub;
    };

    return {
        open: async (...props): Promise<void> => {
            await (window as WindowType).gluePromise;
            return open(...props);
        },
        findIntent: async (...props): Promise<FDC3.AppIntent> => {
            await (window as WindowType).gluePromise;
            return findIntent(...props);
        },
        findIntentsByContext: async (...props): Promise<FDC3.AppIntent[]> => {
            await (window as WindowType).gluePromise;
            return findIntentsByContext(...props);
        },
        raiseIntent: async (...props): Promise<FDC3.IntentResolution> => {
            await (window as WindowType).gluePromise;
            return raiseIntent(...props);
        },
        addIntentListener
    };
};

const createDesktopAgent = (): FDC3.DesktopAgent => {
    const intentsAgent = createIntentsAgent();
    const channelsAgent = createChannelsAgent();

    return {
        ...intentsAgent,
        ...channelsAgent
    } as FDC3.DesktopAgent;
};

export default createDesktopAgent;
