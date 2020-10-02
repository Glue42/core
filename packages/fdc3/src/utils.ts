import { FDC3 } from "../types";
import { Glue42 } from "@glue42/desktop";
import { WindowType } from "./windowtype";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const newSubscribe = (id: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void) => {
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
export const getChannelsList = async () => {
    const channelNames = await (window as WindowType).glue.channels.all();
    const channelContents: Array<Glue42.Channels.ChannelContext> =
        await Promise.all(channelNames.map((name: string) => (window as WindowType).glue.channels.get(name)));

    return channelContents;
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const isGlue42Core = !navigator.userAgent.toLowerCase().includes(" electron/");

export const Listener = (actualUnsub:
    (() => void)
    | Promise<() => void>
): FDC3.Listener => {
    return {
        unsubscribe(): void {
            if (!actualUnsub) {
                console.error("Could not unsubscribe!");
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
