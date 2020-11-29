import { Glue42 } from "@glue42/desktop";
import { SystemChannel, AppChannel } from "./channel";
import { WindowType } from "../types/windowtype";
import {
    getChannelsList,
    isGlue42Core,
    newSubscribe,
    isEmptyObject,
    AsyncListener
} from "../utils";
import { Channel, ChannelError, Context, Listener } from "@finos/fdc3";
import { ChannelsAPI } from "../types/channelsAPI";

interface PendingSubscription {
    contextType: string;
    handler: (context: Context) => void;
    setActualUnsub: (actualUnsub: () => void) => void;
}

const createChannelsAgent = (): ChannelsAPI => {
    let currentChannel: Channel | null;
    let pendingSubscription: PendingSubscription | null;

    const channels: { [name: string]: Channel } = {};

    let systemChannels: string[] = [];

    const initDone = (window as WindowType).fdc3GluePromise.then(() => {
        const current = (window as WindowType).glue.channels.current();

        // In Glue42 Core the channel selector widget needs to use the FDC3 Channels API instead of the Glue42 Channels API to navigate between the channels.
        if (!isGlue42Core) {
            if (typeof current !== "undefined") {
                handleSwitchChannelUI(current);
            }

            (window as WindowType).glue.channels.changed((channelId: string) => {
                handleSwitchChannelUI(channelId);
            });
        }

        const setChannelsPromise = getChannelsList().then((channelContents) => {
            channelContents.map((channelContext) => {
                channels[channelContext.name] = mapToFDC3SystemChannel(channelContext);
            });

        });

        const setSystemChannelsPromise = (window as WindowType).glue.channels.all().then((channels) => {
            systemChannels = channels;
        });

        return Promise.all([setChannelsPromise, setSystemChannelsPromise]);
    });

    const doesAppChannelExist = async (name: string): Promise<boolean> => {
        const exists = (await (window as WindowType).glue.contexts.all())
            .some((ctxName) => ctxName === name);

        return exists;
    };

    const createNewAppChannel = async (channelId: string): Promise<void> => {
        await (window as WindowType).glue.contexts.set(channelId, null);
    };

    const isSystem = (channel: Channel | null): boolean => {
        if (!channel) {
            return false;
        }
        return systemChannels.some((n) => n === channel.id);
    };

    const mapToFDC3SystemChannel = (glueChannel: Glue42.Channels.ChannelContext): Channel => {
        return new SystemChannel(glueChannel);
    };

    const mapToFDC3AppChannel = (channelName: string): Channel => {
        return new AppChannel(channelName);
    };

    const handleSwitchChannelUI = async (channelId: string): Promise<void> => {
        await initDone;

        if (typeof channelId !== "undefined") {
            setCurrentChannel(channels[channelId]);
        }
    };

    const createPendingListener = (contextType: string, handler: (context: Context) => void): Listener => {
        let unsubscribe = (): void => { pendingSubscription = null; };

        const setActualUnsub = (actualUnsub: () => void): void => { unsubscribe = actualUnsub; };

        // Used inside of setCurrentChannel.
        pendingSubscription = { contextType, handler, setActualUnsub };

        return {
            unsubscribe
        };
    };

    const getSystemChannels = async (): Promise<Channel[]> => {
        await initDone;

        const systemChannelImpls = systemChannels.map((id) => channels[id]);

        return systemChannelImpls;
    };

    const getOrCreateAppChannel = async (channelId: string): Promise<Channel> => {
        await initDone;

        const exists = await doesAppChannelExist(channelId);

        if (!exists) {
            await createNewAppChannel(channelId);
        }

        return mapToFDC3AppChannel(channelId);
    };

    const getOrCreateChannel = async (channelId: string): Promise<Channel> => {
        const systemChannels = await getSystemChannels();
        const channel = systemChannels.find((systemChannel) => systemChannel.id === channelId);

        if (typeof channel === "undefined") {
            return getOrCreateAppChannel(channelId);
        } else {
            return channel;
        }
    };

    const tryLeaveSystem = async (): Promise<void> => {
        if (isSystem(currentChannel)) {
            await (currentChannel as SystemChannel).leave();
        }
    };

    const tryGetAppChannel = async (channelId: string): Promise<Channel> => {
        await initDone;

        const exists = await doesAppChannelExist(channelId);

        if (!exists) {
            throw new Error(ChannelError.NoChannelFound);
        }

        const appChannel = mapToFDC3AppChannel(channelId);
        channels[channelId] = appChannel;

        return appChannel;
    };

    const joinChannel = async (channelId: string): Promise<void> => {
        await initDone;

        const channel: Channel = channels[channelId]
            || await tryGetAppChannel(channelId);

        if (!channel) {
            throw new Error(ChannelError.NoChannelFound);
        }

        if (isSystem(channel)) {
            (channel as SystemChannel).join();
        } else {
            await tryLeaveSystem();
        }

        setCurrentChannel(channel);
    };

    const getCurrentChannel = async (): Promise<Channel> => {
        await initDone;

        return currentChannel as Channel;
    };

    const leaveCurrentChannel = async (): Promise<void> => {
        await initDone;

        await tryLeaveSystem();

        currentChannel = null;
    };

    const broadcast = async (context: Context): Promise<void> => {
        await initDone;

        if (!currentChannel) {
            console.error("You need to join a channel in order to broadcast.");
            return;
        }

        const { id, type } = currentChannel;
        (type === "system")
            ? (window as WindowType).glue.channels.publish(context)
            : (window as WindowType).glue.contexts.update(id, context);
    };

    function addContextListener(handler: (context: Context) => void): Listener;
    function addContextListener(contextType: string, handler: (context: Context) => void): Listener;
    function addContextListener(contextTypeInput: any, handlerInput?: any): Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        if (!currentChannel) {
            console.warn("You need to join a channel in order to start receiving broadcasted contexts!");
            const listener = createPendingListener(contextType, handler);

            // Handle context passed to `fdc3.open()`.
            (window as WindowType).fdc3GluePromise
                .then(() => {
                    return (window as WindowType).glue.windows.my().getContext();
                })
                .then((startupContext) => {
                    if (!isEmptyObject(startupContext)) {
                        handler(startupContext);
                    }
                });

            return listener;
        }

        const { id, type } = currentChannel;

        const subscribe = (subHandler: (data: any) => void): (() => void) | Promise<() => void> => type === "system"
            ? (window as WindowType).glue.channels.subscribe(subHandler)
            : newSubscribe(id, subHandler);

        const onNewData = (data: any): void => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data);
                }
                return;
            }
            handler(data);
        };

        const unsubFunc = subscribe(onNewData);

        return AsyncListener(unsubFunc);
    }

    const setCurrentChannel = (newChannel: Channel): void => {
        currentChannel = newChannel;

        if (pendingSubscription) {
            const { contextType, handler, setActualUnsub } = pendingSubscription;

            const listener = addContextListener(contextType, handler);

            setActualUnsub(listener.unsubscribe);

            pendingSubscription = null;
        }
    };

    return {
        getSystemChannels,
        getOrCreateChannel,
        joinChannel,
        getCurrentChannel,
        leaveCurrentChannel,
        broadcast,
        addContextListener,
    };
};

export default createChannelsAgent;
