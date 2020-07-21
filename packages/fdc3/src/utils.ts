import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const decorateContextApi = (glue: Glue42.Glue | Glue42Web.API): Glue42.Glue | Glue42Web.API => {
    const agmInstance = glue.interop.instance.instance;

    const decoratedContext: Glue42.Contexts.API = {
        subscribe: (name: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void> => {
            let didReplay = false;
            return glue.contexts.subscribe(name, (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => {
                if (!didReplay) {
                    didReplay = true;
                    return;
                }

                const updateFromMe = extraData.updaterId === agmInstance;

                if (!updateFromMe) {
                    callback(data, delta, removed, unsubscribe, extraData);
                }
            });
        },
        get(name: string, resolveImmediately?: boolean): Promise<any> {
            return glue.contexts.get(name, resolveImmediately);
        },
        update: (name: string, data: any): Promise<void> => {
            return glue.contexts.update(name, data);
        },
        set: (name: string, data: any): Promise<void> => {
            return glue.contexts.set(name, data);
        },
        all(): string[] {
            return glue.contexts.all();
        },
    };

    return {
        ...glue,
        contexts: decoratedContext
    };
};

export const isGlue42Core = !navigator.userAgent.toLowerCase().includes(" electron/");
