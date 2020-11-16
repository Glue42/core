import {
    AppIntent,
    Context,
    DesktopAgent,
    IntentResolution,
    Listener,
    OpenError,
    ResolveError
} from "@finos/fdc3";
import { Glue42 } from "@glue42/desktop";
import createChannelsAgent from "./channels/channels";
import { WindowType } from "./types/windowtype";

const convertGlue42IntentToFDC3AppIntent = (glueIntent: Glue42.Intents.Intent): AppIntent => {
    const { name, handlers } = glueIntent;
    const appIntents = handlers.filter((handler) => handler.type === "app");
    const dynamicInstanceIntents = handlers.filter((handler) => handler.type === "instance" && !appIntents.some((appIntent) => appIntent.applicationName === handler.applicationName));
    // Ignore instance handlers that aren't dynamic.
    const handlersToUse = [...appIntents, ...dynamicInstanceIntents];

    const appIntent: AppIntent = {
        // Issue with the FDC3 specification: there are multiple displayNames.
        intent: { name, displayName: handlers[0].displayName || "" },
        apps: handlersToUse.map((handler) => {
            const appName = handler.applicationName;
            const app = (window as WindowType).glue.appManager.application(appName);

            return {
                name: appName,
                title: handler.applicationTitle || handler.instanceTitle || appName,
                tooltip: app?.userProperties.tooltip || `${appName} (${handler.type})`,
                description: handler.applicationDescription,
                icons: handler.applicationIcon ? [handler.applicationIcon, ...(app?.userProperties.icons || [])] : app?.userProperties.icons,
                images: app?.userProperties.images
            };
        })
    };

    return appIntent;
};

const createIntentsAgent = (): Partial<DesktopAgent> => {
    const open = async (name: string, context?: Context): Promise<void> => {
        const app = (window as WindowType).glue.appManager.application(name);
        if (typeof app === "undefined") {
            throw new Error(OpenError.AppNotFound);
        }

        try {
            await app.start(context);
        } catch (error) {
            // `start()` is expected to reject as the started application needs to pass in application name to `GlueWeb()`
        }
    };

    const findIntent = async (intent: string, context?: Context): Promise<AppIntent> => {
        if (typeof intent !== "string") {
            throw new Error("Please provide the intent as a string!");
        }
        if (typeof context !== "undefined" && typeof context.type !== "string") {
            throw new Error("Please provide the context.type as a string!");
        }

        const glueIntents = await (window as WindowType).glue.intents.find({ name: intent, contextType: context?.type });

        if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
            throw new Error(ResolveError.NoAppsFound);
        }

        // We will receive only one intent as they are grouped by name.
        return convertGlue42IntentToFDC3AppIntent(glueIntents[0]);
    };

    const findIntentsByContext = async (context: Context): Promise<AppIntent[]> => {
        if (typeof context !== "undefined" && typeof context.type !== "string") {
            throw new Error("Please provide the context.type as a string!");
        }

        const glueIntents = await (window as WindowType).glue.intents.find({ contextType: context.type });

        if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
            throw new Error(ResolveError.NoAppsFound);
        }

        return glueIntents.map((glueIntent) => convertGlue42IntentToFDC3AppIntent(glueIntent));
    };

    const raiseIntent = async (intent: string, context: Context, target?: string): Promise<IntentResolution> => {
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
                throw new Error(OpenError.AppNotFound);
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

    const addIntentListener = (intent: string, handler: (context: Context) => void): Listener => {
        if (typeof intent !== "string") {
            throw new Error("Please provide the intent as a string!");
        }
        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }
        const unsub = {
            unsubscribe: (): void => console.error("Failed to unsubscribe!")
        };

        (window as WindowType).fdc3GluePromise.then(() => {
            unsub.unsubscribe = (window as WindowType).glue.intents.addIntentListener(intent, handler as (context: object) => void).unsubscribe;
        });

        return unsub;
    };

    return {
        open: async (...props): Promise<void> => {
            await (window as WindowType).fdc3GluePromise;
            return open(...props);
        },
        findIntent: async (...props): Promise<AppIntent> => {
            await (window as WindowType).fdc3GluePromise;
            return findIntent(...props);
        },
        findIntentsByContext: async (...props): Promise<AppIntent[]> => {
            await (window as WindowType).fdc3GluePromise;
            return findIntentsByContext(...props);
        },
        raiseIntent: async (...props): Promise<IntentResolution> => {
            await (window as WindowType).fdc3GluePromise;
            return raiseIntent(...props);
        },
        addIntentListener
    };
};

const createDesktopAgent = (): DesktopAgent => {
    const intentsAgent = createIntentsAgent();
    const channelsAgent = createChannelsAgent();

    return {
        ...intentsAgent,
        ...channelsAgent
    } as DesktopAgent;
};

export default createDesktopAgent;
