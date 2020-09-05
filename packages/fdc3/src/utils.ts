import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { WindowType } from "./windowtype";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const decorateContextApi = (glue: Glue42.Glue | Glue42Web.API): Glue42.Glue | Glue42Web.API => {
    const newGlue = { ...glue, contexts: { ...glue.contexts } };

    newGlue.contexts.subscribe = (name: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void> => {
        let didReplay = false;
        return newGlue.contexts.subscribe(name, (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => {
            if (!didReplay) {
                didReplay = true;
                return;
            }

            const updateFromMe = extraData.updaterId === glue.interop.instance.instance;

            if (!updateFromMe) {
                callback(data, delta, removed, unsubscribe, extraData);
            }
        });
    };

    return newGlue as Glue42.Glue | Glue42Web.API;
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
