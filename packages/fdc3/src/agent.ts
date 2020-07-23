import { FDC3 } from "../types";
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import createChannelsApi from "./channels/channels";
import { isGlue42Core } from "./utils";
import { WindowType } from "./windowtype";

const GLUE42_CORE_FDC3_INTENTS_METHOD_PREFIX = "Tick42.FDC3.Intents.";

const convertGlue42IntentToFDC3AppIntent = (glueIntent: Glue42.Intents.Intent): FDC3.AppIntent => {
    const { name, handlers } = glueIntent;

    const appIntent: FDC3.AppIntent = {
        intent: { name, displayName: handlers[0].displayName },
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

const getGlue42CoreIntents = async (): Promise<{ intent: FDC3.Intent | undefined; apps: Glue42Web.AppManager.Application[] }[]> => {
    const apps = await ((window as WindowType).glue as Glue42Web.API).appManager.applications();
    const appIntents: { intent: FDC3.Intent; app: Glue42Web.AppManager.Application }[] = apps.flatMap((app: Glue42Web.AppManager.Application) => {
        return (app.userProperties.intents.map((intent: FDC3.Intent) => {
            return {
                intent,
                app: {
                    name: app.name,
                    title: app.title,
                    tooltip: app.userProperties.tooltip,
                    description: app.userProperties.description,
                    icons: app.userProperties.icons,
                    images: app.userProperties.images
                }
            };
        }) || []);
    });
    const intentNames = Array.from(new Set(appIntents.map((appIntent) => {
        return appIntent.intent.name;
    })));
    const intents = intentNames.map((intentName) => {
        return {
            intent: appIntents.find((appIntent) => {
                return appIntent.intent.name === intentName;
            })?.intent,
            apps: [...appIntents.filter((appIntent) => {
                return appIntent.intent.name === intentName;
            }).map((appIntent) => {
                return appIntent.app;
            })]
        };
    });

    return intents;
};

const getGlue42CoreIntentsByContext = async (context: FDC3.Context): Promise<{ intent: FDC3.Intent; app: Glue42Web.AppManager.Application }[]> => {
    const apps = await ((window as WindowType).glue as Glue42Web.API).appManager.applications();
    const appIntents: { intent: FDC3.Intent; app: Glue42Web.AppManager.Application }[] = apps.flatMap((app: Glue42Web.AppManager.Application) => {
        return (app.userProperties.intents.map((intent: FDC3.Intent) => {
            return {
                intent,
                app: {
                    name: app.name,
                    title: app.title,
                    tooltip: app.userProperties.tooltip,
                    description: app.userProperties.description,
                    icons: app.userProperties.icons,
                    images: app.userProperties.images
                }
            };
        }) || []);
    });

    const appIntentsForContext = appIntents.filter((appIntent) => {
        return appIntent.intent.contexts?.includes(context.type);
    });

    return appIntentsForContext;
};

const startAppAndWaitForIntentMethod = async (app: Glue42.AppManager.Application | Glue42Web.AppManager.Application, intent: string): Promise<Glue42Web.Interop.Instance> => {
    try {
        await app.start();
    } catch (error) {
        // `start()` is expected to reject as the started application needs to pass in application name to `GlueWeb()`
    }

    // Wait for the newly started application to call addIntentListener.
    const methodAddedPromise = new Promise<Glue42Web.Interop.Instance>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(`Raise intent ${intent} target ${app.name} application did not call addIntentListener after being started.`);
        }, 3000);

        const unsub = (window as WindowType).glue.interop.serverMethodAdded((info) => {
            if (info.method.name === `${GLUE42_CORE_FDC3_INTENTS_METHOD_PREFIX}${intent}`) {
                clearTimeout(timeout);
                unsub();
                resolve(info.server);
            }
        });
    });

    return methodAddedPromise;
};

const createCoreDesktopAgent = (): Partial<FDC3.DesktopAgent> => {
    const open = async (name: string, context?: FDC3.Context): Promise<void> => {
        const app = (window as WindowType).glue.appManager.application(name);
        if (!app) {
            throw new Error(FDC3.OpenError.AppNotFound);
        }

        try {
            await app?.start(context);
        } catch (e) {
            throw new Error(FDC3.OpenError.ErrorOnLaunch);
        }
    };

    return {
        open: async (...props): Promise<void> => {
            await (window as WindowType).gluePromise;
            return open(...props);
        }
    };
};

