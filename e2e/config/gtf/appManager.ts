import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42WebPlatform } from "../../../packages/web-platform/platform.d";
import { localApplicationsConfig, remoteStoreConfig } from "./config";
import { Gtf } from "./types";

export class GtfAppManager implements Gtf.AppManager {
    constructor(private readonly glue: Glue42Web.API, private readonly gtfCore: Gtf.Core) {
    }

    public getLocalApplications(): (Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition)[] {
        return localApplicationsConfig;
    }

    public async getRemoteSourceApplications(): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await fetch(`${this.getRemoteSourceBaseUrl()}/search`)).json();

        return data.applications;
    }

    public async addRemoteSourceApplication(application: Glue42Web.AppManager.Application): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await this.gtfCore.post(`${this.getRemoteSourceBaseUrl()}/add`, JSON.stringify(application))).json();

        return data.applications;
    }

    public async resetRemoteSourceApplications(): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await fetch(`${this.getRemoteSourceBaseUrl()}/reset`)).json();

        return data.applications;
    }

    public async setRemoteSourceApplications(applications: Glue42Web.AppManager.Application[]): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await this.gtfCore.post(`${this.getRemoteSourceBaseUrl()}/set`, JSON.stringify(applications))).json();

        return data.applications;
    }

    public async stopAllOtherInstances(): Promise<void> {
        const myInstanceId = this.glue.appManager.myInstance.id;

        const otherInstances = this.glue.appManager.instances().filter((instance) => instance.id !== myInstanceId);

        console.log(otherInstances.length > 0 ? `Stopping instances: ${otherInstances.map(instance => instance.id)}` : "No instances to stop!");

        await Promise.all(otherInstances.map((instance) => instance.stop().then(() => console.log(`Stopped instance ${instance.id}`))));
    }

    private getRemoteSourceBaseUrl(): string {
        if (typeof remoteStoreConfig === "undefined") {
            throw new Error("No remote store provided!");
        }

        return remoteStoreConfig.url.replace(/\/search\/?/, '');
    }
}
