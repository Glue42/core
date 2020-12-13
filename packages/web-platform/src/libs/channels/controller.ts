/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Core } from "@glue42/core";
import { Glue42WebPlatform } from "../../../platform";
import { InternalPlatformConfig, LibController } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import logger from "../../shared/logger";
import { ChannelContextPrefix } from "../../common/constants";

export class ChannelsController implements LibController {
    constructor(
        private readonly glueController: GlueController
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("channels.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        const channelDefinitions = config.channels.definitions;

        this.logger?.trace("initializing channels");

        await this.setupChannels(channelDefinitions);

        this.logger?.trace("initialization is completed");
    }

    public async handleControl(): Promise<void> {
        // noop
    }

    private async setupChannels(channels: Glue42WebPlatform.Channels.ChannelDefinition[]): Promise<void> {
        await Promise.all(channels.map((channel) => this.addChannel(channel)));
    }

    private async addChannel(info: Glue42WebPlatform.Channels.ChannelDefinition): Promise<void> {
        const context: Glue42Web.Channels.ChannelContext = {
            name: info.name,
            meta: info.meta,
            data: info.data || {}
        };

        const contextName = this.createContextName(context.name);

        await this.glueController.setContext(contextName, context);
    }

    private createContextName(channelName: string): string {
        return `${ChannelContextPrefix}${channelName}`;
    }
}
