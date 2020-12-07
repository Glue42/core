import "regenerator-runtime/runtime";
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";
import { GtfChannels } from "./channels";
import { GtfAppManager } from "./appManager";
import { GtfIntents } from './intents';
import { GtfLogger } from "./logger";
import { GtfConnection } from "./connection";
import { GtfWindows } from "./windows";
import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42WebPlatform, WebPlatformFactoryFunction } from "../../../packages/web-platform/platform.d";
import { WorkspacesFactoryFunction } from "../../../packages/workspaces-api/workspaces";
// TODO: Add building and serving the Workspaces application to the e2e script.
import { channelsConfig, localApplicationsConfig, remoteStoreConfig } from "./config";

// Make the RUNNER environment variable available inside of the tests (resolved during the gtf build process).
window.RUNNER = process.env.RUNNER;

declare const window: any;
declare const GlueWorkspaces: WorkspacesFactoryFunction;
declare const GlueWebPlatform: WebPlatformFactoryFunction;

const startGtf = async () => {
    const glueWebConfig: Glue42Web.Config = {
        libraries: [GlueWorkspaces],
        systemLogger: { level: "error" }
    };

    const gluePlatformConfig: Glue42WebPlatform.Config = {
        // TODO: Test supplier and remote applications modes.
        applications: {
            mode: "local",
            local: localApplicationsConfig
        },
        channels: channelsConfig,
        glue: glueWebConfig,
        workspaces: {
            // TODO: Add building and serving the Workspaces application to the e2e script.
            src: "http://localhost:3000"
        },
        gateway: {
            logging: {
                level: "error"
            }
        }
    };

    const { glue, platform } = await (GlueWebPlatform as (config?: Glue42WebPlatform.Config) => Promise<{ glue: Glue42Web.API, platform: Glue42WebPlatform.API }>)(gluePlatformConfig);

    window.glue = glue;
    window.platform = platform;

    const gtfCore = new GtfCore(glue);
    const gtfLogger = new GtfLogger(glue);

    gtfLogger.patchLogMessages();
    await gtfLogger.register();

    window.gtf = Object.assign(
        gtfCore,
        { agm: new GtfAgm(glue) },
        { channels: new GtfChannels(glue) },
        { appManager: new GtfAppManager(glue, gtfCore) },
        { intents: new GtfIntents(glue) },
        { connection: new GtfConnection() },
        { windows: new GtfWindows(glue) }
    );
};

window.coreReady = startGtf();
