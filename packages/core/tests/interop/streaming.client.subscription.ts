// tslint:disable:no-unused-expression
import { registerGenericStream } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

describe("Client subscription", () => {

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

    it("should fail if request is rejected by the server", (done) => {
        clientGlue.agm.subscribe(stream.name, { target: "best", arguments: { reject: true } })
            .then(() => {
                done("error - should not be in then");
            })
            .catch(() => {
                done();
            });
    });

    it("should succeed if request is accepted by the server", (done) => {
        clientGlue.agm.subscribe(stream.name, { target: "best" })
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("should fail if the stream does not exists", (done) => {
        clientGlue.agm.subscribe("fake-stream", { waitTimeoutMs: 1000 })
            .then(() => {
                done("should not be in then");
            })
            .catch(() => {
                done();
            });
    });

    it("has all properties as defined in the API", (done) => {
        clientGlue.agm.subscribe(stream.name, { arguments: { branch: "one" } })
            .then((subscription) => {
                expect(subscription.stream).to.not.be.undefined;
                expect(subscription.serverInstance).to.not.be.undefined;
                expect(subscription.requestArguments).to.not.be.undefined;
                expect(subscription.onClosed).to.not.be.undefined;
                expect(subscription.onFailed).to.not.be.undefined;
                expect(subscription.onData).to.not.be.undefined;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("can receive private data", (done) => {
        const privateData = { test: 1 };
        clientGlue.agm.subscribe(stream.name, { target: "best", arguments: { privateData } })
            .then((s) => {
                s.onData((streamData) => {
                    expect(streamData.data).to.deep.equal(privateData);
                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("can receive public data", (done) => {
        const publicData = { test: 1 };
        clientGlue.agm.subscribe(stream.name, { arguments: { publicData } })
            .then((s) => {
                s.onData((streamData) => {
                    expect(streamData.data.publicData).to.deep.equal(publicData);
                    // tslint:disable-next-line:no-console
                    console.log(streamData.data);
                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("receives close notification when closed from server side", (done) => {
        clientGlue.agm.subscribe(stream.name)
            .then((s) => {

                s.onClosed(() => {
                    done();
                });

                s.close();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("streamData has all properties as defined in the API", (done) => {
        const privateData = { test: 1 };
        const args = { privateData };
        clientGlue.agm.subscribe(stream.name, { arguments: args })
            .then((s) => {
                s.onData((streamData) => {
                    expect(streamData.data).to.deep.equal(privateData);
                    expect(streamData.server).to.not.be.undefined;
                    expect(streamData.requestArguments).to.to.deep.equal(args);

                    expect(streamData.private).to.not.be.undefined;

                    done();
                });
            })
            .catch((err) => {
                done(err);
            });
    });

    it("can pass onData in params", (done) => {
        const privateData = { test: 1 };
        const args = { privateData };
        const onData = (streamData: Glue42Core.Interop.StreamData) => {
            expect(streamData.data).to.deep.equal(privateData);
            expect(streamData.server).to.not.be.undefined;
            expect(streamData.requestArguments).to.to.deep.equal(args);

            expect(streamData.private).to.not.be.undefined;

            done();
        };

        clientGlue.agm.subscribe(stream.name, { arguments: args, onData });
    });

    it("can pass onClose in params", (done) => {
        const privateData = { test: 1 };
        const args = { privateData };
        const onClosed = () => {

            done();
        };

        clientGlue.agm.subscribe(stream.name, { arguments: args, onClosed }).then((s) => {
            s.close();
        });
    });
});
