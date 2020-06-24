import { Injectable } from "@angular/core";
import { Glue42Store } from '@glue42/ng';
import { GlueStatus, Client, Channel } from './types';

@Injectable()
export class GlueService {

    constructor(private readonly glueStore: Glue42Store) { }

    public get glueStatus(): GlueStatus {
        return this.glueStore.initError ? "unavailable" : "available";
    }

    public getAllChannels(): Promise<Channel[]> {
        return this.glueStore.glue.channels.list();
    }

    public joinChannel(name: string): Promise<void> {
        return this.glueStore.glue.channels.join(name);
    }

    public leaveChannel(): Promise<void> {
        return this.glueStore.glue.channels.leave();
    }

    public async sendSelectedClient(client: Client): Promise<void> {
        // const foundMethod = this.glueStore.glue.interop.methods().find((method) => method.name === "SelectClient");

        // if (foundMethod) {
        //     await this.glueStore.glue.interop.invoke(foundMethod, { client });
        // }

        await Promise.all([
            this.glueStore.glue.contexts.update('SelectedClient', client),
            this.glueStore.glue.channels.publish(client)
        ]);
    }
}
