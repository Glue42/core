// tslint:disable:no-unused-expression
import { waitFor, registerGenericStream, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("Server stream", function () {

    let serverGlue: Glue42Core.GlueCore;
    let clientGlue: Glue42Core.GlueCore;
    let stream: Glue42Core.Interop.Stream;

    this.timeout(5000);

    beforeEach(async () => {
        [serverGlue, clientGlue] = await Promise.all([
            createGlue(), createGlue()
        ]);

        stream = await registerGenericStream(serverGlue);
    });

    afterEach(() => {
        doneAllGlues();
    });

    it("keeps correct list of branches and subscriptions", (done) => {
        // we have the stream object here
        expect(stream.subscriptions().length).to.be.equal(0);
        expect((stream.branches() as Glue42Core.Interop.StreamBranch[]).length).to.be.equal(0);

        // add one subscriber on the main branch
        const pr1 = clientGlue.agm.subscribe(stream.name);
        // and one more
        const pr2 = clientGlue.agm.subscribe(stream.name);
        // and one on branch br
        const pr3 = clientGlue.agm.subscribe(stream.name, { arguments: { branch: "br" } });

        Promise.all([pr1, pr2, pr3]).then(() => {
            // we have the stream object here
            expect(stream.branches().length).to.be.equal(2);
            expect(stream.branches()[0].key).to.be.equal("");
            expect(stream.branches()[1].key).to.be.equal("br");
            expect(stream.subscriptions().length).to.be.equal(3);
            done();
        });
    });

    it("can push data to all", (done) => {
        const data = waitFor(2, done);
        const fn = (subscription: Glue42Core.Interop.Subscription) => {
            let aggregated = 0;
            subscription.onData((streamData) => {
                aggregated += streamData.data.a;
                if (aggregated === 8) {
                    data();
                }
            });
        };

        // create two subscriptions
        const p1 = clientGlue.agm.subscribe(stream.name).then(fn);
        const p2 = clientGlue.agm.subscribe(stream.name).then(fn);

        Promise.all([p1, p2]).then(() => {
            // push two times
            stream.push({ a: 5 });
            stream.push({ a: 3 });
        });
    });

    it("can push to specific subscriptions", (done) => {
        let aggregated = 0;
        const fn = (subscription: Glue42Core.Interop.Subscription, shouldReceive: boolean) => {
            subscription.onData((streamData) => {
                if (!shouldReceive) {
                    throw new Error(`subscription ${subscription} should not receive data`);
                }
                aggregated += streamData.data.a;
                if (aggregated === 8) {
                    done();
                }
            });
        };

        // create two subscriptions for that
        // first one should not receive data
        const p1 = clientGlue.agm.subscribe(stream.name).then((s) => fn(s, false));

        // second one should get data
        const p2 = clientGlue.agm.subscribe(stream.name, { arguments: { second: true } }).then((s) => fn(s, true));

        Promise.all([p1, p2]).then(() => {
            stream.subscriptions().filter((s) => {
                if (s.arguments) {
                    s.push({ a: 3 });
                    s.push({ a: 5 });
                }
            });
        });
    });

    // it('push method arguments checks', function (done) {

    //     agm.createStream((new Date()).getTime() + "")
    //         .then(function (stream) {
    //             // branches not array or string
    //             var branchesNotArrayOrString = function () {
    //                 stream.push({ a: 1 }, 1);
    //             };
    //             expect(branchesNotArrayOrString).to.throw(Error);

    //             var argumentsNotObject = function () {
    //                 stream.push(22);
    //             };
    //             expect(argumentsNotObject).to.throw(Error);

    //             stream.close();
    //             done();
    //         })
    //         .catch(function (err) {
    //             done(err);
    //         });
    // });

    it("has all properties as defined in the API", () => {
        expect(stream.name).to.not.be.undefined;
        expect(stream.definition).to.not.be.undefined;
        expect(stream.subscriptions).to.not.be.undefined;
        expect(stream.branches).to.not.be.undefined;
        expect(stream.push).to.not.be.undefined;
        expect(stream.close).to.not.be.undefined;
    });

    it("createStream() should create a stream with a working subscriptionRemovedHandler (streamOptions).", (done) => {
        const methodDefinition = {
            name: getMethodName()
        };

        serverGlue.agm.createStream(methodDefinition, {
            subscriptionRemovedHandler: () => {
                done();
            }
        }).then((s) => {
            clientGlue.agm.subscribe(s)
                .then((subscription) => {
                    subscription.close();
                });
        }).catch(done);
    });

    it("subscribe should trigger the provided on registration subscriptionRequestHandler", (done) => {
        const name = getMethodName();
        const methodDefinition = {
            name,
        };
        const subscriptionRequestHandler = (request: { accept: () => void; }) => {
            done();
            request.accept();
        };

        serverGlue.agm.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((s) => {
            clientGlue.agm.subscribe(s);
        });
    });

    it("subscribe should trigger the provided on registration subscriptionAddedHandler", (done) => {
        const name = getMethodName();
        const methodDefinition = {
            name,
        };
        const subscriptionAddedHandler = () => done();

        serverGlue.agm.createStream(methodDefinition, {
            subscriptionAddedHandler,
        }).then((s) => {
            clientGlue.agm.subscribe(s);
        });
    });

});
