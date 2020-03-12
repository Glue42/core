import { getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("methods.async", function () {

    let glueClient: Glue42Core.GlueCore;
    let glueServer: Glue42Core.GlueCore;

    before(async () => {
        this.timeout(5000);

        [glueClient, glueServer] = await Promise.all([
            createGlue(), createGlue()
        ]);
    });

    after(() => {
        doneAllGlues();
    });

    it("async methods can return promise", async () => {
        const methodName = getMethodName();
        glueServer.agm.registerAsync(methodName, () => {
            return Promise.resolve({ result: 42 });
        });

        const result = await glueClient.agm.invoke(methodName);
        expect(result.returned.result).to.be.eq(42);
    });

    it("async methods that invoke the callback and return promise are handled correctly", async () => {
        const methodName = getMethodName();
        glueServer.agm.registerAsync(methodName, (args, caller, success) => {
            success({ result: 42 });
            return Promise.resolve({ result: 43 });
        });

        const result = await glueClient.agm.invoke(methodName);
        expect(result.returned.result).to.be.eq(42);
    });

    it("async methods that reject promises result in invocation error", async () => {
        const methodName = getMethodName();
        glueServer.agm.registerAsync(methodName, () => {
            return Promise.reject("error message");
        });

        try {
            await glueClient.agm.invoke(methodName);
            return Promise.reject();
        } catch (err) {
            return Promise.resolve();
        }
    });

    it("normal methods can return promise", async () => {
        const methodName = getMethodName();
        glueServer.agm.register(methodName, () => {
            return Promise.resolve({ result: 42 });
        });

        const result = await glueClient.agm.invoke(methodName);
        expect(result.returned.result).to.be.equal(42);
    });

    it("normal methods that reject promises result in invocation error", async () => {
        const methodName = getMethodName();
        glueServer.agm.register(methodName, () => {
            return Promise.reject("error message");
        });

        try {
            await glueClient.agm.invoke(methodName);
            return Promise.reject();
        } catch (err) {
            return Promise.resolve();
        }
    });
});
