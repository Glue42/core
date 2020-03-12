// tslint:disable:no-unused-expression
import { registerGenericStream, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("Server subscription", () => {
    let serverGlue: Glue42Core.GlueCore;
    let clientGlue: Glue42Core.GlueCore;
    let stream: Glue42Core.Interop.Stream;

    beforeEach(async () => {
        [serverGlue, clientGlue] = await Promise.all([
            createGlue(), createGlue()
        ]);

        stream = await registerGenericStream(serverGlue);
    });

    afterEach(() => {
        doneAllGlues();
    });

    it("when pushing to specific subscription only it receives the update", (done) => {
        const fn = (subscription: Glue42Core.Interop.Subscription, shouldReceive: boolean) => {
            subscription.onData((streamData) => {
                if (!shouldReceive) {
                    done("should not received data");
                }
                if (streamData.data.a === 3) {
                    done();
                }
            });
        };

        // create two subscriptions, the first one should not receive data, the second one should
        clientGlue.agm.subscribe(stream.name)
            .then((s) => fn(s, false))
            .then(() => {
                clientGlue.agm.subscribe(stream.name, { arguments: { waitForSubsCount: 2, delayedPrivateData: { a: 3 } } })
                    .then((s) => fn(s, true))
                    .catch(done);
            })
            .catch(done);
    });

    it("has all properties as defined in the API", (done) => {
        clientGlue.agm.subscribe(stream.name, { arguments: { branch: "mybranch" } }).then(() => {
            setTimeout(() => {
                const subscription = stream.subscriptions()[0];
                expect(subscription.instance, "instance").to.not.be.undefined;
                expect(subscription.push, "push").to.not.be.undefined;
                expect(subscription.close, "close").to.not.be.undefined;
                expect(subscription.branchKey, "branch").to.not.be.undefined;
                expect(subscription.arguments, "arguments").to.not.be.undefined;
                expect(subscription.stream, "stream").to.not.be.undefined;
                done();
            }, 200);
        });
    });

    it("request has all properties as defined in the API", (done) => {
        let testStream: Glue42Core.Interop.Stream;
        const streamName = getMethodName();
        let attemptedSubscriptionOnce = false;

        clientGlue.agm.methodAdded((method) => {
            if (method.name === streamName && !attemptedSubscriptionOnce) {
                attemptedSubscriptionOnce = true;
                clientGlue.agm.subscribe(streamName, {
                    arguments: { branch: "mybranch" }
                });
            }
        });

        serverGlue.agm.createStream(streamName, {
            subscriptionRequestHandler(request) {
                expect(request.instance, "instance").to.not.be.undefined;
                expect(request.arguments, "arguments").to.not.be.undefined;
                expect(request.accept, "accept").to.not.be.undefined;
                expect(request.acceptOnBranch, "acceptOnBranch").to.not.be.undefined;
                expect(request.reject, "reject").to.not.be.undefined;

                testStream?.close();
                done();
            }
        }).then((s) => {
            testStream = s;
        }).catch((err) => {
            done(err);
        });
    });
});
