import { Glue42Web } from "../../web";

const CONTEXT_PREFIX = "___channel___";

export class SharedContextSubscriber {
    private unsubscribeFunc: undefined | (() => void);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: any;

    constructor(private contexts: Glue42Web.Contexts.API) {
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public subscribe(callback: any): void {
        this.callback = callback;
    }

    public subscribeFor(name: string, callback: (data: object, context: Glue42Web.Channels.ChannelContext, updaterId: string) => void): Promise<() => void> {
        if (!this.isChannel(name)) {
            return Promise.reject(new Error(`Channel with name: ${name} doesn't exist!`));
        }

        const contextName = this.createContextName(name);

        return this.contexts.subscribe(contextName, (data, _, __, ___, extraData) => {
            callback(data.data, data, extraData?.updaterId);
        });
    }

    public async switchChannel(name: string): Promise<void> {
        this.unsubscribe();
        const contextName = this.createContextName(name);
        this.unsubscribeFunc = await this.contexts.subscribe(contextName, (data, _, __, ___, extraData) => {
            if (this.callback) {
                this.callback(data.data, data, extraData?.updaterId);
            }
        });
    }

    public unsubscribe(): void {
        if (this.unsubscribeFunc) {
            this.unsubscribeFunc();
        }
    }

    public add(name: string, data: Glue42Web.Channels.ChannelContext): Promise<void> {
        const contextName = this.createContextName(name);
        return this.contexts.set(contextName, data);
    }

    public all(): string[] {
        const contextNames = this.contexts.all();
        const channelContextNames = contextNames.filter((contextName) => contextName.startsWith(CONTEXT_PREFIX));
        const channelNames = channelContextNames.map((channelContextName) => channelContextName.substr(CONTEXT_PREFIX.length));
        return channelNames;
    }

    public getContextData(name: string): Promise<Glue42Web.Channels.ChannelContext> {
        return new Promise((resolve, reject) => {
            if (!this.isChannel(name)) {
                return reject(new Error(`A channel with name: ${name} doesn't exist!`));
            }

            const contextName = this.createContextName(name);

            this.contexts.subscribe(contextName, (data) => {
                resolve(data);
            }).then((unsubscribeFunc) => unsubscribeFunc());
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public updateChannel(name: string, data: { name: string, meta: any, data: any }): Promise<void> {
        const contextName = this.createContextName(name);
        const newData: { name: string, meta: any, data?: any } = {
            name: data.name,
            meta: data.meta
        };

        if (data?.data && !this.isEmptyObject(data.data)) {
            newData.data = data.data;
        }

        return this.contexts.update(contextName, newData);
    }

    public updateData(name: string, data: any) {
        const contextName = this.createContextName(name);
        if (this.contexts.setPathSupported) {
            const pathValues: Glue42Web.Contexts.PathValue[] = Object.keys(data).map((key) => {
                return {
                    path: `data.${key}`,
                    value: data[key]
                };
            });
            return this.contexts.setPaths(contextName, pathValues);
        } else {
            // Pre @glue42/core 5.2.0. Note that we update the data property only.
            return this.contexts.update(contextName, { data });
        }
    }

    public isChannel(name: string): boolean {
        return this.all().some((channelName) => channelName === name);
    }

    private createContextName(name: string): string {
        return `${CONTEXT_PREFIX}${name}`;
    }

    private isEmptyObject(obj: object): boolean {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
}
