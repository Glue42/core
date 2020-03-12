import { compareInstance, waitFor, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";
import { dataStore } from "../data";
const deepEqual = require("deep-equal");

describe("invoke complex object data", () => {

    const methodName = getMethodName();

    let glue: Glue42Core.GlueCore;
    let serverGlue: Glue42Core.GlueCore;
    before(async () => {
        [glue, serverGlue] = await Promise.all([
            createGlue(),
            createGlue()
        ]);

        await serverGlue.agm.register(methodName, (args) => args);
    });

    after(() => {
        doneAllGlues();
    });

    dataStore.forEach((data, index) => {
        it(`methods should preserve data (${index})`, async () => {
            const invResult = await glue.agm.invoke(methodName, data);
            expect(invResult.returned).to.eql(data);
        });
    });

    it("streams should preserve data", function (done) {
        this.timeout(5000);
        let success = 0;

        const streamName = getMethodName();
        serverGlue.agm.createStream(streamName).then((s) => {
            glue.agm.subscribe(streamName).then((sub) => {
                sub.onData((streamData) => {

                    try {
                        const data = streamData.data;
                        if (!deepEqual(data.data, dataStore[data.key])) {
                            done("data not equal");
                        }
                        success++;
                        if (success === dataStore.length) {
                            done();
                        }
                    } catch (e) {
                        // tslint:disable-next-line:no-console
                        console.error(e);
                    }
                });

                // start pushing
                for (let index = 0; index < dataStore.length; index++) {
                    s.push({ data: dataStore[index], key: index });
                }
            });
        });
    });
});
