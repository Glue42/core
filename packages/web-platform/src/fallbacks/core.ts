import { Glue42CoreMessageTypes } from "../common/constants";
import { defaultOpenerTimeoutMs } from "../common/defaultConfig";

export const checkIsOpenerGlue = (): Promise<boolean> => {
    if (!window.opener) {
        return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pingListener = (event: MessageEvent<any>): void => {
            const data = event.data?.glue42core;

            if (!data || data.type !== Glue42CoreMessageTypes.platformReady.name) {
                return;
            }

            window.removeEventListener("message", pingListener);

            resolve(true);
        };

        window.addEventListener("message", pingListener);

        const message = {
            glue42core: {
                type: Glue42CoreMessageTypes.platformPing.name
            }
        };

        (window.opener as Window).postMessage(message, "*");

        setTimeout(() => resolve(false), defaultOpenerTimeoutMs);
    });
};