const createGlue42CoreDesktopAgent = (): Partial<FDC3.DesktopAgent> => {
    const findIntent = async (intent: string, context?: FDC3.Context): Promise<FDC3.AppIntent> => {
        const glueIntents = await getGlue42CoreIntents();

        const foundIntent = glueIntents.find((glueIntent) => {
            if (context) {
                return glueIntent.intent?.name === intent && glueIntent.intent.contexts?.includes(context.type);
            } else {
                return glueIntent.intent?.name === intent;
            }
        });

        if (!foundIntent) {
            throw new Error(FDC3.ResolveError.NoAppsFound);
        }

        return foundIntent as FDC3.AppIntent;
    };

    const findIntentsByContext = async (context: FDC3.Context): Promise<FDC3.AppIntent[]> => {
        if (!context.type) {
            throw new Error("Only filtering by context.type is supported.");
        }

        const intents = await getGlue42CoreIntentsByContext(context);

        return intents.map((intent) => ({
            intent: intent.intent,
            apps: [intent.app]
        })) as FDC3.AppIntent[];
    };

    const raiseIntent = async (intent: string, context: FDC3.Context, target?: string): Promise<FDC3.IntentResolution> => {
        let instancesToTarget;
        let invocationResult;
        const methodName = `${GLUE42_CORE_FDC3_INTENTS_METHOD_PREFIX}${intent}`;

        if (target) {
            const appTarget = ((window as WindowType).glue as Glue42Web.API).appManager.application(target);

            if (!appTarget) {
                throw new Error(FDC3.OpenError.AppNotFound);
            }

            instancesToTarget = ((window as WindowType).glue as Glue42Web.API).appManager.instances().filter((appInstance) => {
                return appInstance.application.name === target;
            }).map((appInstance) => {
                return appInstance.agm;
            });

            if (instancesToTarget.length === 0) {
                instancesToTarget = [await startAppAndWaitForIntentMethod(appTarget, intent)];
            }
        } else {
            const methods = (window as WindowType).glue.interop.methods().filter((method) => {
                return method.name === methodName;
            });

            instancesToTarget = methods[0]?.getServers();

            if (!instancesToTarget || instancesToTarget.length === 0) {
                const appTarget = ((window as WindowType).glue as Glue42Web.API).appManager.applications().find((application) => {
                    return application.userProperties.intents?.some((appIntent: FDC3.Intent) => {
                        return appIntent.name === intent;
                    });
                });

                if (!appTarget) {
                    throw new Error(FDC3.OpenError.AppNotFound);
                }

                instancesToTarget = [await startAppAndWaitForIntentMethod(appTarget, intent)];
            }
        }

        invocationResult = (await (window as WindowType).glue.interop.invoke(methodName, context, instancesToTarget[0] || "best")).all_return_values;

        if (invocationResult) {
            return {
                source: invocationResult[0].executed_by?.applicationName || "unknown",
                version: "1.0.0",
                data: invocationResult[0].returned
            };
        } else {
            return {
                source: "unknown",
                version: "1.0.0"
            };
        }
    };

    const addIntentListener = (intent: string, handler: (context: FDC3.Context) => void): FDC3.Listener => {
        let unsub: () => void;
        let initialContext: FDC3.Context;

        const methodName = `${GLUE42_CORE_FDC3_INTENTS_METHOD_PREFIX}${intent}`;

        (window as WindowType).gluePromise
            .then(() => {
                return (window as WindowType).glue.windows.my().getContext();
            })
            .then((glueContext) => {
                initialContext = glueContext?.intentContext;

                return (window as WindowType).glue.interop.register(methodName, handler);
            }).then(() => {
                unsub = (): void => (window as WindowType).glue.interop.unregister(methodName);

                if (initialContext) {
                    handler(initialContext);
                }
            });

        return {
            unsubscribe: (): void => unsub()
        };
    };

    return {
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

const createGlue42EnterpriseDesktopAgent = (): Partial<FDC3.DesktopAgent> => {
    const findIntent = async (intent: string, context?: FDC3.Context): Promise<FDC3.AppIntent> => {
        const glueIntent = await ((window as WindowType).glue as Glue42.Glue).intents.find({ name: intent, contextType: context?.type });

        if (!glueIntent) {
            throw new Error(FDC3.ResolveError.NoAppsFound);
        }

        return convertGlue42IntentToFDC3AppIntent(glueIntent);
    };


    const findIntentsByContext = async (context: FDC3.Context): Promise<FDC3.AppIntent[]> => {
        if (!context.type) {
            throw new Error("Only filtering by context.type is supported.");
        }
        const glueIntents = await ((window as WindowType).glue as Glue42.Glue).intents.findByContext(context.type);

        if (!glueIntents || glueIntents.length === 0) {
            throw new Error(FDC3.ResolveError.NoAppsFound);
        }

        return glueIntents.map((gIntent) => convertGlue42IntentToFDC3AppIntent(gIntent));
    };


    const raiseIntent = async (intent: string, context: FDC3.Context, target?: string): Promise<FDC3.IntentResolution> => {
        const glueIntentResult = await ((window as WindowType).glue as Glue42.Glue).intents.raise({ intent, context, target });

        if (!glueIntentResult) {
            throw new Error(`No intent resolution for ${intent}, context: ${JSON.stringify(context)}, target: ${target}`);
        }

        return {
            source: glueIntentResult.applicationInstance,
            version: "1.0.0"
        };
    };


    const addIntentListener = (intent: string, handler: (context: FDC3.Context) => void): FDC3.Listener => {
        let unsub: () => void;
        let initialContext: FDC3.Context;

        (window as WindowType).gluePromise
            .then(() => {
                return (window as WindowType).glue.windows.my().getContext();
            })
            .then((glueContext) => {
                initialContext = glueContext?.intentContext;

                // Fixed in @glue42/desktop@5.2.0.
                unsub = ((window as WindowType).glue as Glue42.Glue).intents.addIntentListener(intent, handler as (context: object) => void) as unknown as () => {};

                if (initialContext) {
                    handler(initialContext);
                }
            });

        return {
            unsubscribe: (): void => unsub()
        };
    };

    return {
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
    const coreDesktopAgent = createCoreDesktopAgent();
    const desktopAgent = isGlue42Core ? createGlue42CoreDesktopAgent() : createGlue42EnterpriseDesktopAgent();
    const channelsAPI = createChannelsApi();

    return {
        ...coreDesktopAgent,
        ...desktopAgent,
        ...channelsAPI
    } as FDC3.DesktopAgent;
};

export default createDesktopAgent;
