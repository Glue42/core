import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42CoreApplicationConfig, FDC3ApplicationConfig } from "../../../packages/web/src/glue.config";
import { Gtf } from "./types";

export class GtfAppManager implements Gtf.AppManager {
    constructor(private readonly glue: Glue42Web.API, private readonly gtfCore: Gtf.Core) {
    }

    public async getLocalApplications(): Promise<Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>> {
        const appManagerConfig = (await this.gtfCore.getGlueConfigJson()).appManager;

        return appManagerConfig.localApplications;
    }

    public async getRemoteSourceApplications(url = "http://localhost:9998/v1/apps/search"): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await fetch(url)).json();

        return data.applications;
    }

    public async addRemoteSourceApplication(application: Glue42Web.AppManager.Application, url = "http://localhost:9998/v1/apps/add"): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await this.gtfCore.post(url, JSON.stringify(application))).json();

        return data.applications;
    }

    public async resetRemoteSourceApplications(url = "http://localhost:9998/v1/apps/reset"): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await fetch(url)).json();

        return data.applications;
    }

    public async setRemoteSourceApplications(applications: Glue42Web.AppManager.Application[], url = "http://localhost:9998/v1/apps/set"): Promise<Glue42Web.AppManager.Application[]> {
        const data = await (await this.gtfCore.post(url, JSON.stringify(applications))).json();

        return data.applications;
    }

    public async stopAllOtherInstances(): Promise<void> {
        const myInstanceId = this.glue.appManager.myInstance.id;

        const otherInstances = this.glue.appManager.instances().filter((instance) => instance.id !== myInstanceId);

        console.log(otherInstances.length > 0 ? `Stopping instances: ${otherInstances.map(instance => instance.id)}` : "No instances to stop");

        await Promise.all(otherInstances.map((instance) => instance.stop().then(() => console.log(`Stopped instance ${instance.id}`))));
    }
}
