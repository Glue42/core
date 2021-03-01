import createDesktopAgent from "./agent";
import Glue, { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { isGlue42Core, waitFor, fetchTimeout } from "./utils";
import { version } from "../package.json";
import { WindowType } from "./types/windowtype";
import { Glue42GD, Glue42GDOriginalGlue } from "./types/glue42gd";
import WebPlatformFactory, { Glue42WebPlatform } from "@glue42/web-platform";
import { Glue42FDC3DesktopAgent } from "./types/glue42FDC3DesktopAgent";

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
    const webPlatformConfig = (window as WindowType).webPlatformConfig;
    const webClientConfig: Glue42WebPlatform.Config = {
        clientOnly: true
    };
    const platformMode = typeof webPlatformConfig !== "undefined";

    (window as WindowType).fdc3GluePromise = WebPlatformFactory(platformMode ? webPlatformConfig : webClientConfig)
        .then(({ glue }) => {
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
                    channels: true,
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

const connectToRemoteSources = (): void => {
    if (isGlue42Core) {
        (window as WindowType).fdc3GluePromise.then(() => {
            const validRemoteSources = (window as WindowType).remoteSources?.filter((remoteSource) => typeof remoteSource.url === "string" && remoteSource.url !== "") || [];

            for (const remoteSource of validRemoteSources) {
                const DEFAULT_POLLING_INTERVAL = 3000;
                const DEFAULT_REQUEST_TIMEOUT = 3000;

                const url = remoteSource.url;

                const appsFetch = async (): Promise<void> => {
                    const response = await fetchTimeout(url, remoteSource.requestTimeout || DEFAULT_REQUEST_TIMEOUT);
                    const json = (await response.json()) as { message: string; applications: Array<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition> };

                    if (json.message === "OK") {
                        // Import also works with FDC3Definitions even though the typings say otherwise.
                        ((window as WindowType).glue as Glue42Web.API).appManager.inMemory?.import?.((json.applications as Array<Glue42Web.AppManager.Definition>), "merge");
                    }
                };

                setInterval(() => appsFetch().catch(console.warn), remoteSource.pollingInterval || DEFAULT_POLLING_INTERVAL);
            }
        });
    } else {
        console.warn("The app definitions from the remoteSource are only fetched when running inside of Glue42 Core. Please refer to the G4E documentation (https://docs.glue42.com/getting-started/fdc3-compliance/index.html#fdc3_for_glue42_enterprise-app_directory).");
    }
};

const fdc3Factory = (): Glue42FDC3DesktopAgent => {
    setupGlue();

    connectToRemoteSources();

    const agentApi = createDesktopAgent();

    return {
        ...agentApi,
        version
    };
};

export default fdc3Factory;
