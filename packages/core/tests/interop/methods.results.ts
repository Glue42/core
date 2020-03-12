// tslint:disable:no-unused-expression
import { getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("invoke results", () => {

    const methodName = getMethodName();
    let shouldServer1Fail = false;
    let shouldServer2Fail = false;
    let glueClient: Glue42Core.GlueCore;
    let glueServer: Glue42Core.GlueCore;
    let glueServer2: Glue42Core.GlueCore;

    afterEach(() => {
        shouldServer1Fail = false;
        shouldServer2Fail = false;
    });

    before(async function () {
        this.timeout(5000);
        [glueClient, glueServer, glueServer2] = await Promise.all([
            createGlue(), createGlue(), createGlue()
        ]);

        await glueServer.agm.register(methodName, () => {
            if (shouldServer1Fail) {
                throw new Error("server 1 error");
            }
            return { test: 42 };
        });

        await glueServer2.agm.register(methodName, () => {
            if (shouldServer2Fail) {
                throw new Error("server 2 error");
            }
            return { test: 43 };
        });
    });

    after(() => {
        doneAllGlues();
    });

    it("the result of invoking a method on a server should have correct structure", (done) => {
        glueClient.agm.invoke(methodName, { arg: 124 }).then((result) => {
            validateResult(result, methodName, 124);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("multiple servers - when one fails, invoke should resolve and have correct structure", (done) => {
        shouldServer2Fail = true;
        glueClient.agm.invoke(methodName, { arg: 124 }, "all").then((result) => {
            // validate top level structure
            validateResult(result, methodName, 124);

            if (!result.all_return_values) {
                throw new Error("all_return_values missing");
            }

            if (!result.all_errors) {
                throw new Error("all_errors missing");
            }

            // validate all_return_values
            expect(result.all_return_values.length).to.be.eq(1);

            // validate inner result structures
            result.all_return_values.forEach((inner) => {
                validateInnerResult(inner);
            });

            expect(result.all_errors.length).to.be.eq(1);
            expect(result.all_errors[0].message).to.be.eq("server 2 error");

            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("multiple servers - when all fail, invoke should reject and have the correct structure", (done) => {
        shouldServer1Fail = true;
        shouldServer2Fail = true;
        glueClient.agm.invoke(methodName, { arg: 124 }, "all").then((result) => {
            done("should not resolve");
        }).catch((result) => {
            // validate all_return_values
            expect(result.all_errors.length).to.be.eq(2);
            const msgMap = result.all_errors.map((e: any) => e.message);
            expect(msgMap).to.contain("server 1 error");
            expect(msgMap).to.contain("server 2 error");

            expect(result.called_with).to.not.be.undefined;
            expect(result.message).to.not.be.undefined;

            done();
        });
    });

    it("multiple servers - the result should have correct structure", (done) => {
        glueClient.agm.invoke(methodName, { arg: 124 }, "all").then((result) => {
            validateResult(result, methodName, 124);
            result.all_return_values?.forEach((inner) => {
                validateInnerResult(inner);
            });
            done();
        }).catch((err) => {
            done(err);
        });
    });

    function validateResult(result: Glue42Core.Interop.InvocationResult<any>, m: string, calledWith: any) {
        expect(result.method.name).to.equal(m);
        expect(result.called_with.arg).to.equal(calledWith);
        validateInnerResult(result);
    }

    function validateInnerResult(result: Glue42Core.Interop.InvocationResult<any>) {
        expect(result.returned.test, "test").to.not.be.undefined;
        expect(result.executed_by?.application, "application").to.not.be.undefined;
        expect(result.executed_by?.instance, "instance").to.not.be.undefined;
    }
});
