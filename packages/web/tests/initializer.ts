import glueWebFactory from "../src/index";
import { Glue42Web } from "../web";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GW = require("@glue42/ws-gateway");

let glues: Glue42Web.API[] = [];

GW.configure_logging({
    level: "fatal"
});

const facade = GW.create({ port: 8080 });

export function startGateway(): Promise<boolean> {
    return facade.start();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stopGateway(): Promise<any> {
    return facade.stop();
}

export function createGlue(channels?: boolean): Promise<Glue42Web.API> {
    return glueWebFactory({
        inproc: {
            facade
        },
        channels: channels
    }).then((glue: Glue42Web.API) => {
        glues.push(glue);
        return glue;
    });
}

export function doneAllGlues(): void {
    glues.forEach((g) => {
        g.connection.logout();
    });
    glues = [];
}
