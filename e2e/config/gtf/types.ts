import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42CoreConfig, Glue42CoreApplicationConfig, FDC3ApplicationConfig } from "../../../packages/web/src/glue.config";

export interface ControlArgs {
    operation: string;
    params: any;
}

export namespace Gtf {
    export interface App {
        stop(): Promise<void>;

        setContext(ctxName: string, ctxData: any): Promise<void>;

        updateContext(ctxName: string, ctxData: any): Promise<void>;

        getContext(ctxName: string): Promise<any>;

        getAllContextNames(): Promise<string[]>;
    }

    export interface Core {
        waitFor(invocations: number, callback: () => any): () => void;

        waitForFetch(): Promise<void>;

        getWindowName(prefix?: string): string;

        getGlueConfigJson(url?: string): Promise<Glue42CoreConfig>;

        getChannelNames(): Promise<string[]>;

        createApp(appName?: string): Promise<App>;

        post(url: string, body: string): Promise<Response>;
    }

    export interface AppManager {
        getLocalApplications(): Promise<Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>>;

        getRemoteSourceApplications(url?: string): Promise<Glue42Web.AppManager.Application[]>;

        addRemoteSourceApplication(application: Glue42Web.AppManager.Application, url?: string): Promise<Glue42Web.AppManager.Application[]>;

        resetRemoteSourceApplications(url?: string): Promise<Glue42Web.AppManager.Application[]>;

        setRemoteSourceApplications(applications: Glue42Web.AppManager.Application[], url?: string): Promise<Glue42Web.AppManager.Application[]>;
    }
}
