import createDesktopAgent from "./agent";
import Glue, { Glue42 } from "@glue42/desktop";
import GlueWebFactory, { Glue42Web } from "@glue42/web";
import { isGlue42Core, waitFor } from "./utils";
import { version } from "../package.json";
import { WindowType } from "./types/windowtype";
import { DesktopAgent } from "@finos/fdc3";
import { Glue42GD, Glue42GDOriginalGlue } from "./types/glue42gd";

const defaultGlueConfig = {
    application: (window as WindowType).fdc3AppName,
    context: true,
    channels: true,
    agm: true
};

const validateGlue = (glue: Glue42.Glue | Glue42Web.API): void => {
    const apisFDC3ReliesUpon: ["contexts", "intents", "channels", "agm", "appManager"] = [
        "contexts",
        "intents",
        "channels",
        "agm",
        "appManager"
    ];

    for (const apiFDC3ReliesUpon of apisFDC3ReliesUpon) {
        if (typeof glue[apiFDC3ReliesUpon] === "undefined") {
            throw new Error(`Failed to initialize @glue42/fdc3. @glue42/fdc3 depends on the Glue42 ${apiFDC3ReliesUpon.replace(/^./, apiFDC3ReliesUpon[0].toUpperCase())} API being available. Ignore this error if you do not plan on using FDC3.`);
        }
    }
};

const resolveGlue = (glue: Glue42.Glue | Glue42Web.API): Glue42.Glue | Glue42Web.API => {
    validateGlue(glue);
    (window as WindowType).glue = glue;

    return glue;
};

const setupGlue42Core = (): void => {
    (window as WindowType).fdc3GluePromise = GlueWebFactory()
        .then((glue) => {
            return resolveGlue(glue);
        });
};

const setupGlue42Enterprise = (): void => {
    (window as WindowType).fdc3GluePromise = waitFor<void>(() => typeof (window as WindowType).glue42gd !== "undefined", 300)
        .then(() => {
            // Whether to initialize glue or to reuse an existing instance.
            const shouldInitGlue = ((window as WindowType).glue42gd as Glue42GD).fdc3InitsGlue;

            if (shouldInitGlue) {
                // Use the auto-injected Glue factory function if available.
                const GlueFactory = (window as WindowType).Glue || Glue;

                return GlueFactory({
                    ...defaultGlueConfig,
                    appManager: "full"
                });
            } else {
                const predicate = (): boolean => {
                    const length = ((window as WindowType).glue42gd as Glue42GD).originalGlue?.instances?.length;

                    return typeof length !== "undefined" && length > 0;
                };

                return waitFor<Glue42.Glue>(predicate, 300, () => (((window as WindowType).glue42gd as Glue42GD).originalGlue as Glue42GDOriginalGlue).instances[0]);
            }
        })
        .then((glue) => {
            return resolveGlue(glue);
        });
};

const setupGlue = (): void => {
    if (isGlue42Core) {
        setupGlue42Core();
    } else {
        setupGlue42Enterprise();
    }
};

const fdc3Factory = (): DesktopAgent & { version: string } => {
    setupGlue();

    const agentApi = createDesktopAgent();

    return {
        ...agentApi,
        version
    };
};

export default fdc3Factory;
