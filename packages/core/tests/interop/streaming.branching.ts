// tslint:disable:no-unused-expression
import { unregisterGenericStream, waitFor, registerGenericStream, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("Branching", () => {
    let serverGlue: Glue42Core.GlueCore;
    let clientGlue: Glue42Core.GlueCore;
    let stream: Glue42Core.Interop.Stream;

    beforeEach(async () => {
        [serverGlue, clientGlue] = await Promise.all([
            createGlue(), createGlue()
        ]);

        await registerGenericStream(serverGlue)
            .then((s) => {
                stream = s;
            });
    });

    afterEach(() => {
        unregisterGenericStream();
        doneAllGlues();
    });

    it("subscriber on a branch should receive data pushed on that branch", (done) => {
        const myBranchData = { a: 1 };
        const branchData = { mybranch: myBranchData };

        clientGlue.agm.subscribe(stream.name, { arguments: { branch: "mybranch", branchData } })
            .then((subscription) => {
                subscription.onData((streamData) => {
                    expect(streamData.data.branchData).to.deep.equal(myBranchData);
                    subscription.close();
                    done();
                });

            })
            .catch((err) => {
                done(err);
            });
    });

    it("subscriber on a branch should not receive data pushed on another branch", (done) => {
        const myBranchData = { a: 1 };
        const branchData = { otherBranch: myBranchData }; // this will trigger pushing on otherBranch
        clientGlue.agm.subscribe(stream.name, { arguments: { branch: "mybranch", branchData } })
            .then((subscription) => {
                subscription.onData((streamData) => {
                    done("failed - got some data");
                });

                setTimeout(() => {
                    subscription.close();
                    done();
                }, 1000);
            })
            .catch((err) => {
                done(err);
            });
    });

    it("subscriber on a branch should receive data pushed without branch", (done) => {
        const publicData = { test: 1 };
        clientGlue.agm.subscribe(stream.name, { arguments: { publicData } })
            .then((subscription) => {
                subscription.onData((streamData) => {
                    expect(streamData.data.publicData).to.deep.equal(publicData);
                    subscription.close();
                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("pushing on branch object goes to all subscribers on that branch", (done) => {
        const numberOfSubscribers = 3;
        const ready = waitFor(numberOfSubscribers, done);

        function fn(subscription: Glue42Core.Interop.Subscription) {

            // attach the handler
            subscription.onData(() => {
                ready();
            });
        }

        for (let p = 0; p < numberOfSubscribers; p++) {
            clientGlue.agm.subscribe(stream.name, {
                arguments: {
                    branch: "br",
                    waitForSubsCount: numberOfSubscribers,
                    delayedData: { a: 1 }
                }
            }).then(fn);
        }
    });

    it("branch has all properties as defined in the API", (done) => {
        clientGlue.agm.subscribe(stream.name, { arguments: { branch: "mybranch", publicData: { e: 5 } } })
            .then((sub) => {
                // wait for data to arrive, indicating the server has added the subscription
                sub.onData(() => {
                    const branch = stream.branches()[0];
                    expect(branch.key).to.not.be.undefined;
                    expect(branch.subscriptions).to.not.be.undefined;
                    expect(branch.close).to.not.be.undefined;
                    expect(branch.push).to.not.be.undefined;
                    sub.close();
                    done();
                });
            });
    });

    it("should return stream that has 0 branches", (done) => {
        const name = getMethodName();
        const methodDefinition = {
            name,
        };

        serverGlue.agm.createStream(methodDefinition).then((s) => {
            try {
                expect(s.branches().length).to.eql(0);
                done();
            } catch (e) {
                done(e);
            }
        }).catch(done);
    });
});
