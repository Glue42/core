import { FDC3 } from "../../types";
import { Glue42 } from "@glue42/desktop";
import { SystemChannel, AppChannel } from "./channel";

const Listener = (actualUnsub:
    (() => void)
    | Promise<() => void>
): FDC3.Listener => {
    return {
        unsubscribe(): void {
            if (!actualUnsub) {
                // tslint:disable-next-line:no-console
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

interface PendingSubscription {
    contextType: string;
    handler: (context: FDC3.Context) => void;
    setActualUnsub: (actualUnsub: () => void) => void;
}

const createChannelsApi = (): FDC3.ChannelsAPI => {
    let currentChannel: FDC3.Channel | null;
    let pendingSubscription: PendingSubscription | null;

    const channels: { [name: string]: FDC3.Channel } = {};

    let systemChannels: string[] = [];

    const doesAppChannelExist = async (name: string): Promise<boolean> => {
        const exists = (await window.glue.contexts.all())
            .some((ctxName) => ctxName === name);

        return exists;
    };

    const createNewAppChannel = async (channelId: string): Promise<void> => {
        await window.glue.contexts.set(channelId, null);
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
        setCurrentChannel(channels[channelId]);
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
        const glue = await window.gluePromise;

        (await glue.channels.list()).map((channelContext) => {
            channels[channelContext.name] = mapToFDC3SystemChannel(channelContext);
        });

        systemChannels = await glue.channels.all();

        const current = await window.glue.channels.current();

        if (current) {
            handleSwitchChannelUI(current);
        }

        glue.channels.changed((channelId) => {
            handleSwitchChannelUI(channelId);
        });
    };

    const initDone = init();

    const getSystemChannels = async (): Promise<FDC3.Channel[]> => {
        await initDone;

        const systemChannelImpls = systemChannels.map((id) => channels[id]);

        return systemChannelImpls;
    };

    const getOrCreateAppChannel = async (channelId: FDC3.ChannelId): Promise<FDC3.Channel> => {
        const exists = await doesAppChannelExist(channelId);

        if (!exists) {
            await createNewAppChannel(channelId);
        }

        return mapToFDC3AppChannel(channelId);
    };

    const tryLeaveSystem = (): void => {
        if (isSystem(currentChannel)) {
            (currentChannel as SystemChannel).leave();
        }
    };

    const tryGetAppChannel = async (channelId: string): Promise<FDC3.Channel> => {
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
            tryLeaveSystem();
        }

        setCurrentChannel(channel);
    };

    const leaveCurrentChannel = (): void => {
        tryLeaveSystem();

        setCurrentChannel(null);
    };

    const broadcast = async (context: FDC3.Context): Promise<void> => {
        if (!currentChannel) {
            // tslint:disable-next-line:no-console
            console.error("You must join a channel first.");
            return;
        }

        const { id, type } = currentChannel;
        (type === "system")
            ? window.glue.channels.publish(context)
            : window.glue.contexts.update(id, context);
    };

    let isFirstSubscribe = true;

    function addContextListener(handler: (context: FDC3.Context) => void): FDC3.Listener;
    function addContextListener(contextType: string, handler: (context: FDC3.Context) => void): FDC3.Listener;
    function addContextListener(contextTypeInput: any, handlerInput?: any): FDC3.Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        if (!currentChannel) {
            // tslint:disable-next-line:no-console
            console.warn("You will start receiving broadcasts only after you join a channel !");
            const listener = createPendingListener(contextType, handler);

            return listener;
        }

        const { id, type } = currentChannel;

        const subscribe = (subHandler: ((data: any, context: Glue42.ChannelContext, updaterId: string) => void) | ((data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void)): (() => void) | Promise<() => void> => type === "system"
            ? window.glue.channels.subscribe(subHandler as (data: any, context: Glue42.ChannelContext, updaterId: string) => void)
            : window.glue.contexts.subscribe(id, subHandler as (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void);

        const onNewData = (data: any): void => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data);
                }
                return;
            }
            handler(data);
        };

        if (isFirstSubscribe) {
            isFirstSubscribe = false;

            const sendInitialContextFirst = async (): Promise<void> => {
                const initialContext = await window.glue.windows.my().getContext();

                if (initialContext && Object.keys(initialContext).length !== 0) {
                    handler(initialContext);
                }
            };

            const sendInitialPromise = window.gluePromise.then(sendInitialContextFirst);

            const unsubFunc = subscribe((data: any) => {
                sendInitialPromise.then(() => onNewData(data));
            });

            return Listener(unsubFunc);
        }

        const unsub = subscribe(onNewData);

        return Listener(unsub);
    }

    const setCurrentChannel = (newChannel: FDC3.Channel | null): void => {
        currentChannel = newChannel;

        if (pendingSubscription) {
            const { contextType, handler, setActualUnsub } = pendingSubscription;

            const replay = async (): Promise<void> => {
                const data = await newChannel?.getCurrentContext();

                if (data) {
                    handler(data);
                }
            };

            replay();

            const listener = addContextListener(contextType, handler);

            setActualUnsub(listener.unsubscribe);

            pendingSubscription = null;
        }
    };

    return {
        getSystemChannels: async (...props): Promise<FDC3.Channel[]> => {
            await window.gluePromise;
            return getSystemChannels(...props);
        },
        getOrCreateChannel: async (...props): Promise<FDC3.Channel> => {
            await window.gluePromise;
            return getOrCreateAppChannel(...props);
        },
        joinChannel: async (...props): Promise<void> => {
            await window.gluePromise;
            return joinChannel(...props);
        },
        getCurrentChannel: async (): Promise<FDC3.Channel> => {
            await window.gluePromise;
            return currentChannel as FDC3.Channel;
        },
        leaveCurrentChannel: async (): Promise<void> => {
            await window.gluePromise;
            return leaveCurrentChannel();
        },
        broadcast: async (...props): Promise<void> => {
            await window.gluePromise;
            return broadcast(...props);
        },
        addContextListener,
    };
};

export default createChannelsApi;
