import { Logger } from "../../src/logger/logger";
import { waitForArr } from "../helpers";
import { GlueMock } from "../mock/glueMock";
import { Glue42Core } from "../../glue";

describe("logger", () => {

    it("can pass custom logger", async () => {
        const wf = waitForArr(["d", "e", "i", "w"], true);

        const customLogger = {
            debug: (message?: any, ...optionalParams: any[]) => {
                wf.fn("d");
            },
            error: (message?: any, ...optionalParams: any[]) => {
                wf.fn("e");
            },
            info: (message?: any, ...optionalParams: any[]) => {
                wf.fn("i");
            },
            log: (message?: any, ...optionalParams: any[]) => {
                wf.fn("l");
            },
            warn: (message?: any, ...optionalParams: any[]) => {
                wf.fn("w");
            },
        };

        const l = new Logger("main", undefined, customLogger);
        const sub = l.subLogger("p");
        const sub2 = sub.subLogger("p2");
        sub.debug("info");
        sub2.error("error");
        l.info("info");
        sub.warn("warn");
        return wf.promise;
    });

    it("published on interop when configured", async () => {
        const l = new Logger("main");
        const msg = "test";
        const gm = new GlueMock();
        const expectation = gm.interop.expectMethodToBeInvokedWith(Logger.InteropMethodName, [
            { level: "info", msg },
            { level: "warn", msg },
            { level: "error" }, // error will modify the msg, adding a stack trace
        ], "subset");
        Logger.Interop = (gm.interop as unknown as Glue42Core.Interop.API);
        l.publishLevel("info");

        l.info(msg);
        l.trace(msg);
        l.debug(msg);
        l.warn(msg);
        l.error(msg);

        return expectation;
    });
});
