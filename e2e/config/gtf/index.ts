import 'regenerator-runtime/runtime';
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";
import { GtfAppManager } from "./appManager";

declare const window: any;
declare const GlueWorkspaces: any;
declare const GlueWeb: any;

const startGtf = async () => {
    const glueWebConfig = {
        libraries: [GlueWorkspaces],
        appManager: true
    };
    const glue = await GlueWeb(glueWebConfig);

    const gtfCore = new GtfCore(glue);

    window.glue = glue;
    window.gtf = Object.assign(
        gtfCore,
        { agm: new GtfAgm() },
        { appManager: new GtfAppManager(gtfCore) }
    );
};

window.coreReady = startGtf();
