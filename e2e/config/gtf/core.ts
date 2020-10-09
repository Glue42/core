import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42CoreConfig } from "../../../packages/web/src/glue.config";
import { GtfApp } from "./app";
import { Gtf } from "./types";

export class GtfCore implements Gtf.Core {
    private readonly controlMethodName = "G42Core.E2E.Control";
    private windowNameCounter = 0;

    constructor(private readonly glue: Glue42Web.API) {
        console.log("GTF CREATED");
    }

    public waitFor(invocations: number, callback: () => any): () => void {
        let left = invocations;
        return () => {
            left--;

            if (left === 0) {
                callback();
            }
        };
    }

    public async waitForFetch(): Promise<void> {
        const pollingInterval = (await this.getGlueConfigJson()).appManager.remoteSources[0].pollingInterval;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, pollingInterval);
        });
    }

    public getWindowName(prefix = "windows"): string {
        this.windowNameCounter++;
        return `${prefix}.${Date.now()}.${this.windowNameCounter}`;
    }

    public async getGlueConfigJson(url = "/glue/glue.config.json"): Promise<Glue42CoreConfig> {
        const data = await (await fetch(url)).json();

        return data;
    }

    public async getChannelNames(): Promise<string[]> {
        const channelContexts = (await this.getGlueConfigJson()).channels as any[];

        return channelContexts.map<string>((channelContext) => channelContext.name);
    }

    public async createApp(appName = "coreSupport"): Promise<Gtf.App> {
        const foundApp = this.glue.appManager.application(appName);

        if (!foundApp) {
            throw new Error(`Support application: ${appName} was not found!`);
        }

        const supportInstance = await foundApp.start();

        await this.waitForControlInstance(supportInstance.agm.instance);

        return new GtfApp(this.glue, supportInstance, this.controlMethodName);

    }

    public post(url: string, body: string): Promise<Response> {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        };

        return fetch(url, init);
    }

    private waitForControlInstance(instanceId: string): Promise<void> {
        return new Promise((resolve) => {
            const unsubscribe = this.glue.interop.serverMethodAdded(({ server, method }) => {

                if (method.name !== this.controlMethodName) {
                    return;
                }

                if (server.instance !== instanceId) {
                    return;
                }

                if (unsubscribe) {
                    unsubscribe();
                }

                resolve();

            });
        });
    }
}
