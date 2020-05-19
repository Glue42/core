import { Injectable } from "@angular/core";
import { Glue42Store } from '@glue42/ng';
import { GlueStatus, Client } from './types';

@Injectable()
export class GlueService {

    constructor(private readonly glueStore: Glue42Store) { }

    public get glueStatus(): GlueStatus {
        return this.glueStore.initError ? "failed" : "ready";
    }

    public async sendSelectedClient(client: Client): Promise<void> {
        // const foundMethod = this.glueStore.glue.interop.methods().find((method) => method.name === "SelectClient");

        // if (foundMethod) {
        //     await this.glueStore.glue.interop.invoke(foundMethod, { client });
        // }

        await this.glueStore.glue.contexts.update('SelectedClient', client);
    }
}
