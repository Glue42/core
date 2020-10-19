import createDesktopAgent from "./agent";
import Glue from "@glue42/desktop";
import GlueWebFactory from "@glue42/web";
import { getChannelsList, isEmptyObject, isGlue42Core } from "./utils";
import { version } from "../package.json";
import { FDC3 } from "../types";
import { WindowType } from "./windowtype";

const defaultGlueConfig = {
    application: (window as WindowType).fdc3AppName,
    context: true,
    intents: true,
    channels: true,
    agm: true
};

const patchSharedContexts = (): Promise<void> => {
    return new Promise((resolve) => {
        let interval: any;

        const callback = async (): Promise<void> => {
            const channels = await getChannelsList();

            if (channels.length === 0 || !isEmptyObject(channels[0])) {
                clearInterval(interval);
                resolve();
            }
        };

        interval = setInterval(callback, 300);

        callback();
    });
};

const setupGlue = (): void => {
    if (isGlue42Core) {
        (window as WindowType).gluePromise = GlueWebFactory({
            ...defaultGlueConfig,
            appManager: true
        })
            .then((glue) => {
                (window as WindowType).glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return (window as WindowType).glue;
            });
    } else {
        const waitGlue42GD = new Promise((resolve) => {
            let interval: any;

            const callback = (): void => {
                if ((window as WindowType).glue42gd) {
                    clearInterval(interval);
                    resolve();
                }
            };

            interval = setInterval(callback, 300);

            callback();
        });

        (window as WindowType).gluePromise = waitGlue42GD
            .then(() => {
                const GlueFactory = (window as WindowType).Glue || Glue;

                return GlueFactory({
                    ...defaultGlueConfig,
                    appManager: "full"
                });
            })
            .then((glue) => {
                (window as WindowType).glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return (window as WindowType).glue;
            });
    }
};

const fdc3Factory = (): FDC3.DesktopAgent & { version: string } => {
    setupGlue();

    const agentApi = createDesktopAgent();

    return {
        ...agentApi,
        version
    };
};

export default fdc3Factory;
