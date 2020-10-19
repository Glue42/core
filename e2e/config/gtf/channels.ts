import { Glue42Web } from "../../../packages/web/web.d";
import { Gtf } from "./types";

export class GtfChannels implements Gtf.Channels {
    constructor(private readonly glue: Glue42Web.API) {
    }

    public async resetContexts(): Promise<void[]> {
        const channelNames = await this.glue.channels.all();

        const resetContextsPromises = channelNames.map((channelName) => this.glue.contexts.set(`___channel___${channelName}`, {
            name: channelName,
            meta: {
                color: channelName.toLowerCase()
            },
            data: {}
        }));

        return Promise.all(resetContextsPromises);
    }
}
