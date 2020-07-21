import createDesktopAgent from "./agent";
import Glue, { Glue42 } from "@glue42/desktop";
import GlueWebFactory, { Glue42Web } from "@glue42/web";
import { isGlue42Core, decorateContextApi } from "./utils";
import { version } from "../package.json";
import { FDC3 } from "../types";

declare global {
    interface Window {
        glue: Glue42.Glue | Glue42Web.API;
        gluePromise: Promise<Glue42.Glue | Glue42Web.API>;
        glue42gd?: Glue42.GDObject;
    }
}

const defaultGlueConfig = {
    appManager: true,
    context: true,
    intents: true,
    channels: true,
    agm: true
};

const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const patchSharedContexts = (): Promise<void> => {
    return new Promise((resolve) => {
        let interval: any;

        const callback = async (): Promise<void> => {
            const channels = await window.glue.channels.list();

            if (channels.length === 0 || !isEmptyObject(channels[0])) {
                clearInterval(interval);
                resolve();
            }
        };

        interval = setInterval(callback, 300);

        callback();
    });
};

const setupGlue = (clientGlueConfig?: Glue42.Config): void => {
    if (isGlue42Core) {
        window.gluePromise = GlueWebFactory(defaultGlueConfig)
            .then((g) => {
                const glue = decorateContextApi(g);
                window.glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return window.glue;
            });
    } else {
        const waitGlue42GD = new Promise((resolve) => {
            let interval: any;

            const callback = (): void => {
                if (window.glue42gd) {
                    clearInterval(interval);
                    resolve();
                }
            };

            interval = setInterval(callback, 300);

            callback();
        });

        window.gluePromise = waitGlue42GD
            .then(() => Glue(clientGlueConfig || defaultGlueConfig))
            .then((g) => {
                const glue = decorateContextApi(g);
                window.glue = glue;

                return patchSharedContexts();
            })
            .then(() => {
                return window.glue;
            });
    }
};

const fdc3 = (): FDC3.DesktopAgent & { version: string } => {
    setupGlue();

    const agentApi = createDesktopAgent();

    return {
        ...agentApi,
        version
    };
};

const whatToExpose = fdc3();
(window as any).fdc3 = whatToExpose;
(whatToExpose as any).default = whatToExpose;

export default whatToExpose;
