import "regenerator-runtime/runtime";
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";
import { GtfChannels } from "./channels";
import { GtfAppManager } from "./appManager";
import { GtfIntents } from './intents';
import { GtfLogger } from "./logger";
import { GtfConnection } from "./connection";
import { GtfWindows } from "./windows";
import { Glue42Web, Glue42WebFactoryFunction } from "../../../packages/web/web.d";
import { Glue42WebPlatform, Glue42WebPlatformFactoryFunction } from "../../../packages/web-platform/platform.d";
import { WorkspacesFactoryFunction } from "../../../packages/workspaces-api/workspaces";
// TODO: Add building and serving the Workspaces application to the e2e script.
const {
    localApplicationsConfig,
    layoutsConfig,
    channelsConfig,
    workspacesConfig,
    gatewayConfig
} = require("./config");

// Make the RUNNER environment variable available inside of the tests (resolved during the gtf build process) and set it as window title.
const RUNNER = process.env.RUNNER;
const platformMode = RUNNER === "Platform";
window.RUNNER = RUNNER;
document.title = RUNNER;

declare const window: any;
declare const GlueWorkspaces: WorkspacesFactoryFunction;
declare const GlueWeb: Glue42WebFactoryFunction;
declare const GlueWebPlatform: Glue42WebPlatformFactoryFunction;

const startGtf = async () => {
    const glueWebConfig: Glue42Web.Config = {
        libraries: [GlueWorkspaces],
        systemLogger: { level: "error" }
    };

    let glue: Glue42Web.API;

    const gluePlatformConfig: Glue42WebPlatform.Config = {
        applications: {
            local: localApplicationsConfig
        },
        layouts: layoutsConfig,
        channels: channelsConfig,
        glue: glueWebConfig,
        workspaces: workspacesConfig,
        gateway: gatewayConfig as Glue42WebPlatform.Gateway.Config
    };

    if (platformMode) {
        const { glue: platformGlue, platform } = await (GlueWebPlatform as (config?: Glue42WebPlatform.Config) => Promise<{ glue: Glue42Web.API, platform: Glue42WebPlatform.API }>)(gluePlatformConfig);

        glue = platformGlue;
        window.platform = platform;
    } else {
        const clientGlue = await (GlueWeb as (config?: Glue42Web.Config) => Promise<Glue42Web.API>)(glueWebConfig);

        glue = clientGlue;
    }

    window.glue = glue;

    const gtfCore = new GtfCore(glue);
    const gtfLogger = new GtfLogger(glue);

    gtfLogger.patchLogMessages();
    await gtfLogger.register();

    window.gtf = Object.assign(
        gtfCore,
        { agm: new GtfAgm(glue) },
        { channels: new GtfChannels(glue) },
        { appManager: new GtfAppManager(glue) },
        { intents: new GtfIntents(glue) },
        { connection: new GtfConnection() },
        { windows: new GtfWindows(glue) }
    );
};

window.coreReady = startGtf();
