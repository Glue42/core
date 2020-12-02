import "regenerator-runtime/runtime";
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";
import { GtfChannels } from "./channels";
import { GtfAppManager } from "./appManager";
import { GtfIntents } from './intents';
import { GtfLogger } from "./logger";
import { GtfConnection } from "./connection";
import { GlueWebFactoryFunction, Glue42Web } from "../../../packages/web/web.d";
import { WorkspacesFactoryFunction } from "../../../packages/workspaces-api/workspaces";

declare const window: any;
declare const GlueWorkspaces: WorkspacesFactoryFunction;
declare const GlueWeb: GlueWebFactoryFunction;

const startGtf = async () => {
    const glueWebConfig: Glue42Web.Config = {
        libraries: [GlueWorkspaces],
        appManager: true,
        application: "TestRunner",
        channels: true
    };
    const glue = await GlueWeb(glueWebConfig);

    const gtfCore = new GtfCore(glue);
    const gtfLogger = new GtfLogger(glue);
    gtfLogger.patchLogMessages();
    await gtfLogger.register();

    window.glue = glue;
    window.gtf = Object.assign(
        gtfCore,
        { agm: new GtfAgm(glue) },
        { channels: new GtfChannels(glue) },
        { appManager: new GtfAppManager(glue, gtfCore) },
        { intents: new GtfIntents(glue) },
        { connection: new GtfConnection() }
    );
};

window.coreReady = startGtf();
