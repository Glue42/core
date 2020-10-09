import { FDC3 } from "../../types";
import { Glue42 } from "@glue42/desktop";
import { SystemChannel, AppChannel } from "./channel";
import { WindowType } from "../windowtype";
import { getChannelsList, isGlue42Core, newSubscribe, isEmptyObject, Listener } from "../utils";

interface PendingSubscription {
    contextType: string;
    handler: (context: FDC3.Context) => void;
    setActualUnsub: (actualUnsub: () => void) => void;
}

const createChannelsAgent = (): FDC3.ChannelsAPI => {
    let currentChannel: FDC3.Channel | null;
    let pendingSubscription: PendingSubscription | null;

    const channels: { [name: string]: FDC3.Channel } = {};

    let systemChannels: string[] = [];

    const doesAppChannelExist = async (name: string): Promise<boolean> => {
        const exists = (await (window as WindowType).glue.contexts.all())
            .some((ctxName) => ctxName === name);

        return exists;
    };

    const createNewAppChannel = async (channelId: string): Promise<void> => {
        await (window as WindowType).glue.contexts.set(channelId, null);
    };

    const isSystem = (channel: FDC3.Channel | null): boolean => {
        if (!channel) {
            return false;
        }
        return systemChannels.some((n) => n === channel.id);
    };

    const mapToFDC3SystemChannel = (glueChannel: Glue42.Channels.ChannelContext): FDC3.Channel => {
        return new SystemChannel(glueChannel);
    };

    const mapToFDC3AppChannel = (channelName: string): FDC3.Channel => {
        return new AppChannel(channelName);
    };

    const handleSwitchChannelUI = (channelId: string): void => {
        if (typeof channelId !== "undefined") {
            setCurrentChannel(channels[channelId]);
        }
    };

    const createPendingListener = (contextType: string, handler: (context: FDC3.Context) => void): FDC3.Listener => {
        let unsubscribe = (): void => { pendingSubscription = null; };

        const setActualUnsub = (actualUnsub: () => void): void => { unsubscribe = actualUnsub; };

        // Used inside of setCurrentChannel.
        pendingSubscription = { contextType, handler, setActualUnsub };

        return {
            unsubscribe
        };
    };

    const init = async (): Promise<void> => {
        await (window as WindowType).gluePromise;

        const channelContents: Array<Glue42.Channels.ChannelContext> = await getChannelsList();

        channelContents.map((channelContext) => {
            channels[channelContext.name] = mapToFDC3SystemChannel(channelContext);
        });

        systemChannels = await (window as WindowType).glue.channels.all();

        const current = await (window as WindowType).glue.channels.current();

        // In Glue42 Core the channel selector widget needs to use the FDC3 Channels API instead of the Glue42 Channels API to navigate between the channels.
        if (!isGlue42Core) {
            if (current) {
                handleSwitchChannelUI(current);
            }

            (window as WindowType).glue.channels.changed((channelId: string) => {
                handleSwitchChannelUI(channelId);
            });
        }
    };

    const initDone = init();

    const getSystemChannels = async (): Promise<FDC3.Channel[]> => {
        await initDone;

        const systemChannelImpls = systemChannels.map((id) => channels[id]);

        return systemChannelImpls;
    };

    const getOrCreateAppChannel = async (channelId: FDC3.ChannelId): Promise<FDC3.Channel> => {
        await initDone;

        const exists = await doesAppChannelExist(channelId);

        if (!exists) {
            await createNewAppChannel(channelId);
        }

        return mapToFDC3AppChannel(channelId);
    };

    const getOrCreateChannel = async (channelId: FDC3.ChannelId): Promise<FDC3.Channel> => {
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

    const tryGetAppChannel = async (channelId: string): Promise<FDC3.Channel> => {
        await initDone;

        const exists = await doesAppChannelExist(channelId);

        if (!exists) {
            throw new Error(FDC3.ChannelError.NoChannelFound);
        }

        const appChannel = mapToFDC3AppChannel(channelId);
        channels[channelId] = appChannel;

        return appChannel;
    };

    const joinChannel = async (channelId: string): Promise<void> => {
        await initDone;

        const channel: FDC3.Channel = channels[channelId]
            || await tryGetAppChannel(channelId);

        if (!channel) {
            throw new Error(FDC3.ChannelError.NoChannelFound);
        }

        if (isSystem(channel)) {
            (channel as SystemChannel).join();
        } else {
            await tryLeaveSystem();
        }

        setCurrentChannel(channel);
    };

    const getCurrentChannel = async (): Promise<FDC3.Channel> => {
        await initDone;

        return currentChannel as FDC3.Channel;
    };

    const leaveCurrentChannel = async (): Promise<void> => {
        await initDone;

        await tryLeaveSystem();

        currentChannel = null;
    };

    const broadcast = async (context: FDC3.Context): Promise<void> => {
        await initDone;

        if (!currentChannel) {
            console.error("You must join a channel first.");
            return;
        }

        const { id, type } = currentChannel;
        (type === "system")
            ? (window as WindowType).glue.channels.publish(context)
            : (window as WindowType).glue.contexts.update(id, context);
    };

    function addContextListener(handler: (context: FDC3.Context) => void): FDC3.Listener;
    function addContextListener(contextType: string, handler: (context: FDC3.Context) => void): FDC3.Listener;
    function addContextListener(contextTypeInput: any, handlerInput?: any): FDC3.Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        if (!currentChannel) {
            console.warn("You will start receiving broadcasts only after you join a channel !");
            const listener = createPendingListener(contextType, handler);

            // Handle context passed to `fdc3.open()`.
            (window as WindowType).gluePromise
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

        return Listener(unsubFunc);
    }

    const setCurrentChannel = (newChannel: FDC3.Channel): void => {
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
