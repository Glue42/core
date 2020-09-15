import { FDC3 } from "../../types";
import { Glue42 } from "@glue42/desktop";
import { WindowType } from "../windowtype";
import { newSubscribe } from "../utils";

export class SystemChannel implements FDC3.Channel {
    id: string;
    readonly type: string = "system";
    displayMetadata: FDC3.DisplayMetadata;

    constructor(glChannel: Glue42.Channels.ChannelContext) {
        this.id = glChannel.name;
        this.displayMetadata = glChannel.meta;
    }

    broadcast(context: FDC3.Context): Promise<void> {
        return (window as WindowType).glue.channels.publish(context, this.id);
    }

    async getCurrentContext(contextType?: string): Promise<FDC3.Context | null> {
        const channel = await (window as WindowType).glue.channels.get(this.id);

        const { data } = channel;

        if (contextType) {
            return data && data.type === contextType
                ? data
                : null;
        }

        return data;
    }

    addContextListener(handler: FDC3.ContextHandler): FDC3.Listener;
    addContextListener(contextType: string, handler: FDC3.ContextHandler): FDC3.Listener;
    addContextListener(contextTypeInput: any, handlerInput?: any): FDC3.Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        const subHandler = (data: any): void => {
            if (contextType) {
                if (data?.type === contextType) {
                    handler(data);
                }
            } else {
                handler(data);
            }
        };

        const unsubPromise = (window as WindowType).glue.channels.subscribeFor(this.id, subHandler);

        return {
            unsubscribe(): void {
                unsubPromise.then((unsub) => unsub());
            }
        };
    }

    join(): Promise<void> {
        return (window as WindowType).glue.channels.join(this.id);
    }

    leave(): Promise<void> {
        return (window as WindowType).glue.channels.leave();
    }
}

export class AppChannel implements FDC3.Channel {
    readonly type: string = "app";

    constructor(public id: string) {
    }

    broadcast(context: FDC3.Context): Promise<void> {
        return (window as WindowType).glue.contexts.update(this.id, context);
    }

    async getCurrentContext(contextType?: string): Promise<FDC3.Context | null> {
        const context = await (window as WindowType).glue.contexts.get(this.id);

        const { data } = context;

        if (contextType) {
            return data && data.type === contextType
                ? data
                : null;
        }

        return data;
    }

    addContextListener(handler: FDC3.ContextHandler): FDC3.Listener;
    addContextListener(contextType: string, handler: FDC3.ContextHandler): FDC3.Listener;
    addContextListener(contextTypeInput: any, handlerInput?: any): FDC3.Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        const subHandler = (data: any): void => {
            if (contextType) {
                if (data?.type === contextType) {
                    handler(data);
                }
            } else {
                handler(data);
            }
        };

        const unsubPromise = newSubscribe(this.id, subHandler);

        return {
            unsubscribe: (): void => {
                unsubPromise.then((unsub) => unsub());
            }
        };
    }
}
