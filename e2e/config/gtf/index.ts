import 'regenerator-runtime/runtime';
import { GtfCore } from "./core";
import { GtfAgm } from "./agm";

declare const window: any;
declare const GlueWorkspaces: any;
declare const GlueWeb: any;

const startGtf = async () => {
    const glue = await GlueWeb({ libraries: [GlueWorkspaces] });

    window.glue = glue;

    window.gtf = Object.assign(
        new GtfCore(glue),
        { agm: new GtfAgm() }
    );

    // reg. method.
}

window.coreReady = startGtf();