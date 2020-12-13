import { Glue42Web } from "../../../packages/web/web";
import { Gtf } from "./types";
import { promisePlus } from "./utils";

export class GtfAgm implements Gtf.Agm {
    private counter = 0;
    private readonly systemMethodNames = ["T42.Web.Platform.WSP.Stream", "T42.Workspaces.Events", "T42.Web.Platform.Control", "T42.Web.Platform.Stream", "T42.Web.Client.Control", "G42Core.E2E.Logger"];

    constructor(private readonly glue: Glue42Web.API) {
    }

    public getMethodName(): string {
        this.counter++;
        return `agm.integration.tests.method.${Date.now()}.${this.counter}`;
    }

    public waitForMethodAdded(methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance = this.glue.interop.instance.instance, timeoutMilliseconds = 3000): Promise<void> {
        const methodName = (methodDefinition as Glue42Web.Interop.MethodDefinition).name || methodDefinition;

        const methodAddedPromise = new Promise<void>((resolve) => {
            const unsub = this.glue.interop.serverMethodAdded(({ method, server }) => {
                if (method.name === methodName && server.instance === targetAgmInstance) {
                    unsub();
                    resolve();
                }
            });
        });

        return promisePlus<void>(() => methodAddedPromise, timeoutMilliseconds, `Timed out waiting for method added ${methodName}`);
    }

    public waitForMethodRemoved(methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance = this.glue.interop.instance.instance, timeoutMilliseconds = 3000): Promise<void> {
        const methodName = (methodDefinition as Glue42Web.Interop.MethodDefinition).name || methodDefinition;

        const methodRemovedPromise = new Promise<void>((resolve) => {
            const unsub = this.glue.interop.serverMethodRemoved(({ method, server }) => {
                if (method.name === methodName && server.instance === targetAgmInstance) {
                    unsub();
                    resolve();
                }
            });
        });

        return promisePlus<void>(() => methodRemovedPromise, timeoutMilliseconds, `Timed out waiting for method removed ${methodName}`);
    }

    public async unregisterAllMyNonSystemMethods(): Promise<void> {
        const allMethods = this.glue.interop.methods().filter((method) => !method.supportsStreaming);
        const allMyMethods = allMethods.filter((method) => method.getServers().some((server) => server.instance === this.glue.interop.instance.instance));
        const allMyNonSystemMethods = allMyMethods.filter((method) => !this.systemMethodNames.includes(method.name));

        const unregisterPromises = allMyNonSystemMethods.map((method) => {
            const unregisterPromise = this.waitForMethodRemoved(method);

            this.glue.interop.unregister(method);

            return unregisterPromise;
        });

        await Promise.all(unregisterPromises);
    }

    public async unregisterMyStreams(myStreams: Glue42Web.Interop.Stream[]): Promise<void> {
        const unregisterPromises = myStreams.map((stream) => {
            const unregisterPromise = this.waitForMethodRemoved(stream.definition);

            stream.close();

            return unregisterPromise;
        });

        await Promise.all(unregisterPromises);
    }

    public compareServers({ instance: actualServerInstance, application: actualServerApplication }: Glue42Web.Interop.Instance, { instance: expectedServerInstance, application: expectedServerApplication }: Glue42Web.Interop.Instance): boolean {
        return actualServerInstance === expectedServerInstance && actualServerApplication === expectedServerApplication;
    }
}
