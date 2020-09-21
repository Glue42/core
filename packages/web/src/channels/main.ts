import { Glue42Web } from "../../web";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { SharedContextSubscriber } from "./contexts";

export class Channels implements Glue42Web.Channels.API {
    private subsKey = "subs";
    private changedKey = "changed";

    private registry: CallbackRegistry = CallbackRegistryFactory();
    private currentContext: undefined | string;
    private shared: SharedContextSubscriber;
    private readyPromise: Promise<{} | undefined>;

    constructor(contexts: Glue42Web.Contexts.API, channels?: Glue42Web.Channels.ChannelContext[]) {
        this.shared = new SharedContextSubscriber(contexts);
        this.shared.subscribe(this.handler.bind(this));
        // Chain the addition of the channels so they appear in the same order as in the config every time, compared to being shuffled when using Promise.all().
        this.readyPromise = Promise.resolve(channels?.reduce((promise, channel) => {
            return promise.then(() => this.add(channel));
        }, Promise.resolve({})));
    }

    public subscribe(callback: (data: object, context: Glue42Web.Channels.ChannelContext, updaterId: string) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        return this.registry.add(this.subsKey, callback);
    }

    public async subscribeFor(name: string, callback: (data: object, context: Glue42Web.Channels.ChannelContext, updaterId: string) => void): Promise<UnsubscribeFunction> {
        if (typeof name !== "string") {
            throw new Error("Please provide the name as a string!");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        const unsubscribeFunc = await this.shared.subscribeFor(name, callback);
        return unsubscribeFunc;
    }

    public async publish(data: object, name?: string): Promise<void> {
        if (typeof data !== "object") {
            throw new Error("Please provide the data as an object!");
        }

        if (name) {
            if (typeof name !== "string") {
                throw new Error("Please provide the name as a string!");
            }

            if (!this.shared.isChannel(name)) {
                throw new Error(`A channel with name: ${name} doesn't exist!`);
            }

            return this.shared.updateData(name, data);
        }

        if (!this.currentContext) {
            throw new Error("Not joined to any channel!");
        }
        return this.shared.updateData(this.currentContext, data);
    }

    public all(): Promise<string[]> {
        const channelNames = this.shared.all();
        return Promise.resolve(channelNames);
    }

    public async list(): Promise<Glue42Web.Channels.ChannelContext[]> {
        const channelNames = await this.all();
        const channelContexts = await Promise.all(channelNames.map((channelName) => this.get(channelName)));
        return channelContexts;
    }

    public get(name: string): Promise<Glue42Web.Channels.ChannelContext> {
        if (typeof name !== "string") {
            return Promise.reject(new Error("Please provide the channel name as a string!"));
        }

        return this.shared.getContextData(name);
    }

    public async join(name: string): Promise<void> {
        if (typeof name !== "string") {
            throw new Error("Please provide the channel name as a string!");
        }

        // Checks if a channel exists with the provided name.
        const doesChannelExist = (channelName: string): boolean => {
            const channelNames = this.shared.all();
            return channelNames.includes(channelName);
        };

        // Wait for 3k ms for the channel to appear if it doesn't already exist.
        if (!doesChannelExist(name)) {
            const channelExistsPromise = new Promise((resolve, reject) => {
                // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
                let timeoutId: any;

                // Check every 100 ms for a channel with the provided name.
                const intervalId = setInterval(() => {
                    if (doesChannelExist(name)) {
                        clearTimeout(timeoutId);
                        clearInterval(intervalId);
                        resolve();
                    }
                }, 100);

                timeoutId = setTimeout(() => {
                    clearInterval(intervalId);

                    return reject(new Error(`A channel with name: ${name} doesn't exist!`));
                }, 3000);
            });

            await channelExistsPromise;
        }

        this.currentContext = name;
        await this.shared.switchChannel(name);
        this.registry.execute(this.changedKey, name);
    }

    public leave(): Promise<void> {
        this.currentContext = undefined;
        this.registry.execute(this.changedKey, undefined);
        this.shared.unsubscribe();
        return Promise.resolve();
    }

    public current(): string {
        return this.currentContext as string;
    }

    public my(): string {
        return this.current();
    }

    public changed(callback: (channel: string) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        return this.registry.add(this.changedKey, callback);
    }

    public onChanged(callback: (channel: string) => void): UnsubscribeFunction {
        return this.changed(callback);
    }

    public async add(info: Glue42Web.Channels.ChannelContext): Promise<Glue42Web.Channels.ChannelContext> {
        if (typeof info !== "object") {
            throw new Error("Please provide the info as an object!");
        }
        if (typeof info.name === "undefined") {
            throw new Error("info.name is missing!");
        }
        if (typeof info.name !== "string") {
            throw new Error("Please provide the info.name as a string!");
        }
        if (typeof info.meta === "undefined") {
            throw new Error("info.meta is missing!");
        }
        if (typeof info.meta !== "object") {
            throw new Error("Please provide the info.meta as an object!");
        }
        if (typeof info.meta.color === "undefined") {
            throw new Error("info.meta.color is missing!");
        }
        if (typeof info.meta.color !== "string") {
            throw new Error("Please provide the info.meta.color as a string!");
        }

        const context: Glue42Web.Channels.ChannelContext = {
            name: info.name,
            meta: info.meta,
            data: info.data || {}
        };

        await this.shared.updateChannel(info.name, context);

        return context;
    }

    public ready(): Promise<{} | undefined> {
        return this.readyPromise;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handler(data: object, context: Glue42Web.Channels.ChannelContext, updaterId: string): any {
        this.registry.execute(this.subsKey, data, context, updaterId);
    }
}
