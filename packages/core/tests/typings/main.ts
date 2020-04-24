import { Logger } from "../../src/logger/logger";
import { waitForArr } from "../helpers";
import { GlueMock } from "../mock/glueMock";
import { Glue42Core } from "../../glue";
import Interop from "../../src/interop/interop";
import { createGlue, doneAllGlues } from "../initializer";

describe("typings - checks that d.ts works as expected, not real tests", () => {

    interface InputData {
        inner: object;
    }

    interface ReturnData {
        inner: object;
        error: string;
    }

    let glue: Glue42Core.GlueCore;
    before(async () => {
        glue = await createGlue();
    });

    after(() => {
        doneAllGlues();
    });

    it("interop.register", async () => {
        // register style 1
        glue.interop.register<InputData, ReturnData>("my-method", (data: InputData) => {
            return {
                inner: {},
                error: ""
            };
        });

        // register style 2
        glue.interop.register("my-method", (data: InputData) => {
            return {
                inner: {},
                error: ""
            };
        });

        return Promise.resolve();
    });

    it("interop.invoke", async () => {
        // invoke style 1
        const result = await glue.interop.invoke<ReturnData>("my-method");
        const inner = result.returned.inner;

        // invoke style 2
        const result2 = await glue.interop.invoke("my-method");
        const inner2 = result2.returned.inner;

        return Promise.resolve();
    });

    it("method.getServers should not be optional method", () => {
        const m = glue.interop.methods("a")[0];
        if (m) {
            const servers = m.getServers();
        }
    });

});
