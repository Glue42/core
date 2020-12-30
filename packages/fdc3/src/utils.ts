import { Listener } from "@finos/fdc3";
import { Glue42 } from "@glue42/desktop";
import { WindowType } from "./types/windowtype";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const newSubscribe = (id: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void> => {
    let didReplay = false;

    return (window as WindowType).glue.contexts.subscribe(id, (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => {
        if (!didReplay) {
            didReplay = true;
            return;
        }

        const updateFromMe = extraData.updaterId === (window as WindowType).glue.interop.instance.instance;

        if (!updateFromMe) {
            callback(data, delta, removed, unsubscribe, extraData);
        }
    });
};

/**
 * Returns a list of all channel contexts. We are not using `glue.channels.list()` so that @glue42/fdc3 can be used with older versions of the Glue42 JS SDK.
 */
export const getChannelsList = async (): Promise<Array<Glue42.ChannelContext>> => {
    const channelNames = await (window as WindowType).glue.channels.all();
    const channelContents: Array<Glue42.Channels.ChannelContext> = await Promise.all(channelNames.map((name: string) => (window as WindowType).glue.channels.get(name)));

    return channelContents;
};

export const waitFor = <T>(predicate: () => boolean, retryMs: number, resolution?: () => T): Promise<T> => {
    return new Promise((resolve) => {
        const resolvePromise: () => void = () => {
            if (typeof resolution !== "undefined") {
                resolve(resolution());
            } else {
                resolve();
            }
        };

        if (predicate()) {
            resolvePromise();
        } else {
            let interval: any;

            const callback = (): void => {
                if (predicate()) {
                    clearInterval(interval);

                    resolvePromise();
                }
            };

            interval = setInterval(callback, retryMs);
        }
    });
};

export const fetchTimeout = (url: string, timeoutMilliseconds = 3000): Promise<Response> => {
    return new Promise((resolve, reject) => {
        let timeoutHit = false;
        const timeout = setTimeout(() => {
            timeoutHit = true;
            reject(new Error(`Fetch request for: ${url} timed out at: ${timeoutMilliseconds} milliseconds`));
        }, timeoutMilliseconds);

        fetch(url)
            .then((response) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    resolve(response);
                }
            })
            .catch((err) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });
    });
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const isGlue42Core = !navigator.userAgent.toLowerCase().includes(" electron/");

export const AsyncListener = (actualUnsub:
    (() => void)
    | Promise<() => void>
): Listener => {
    return {
        unsubscribe(): void {
            if (!actualUnsub) {
                console.error("Failed to unsubscribe!");
                return;
            }

            if (typeof actualUnsub === "function") {
                actualUnsub();
            } else {
                (actualUnsub as Promise<() => void>).then((unsubFunc: () => void) => unsubFunc());
            }
        }
    };
};
