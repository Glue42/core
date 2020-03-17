import { ready, gwObject } from "../initializer";
import CreateGlue from "../../src/index";
import { Glue42Core } from "../../glue";

let currentGlue: Glue42Core.GlueCore | undefined;
type cbk = (err: any, glue?: Glue42Core.GlueCore, config?: Glue42Core.Config) => void;

export async function init(callback: cbk, custom?: Glue42Core.Config, ext?: Glue42Core.Extension) {

    await ready.then();
    let config: Glue42Core.Config = {
        gateway: {
            protocolVersion: 3,
            inproc: {
                facade: gwObject
            }
        },
        auth: {
            username: "t42",
            password: "test"
        },
        logger: "error",
        application: "test-application"
    };

    if (custom) {
        config = custom;
    }

    try {
        currentGlue = await CreateGlue(config, ext);
        callback(undefined, currentGlue, config);
    } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err);
        callback(err);
    }
}

export function shutdown() {
    if (currentGlue) {
        currentGlue.done();
        currentGlue = undefined;
    }
}
