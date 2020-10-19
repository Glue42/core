import 'regenerator-runtime/runtime';
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";
import { GtfChannels } from './channels';
import { GtfAppManager } from "./appManager";
import { GtfLogger } from './logger';
import { GtfConnection } from './connection';

declare const window: any;
declare const GlueWorkspaces: any;
declare const GlueWeb: any;

const startGtf = async () => {
    const glueWebConfig = {
        libraries: [GlueWorkspaces],
        appManager: true,
        application: 'TestRunner'
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
        { connection: new GtfConnection() }
    );
};

window.coreReady = startGtf();
