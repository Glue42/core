import { Glue42WebPlatform } from "../../../packages/web-platform/platform";
import { Glue42Web } from "../../../packages/web/web.d";
import { localApplicationsConfig } from "./config";
import { Gtf } from "./types";

export class GtfAppManager implements Gtf.AppManager {
    constructor(private readonly glue: Glue42Web.API) {
    }

    public getLocalApplications(): (Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition)[] {
        return localApplicationsConfig;
    }

    public async stopAllOtherInstances(): Promise<void> {
        const myInstanceId = this.glue.appManager.myInstance.id;

        const otherInstances = this.glue.appManager.instances().filter((instance) => instance.id !== myInstanceId);

        await Promise.all(otherInstances.map((instance) => instance.stop()));
    }

}
