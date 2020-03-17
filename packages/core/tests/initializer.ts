const GW = require("@glue42/ws-gateway");
import CreateGlue from "../src/index";
import { Glue42Core } from "../glue";

let glues: Glue42Core.GlueCore[] = [];
let id = 1;

const logLevel = "info";
export const defaultWSPort = 8385;
export const defaultWS = `ws://localhost:${defaultWSPort}/gw`;

const gwResult = startGW();
export const ready = gwResult.ready;
export const gwObject = gwResult.gw;

export function startGW() {
    const g = GW.create({ port: defaultWSPort });

    GW.configure_logging({
        level: "error",
        appender: (logInfo: any) => {
            const message = logInfo.output;
            const ll = logInfo.level;

            switch (ll) {
                case "trace":
                    // tslint:disable-next-line:no-console
                    console.info(message);
                    break;
                case "debug":
                    // tslint:disable-next-line:no-console
                    console.info(message);
                    break;
                case "info":
                    // tslint:disable-next-line:no-console
                    console.info(message);
                    break;
                case "warn":
                    // tslint:disable-next-line: no-console
                    console.warn(message);
                    break;
                case "error":
                    // tslint:disable-next-line:no-console
                    // console.error(message);
                    break;
            }
        }
    });

    const gwReady = g.start();
    return {
        ready: gwReady,
        gw: g
    };
}

export const createGlue = async (appName?: string, bus?: boolean) => {
    const gw = {
        protocolVersion: 3,
        ws: process.env.gateway || defaultWS
    };

    const authRequest = {
        username: process.env.username || "username",
        password: process.env.password || "password"
    };

    const useBus = typeof bus === "undefined" ? false : bus;
    const g = await CreateGlue({
        logger: logLevel,
        gateway: gw,
        auth: authRequest,
        application: appName || `test.case.${(new Date()).getTime()}.${id++}`,
        bus: useBus,
        metrics: false
    });

    glues.push(g);
    // tslint:disable-next-line:no-console
    console.log(`created glue ${g.config.application} id:${g.interop.instance.peerId}`);
    return g;
};

export const doneAllGlues = () => {
    const pr = glues.map((g) => g.done());
    glues = [];
    return Promise.all(pr);
};
