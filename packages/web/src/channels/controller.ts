/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "../../web";
import { channelNameDecoder } from "../shared/decoders";
import { LibController } from "../shared/types";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";

export class ChannelsController implements LibController {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private logger!: Glue42Web.Logger.API;
    private contexts!: Glue42Core.Contexts.API;
    private currentChannelName: string | undefined;
    private unsubscribeFunc: (() => void) | undefined;

    private readonly GlueWebChannelsPrefix = "___channel___";
    private readonly SubsKey = "subs";
    private readonly ChangedKey = "changed";

    public async start(coreGlue: Glue42Core.GlueCore): Promise<void> {
        this.logger = coreGlue.logger.subLogger("channels.controller.web");

        this.logger.trace("starting the web channels controller");

        this.contexts = coreGlue.contexts;

        this.logger.trace("no need for platform registration, attaching the channels property to glue and returning");

        const api = this.toApi();

        (coreGlue as Glue42Web.API).channels = api;
    }

    public async handleBridgeMessage(): Promise<void> {
        // noop
    }

    private toApi(): Glue42Web.Channels.API {
        const api: Glue42Web.Channels.API = {
            subscribe: this.subscribe.bind(this),
            subscribeFor: this.subscribeFor.bind(this),
            publish: this.publish.bind(this),
            all: this.all.bind(this),
            list: this.list.bind(this),
            get: this.get.bind(this),
            join: this.join.bind(this),
            leave: this.leave.bind(this),
            current: this.current.bind(this),
            my: this.my.bind(this),
            changed: this.changed.bind(this),
            onChanged: this.onChanged.bind(this),
            add: this.add.bind(this)
        };

        return Object.freeze(api);
    }

    private createContextName(channelName: string): string {
        return `${this.GlueWebChannelsPrefix}${channelName}`;
    }

    private getAllChannelNames(): string[] {
        const contextNames = this.contexts.all();

        const channelContextNames = contextNames.filter((contextName) => contextName.startsWith(this.GlueWebChannelsPrefix));

        const channelNames = channelContextNames.map((channelContextName) => channelContextName.replace(this.GlueWebChannelsPrefix, ""));

        return channelNames;
    }

    private unsubscribe(): void {
        if (this.unsubscribeFunc) {
            this.unsubscribeFunc();

            this.unsubscribeFunc = undefined;
        }
    }

    private async switchToChannel(name?: string): Promise<void> {
        this.unsubscribe();

        // TODO: Should be set after `subscribe()` has resolved, but due to an issue where `subscribe()` replays the context before returning an unsubscribe function this has been moved here.
        this.currentChannelName = name;

        // When joining a channel (and not leaving).
        if (typeof name !== "undefined") {
            const contextName = this.createContextName(name);

            this.unsubscribeFunc = await this.contexts.subscribe(contextName, (context, _, __, ___, extraData) => {
                this.registry.execute(this.SubsKey, context.data, context, extraData?.updaterId);
            });
        }

        this.registry.execute(this.ChangedKey, name);
    }

    private async updateData(name: string, data: any): Promise<void> {
        const contextName = this.createContextName(name);

        if (this.contexts.setPathSupported) {
            const pathValues: Glue42Web.Contexts.PathValue[] = Object.keys(data).map((key) => {
                return {
                    path: `data.${key}`,
                    value: data[key]
                };
            });

            await this.contexts.setPaths(contextName, pathValues);
        } else {
            // Pre @glue42/core 5.2.0. Note that we update the data property only.
            await this.contexts.update(contextName, { data });
        }
    }

    private subscribe(callback: (data: any, context: Glue42Web.Channels.ChannelContext, updaterId: string) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Cannot subscribe to channels, because the provided callback is not a function!");
        }

        return this.registry.add(this.SubsKey, callback);
    }

    private async subscribeFor(name: string, callback: (data: any, context: Glue42Web.Channels.ChannelContext, updaterId: string) => void): Promise<UnsubscribeFunction> {
        const channelNames = this.getAllChannelNames();
        channelNameDecoder(channelNames).runWithException(name);
        if (typeof callback !== "function") {
            throw new Error(`Cannot subscribe to channel ${name}, because the provided callback is not a function!`);
        }

        const contextName = this.createContextName(name);

        return this.contexts.subscribe(contextName, (context, _, __, ___, extraData) => {
            callback(context.data, context, extraData?.updaterId);
        });
    }

    private publish(data: any, name?: string): Promise<void> {
        if (typeof data !== "object") {
            throw new Error("Cannot publish to channel, because the provided data is not an object!");
        }
        if (typeof name !== "undefined") {
            const channelNames = this.getAllChannelNames();
            channelNameDecoder(channelNames).runWithException(name);

            return this.updateData(name, data);
        }

        if (typeof this.currentChannelName === "undefined") {
            throw new Error("Cannot publish to channel, because not joined to a channel!");
        }

        return this.updateData(this.currentChannelName, data);
    }

    private async all(): Promise<string[]> {
        const channelNames = this.getAllChannelNames();

        return channelNames;
    }

    private async list(): Promise<Glue42Web.Channels.ChannelContext[]> {
        const channelNames = this.getAllChannelNames();

        const channelContexts = await Promise.all(channelNames.map((channelName) => this.get(channelName)));

        return channelContexts;
    }

    private get(name: string): Promise<Glue42Web.Channels.ChannelContext> {
        const channelNames = this.getAllChannelNames();
        channelNameDecoder(channelNames).runWithException(name);

        const contextName = this.createContextName(name);

        return this.contexts.get(contextName);
    }

    private async join(name: string): Promise<void> {
        const channelNames = this.getAllChannelNames();
        channelNameDecoder(channelNames).runWithException(name);

        await this.switchToChannel(name);
    }

    private async leave(): Promise<void> {
        await this.switchToChannel();
    }

    private current(): string {
        return this.currentChannelName as string;
    }

    private my(): string {
        return this.current();
    }

    private changed(callback: (channel: string) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Cannot subscribe to channel changed, because the provided callback is not a function!");
        }

        return this.registry.add(this.ChangedKey, callback);
    }

    private onChanged(callback: (channel: string) => void): UnsubscribeFunction {
        return this.changed(callback);
    }

    private add(info: Glue42Web.Channels.ChannelContext): Promise<Glue42Web.Channels.ChannelContext> {
        throw new Error("Method `add()` isn't implemented.");
    }
}
