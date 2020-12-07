import { Glue42Web } from "../../../packages/web/web.d";
import { GtfApp } from "./app";
import { CancellablePromise, Gtf } from "./types";
import { Glue42WebPlatform } from "../../../packages/web-platform/platform.d";
import { channelsConfig, remoteStoreConfig } from "./config";

export class GtfCore implements Gtf.Core {
    private readonly controlMethodName = "G42Core.E2E.Control";
    private windowNameCounter = 0;
    private activeWindowHooks: (() => void | Promise<void>)[] = [];

    constructor(private readonly glue: Glue42Web.API) {
        console.log("GTF CREATED");
    }

    public addWindowHook(hook: () => void | Promise<void>): void {
        if (typeof hook !== "function") {
            throw new Error('Tried to add a non-function hook.');
        }

        this.activeWindowHooks.push(hook);
    }

    public async clearWindowActiveHooks(): Promise<void> {
        const clearWindowActiveHooksPromises = this.activeWindowHooks.map((hook) => Promise.resolve(hook()));

        await Promise.all(clearWindowActiveHooksPromises);

        this.activeWindowHooks = [];
    }

    public wait(mSeconds: number, funcToCall: any): CancellablePromise<any> {
        let fakePromiseResolve: (value?: unknown) => void;
        let isCancelled = false;

        const fakePromise = new Promise((res, rej) => {
            fakePromiseResolve = res;
        });

        const promise = new Promise((res, rej) => {
            setTimeout(() => {
                if (isCancelled) {
                    return;
                }
                try {
                    if (funcToCall) {
                        funcToCall();
                    }
                    res();
                } catch (error) {
                    rej(error);
                }
            }, mSeconds);
        });

        fakePromise.then(() => {
            isCancelled = true;
        });

        Promise.race([promise, fakePromise]);

        const cancel = () => {
            fakePromiseResolve();
        };

        (promise as any).cancel = cancel;

        return promise as CancellablePromise<any>;
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
        if (typeof remoteStoreConfig === "undefined") {
            throw new Error("No remote store provided!");
        }

        const pollingInterval = remoteStoreConfig.pollingInterval || 3000;

        const extraInterval = 2000;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, pollingInterval + extraInterval);
        });
    }

    public getWindowName(prefix = "windows"): string {
        this.windowNameCounter++;
        return `${prefix}.${Date.now()}.${this.windowNameCounter}`;
    }

    public getChannelsConfigDefinitions(): Glue42WebPlatform.Channels.ChannelDefinition[] {
        return channelsConfig.definitions;
    }

    public async getChannelNames(): Promise<string[]> {
        return channelsConfig.definitions.map((channelContext) => channelContext.name);
    }

    public async createApp(appName = "coreSupport"): Promise<Gtf.App> {
        const foundApp = this.glue.appManager.application(appName);

        if (!foundApp) {
            throw new Error(`Support application: ${appName} was not found!`);
        }

        const supportInstance = await foundApp.start();

        return new GtfApp(this.glue, supportInstance, this.controlMethodName);
    }

    public post(url: string, body: string): Promise<Response> {
        const init = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body
        };

        return fetch(url, init);
    }
}
