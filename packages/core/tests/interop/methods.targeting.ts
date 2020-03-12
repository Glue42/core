// tslint:disable:no-unused-expression
import { getMethodName, waitFor } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("invoke targeting", function () {

    const methodName = getMethodName();
    let invoked = 0;
    let glue: Glue42Core.GlueCore;
    let glue1: Glue42Core.GlueCore;
    let glue2: Glue42Core.GlueCore;

    before(async () => {
        this.timeout(5000);

        [glue, glue1, glue2] = await Promise.all([
            createGlue(), createGlue(), createGlue()
        ]);

        await glue1.agm.register(methodName, () => {
            invoked++;
            return { index: 1 };
        });

        await glue2.agm.register(methodName, () => {
            invoked++;
            return { index: 2 };
        });
    });

    afterEach(() => {
        invoked = 0;
    });

    after(() => {
        doneAllGlues();
    });

    it("invoking a method with best should reach one of the servers only", (done) => {
        glue.agm.invoke(methodName, {}, "best").then(() => {
            expect(invoked).to.equal(1);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("invoking a method with all should reach all servers", (done) => {
        glue.agm.invoke(methodName, {}, "all").then((result) => {
            expect(invoked).to.equal(2);

            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("invokes a method with specific instance", (done) => {
        const ready = waitFor(2, done);

        glue.agm.invoke(methodName, {}, { instance: glue1.agm.instance.instance })
            .then((answer) => {
                expect(answer.returned.index).to.equal(1);
                ready();
            }).catch((err) => {
                done(err);
            });

        glue.agm.invoke(methodName, {}, { instance: glue2.agm.instance.instance })
            .then((answer) => {
                expect(answer.returned.index).to.equal(2);
                ready();
            }).catch((err) => {
                done(err);
            });
    });

    it("fails for a non-existing method", (done) => {
        glue.agm.invoke("Tick21.NoHaveSuchMethod", {}, "best", { waitTimeoutMs: 500 })
            .then(() => {
                done(new Error("Should not have executed anything"));
            })
            .catch((err) => {
                done();
            });
    });

    it("Should only call a specific instance when only that instance's sync method is called.", (done) => {
        const uniqueMethodName = getMethodName();
        glue.agm.register(uniqueMethodName, () => {
            // DO NOTHING
        });
        glue.agm.invoke(uniqueMethodName, { t: 42 }, glue.agm.instance)
            .then((res) => {
                if (!res.all_return_values) {
                    done("all_return_values missing");
                    return;
                }
                expect(res.all_return_values.length).to.eql(1);

                const calledApplication = res.all_return_values[0].executed_by?.application;
                const expectedApplication = glue.agm.instance.application;

                expect(calledApplication).to.eql(expectedApplication);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should reach only one of the servers when invoking method with 'best'", (done) => {
        const uniqueMethodName = getMethodName();
        glue.agm.register(uniqueMethodName, (args) => {
            return args;
        });
        glue1.agm.invoke(uniqueMethodName, { t: 42 }, "best")
            .then((res) => {
                expect(res.all_return_values?.length).to.eql(1);
                expect(res.returned).to.eql({
                    t: 42
                });

                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
