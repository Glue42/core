import { compareInstance, waitFor, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
/**
 * Verifies that agm receives events about it's own actions
 */
describe("events from myself", () => {
    let glue!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
    });

    afterEach(() => {
        doneAllGlues();
    });

    it("when I register a method I received method added event", (done) => {
        const name = getMethodName();

        glue.agm.register(name, () => {
            // DO NOTHING
        });

        const callDone = waitFor(2, done);

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodAdded((addition) => {

            const server = addition.server;
            const method = addition.method;

            if (compareInstance(glue.agm.instance, server) && method?.name === name) {
                callDone();
            }
        });
    });

    it("when I unregister a method I received method removed event", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        glue.agm.methodRemoved((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodRemoved((removal) => {
            const server = removal.server;
            const method = removal.method;

            if (compareInstance(server, glue.agm.instance) && method?.name === name) {
                callDone();
            }
        });

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                glue.agm.unregister(name);
            }
        });

        glue.agm.register(name, () => {
            // DO NOTHING
        });
    });

    it("when I register a stream I received method added event", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodAdded((addition) => {

            const server = addition.server;
            const method = addition.method;

            if (compareInstance(glue.agm.instance, server) && method?.name === name) {
                callDone();
            }
        });

        glue.agm.createStream(name);
    });

    it("when I unregister a stream I received method removed event", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        glue.agm.methodRemoved((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodRemoved((removal) => {
            const server = removal.server;
            const method = removal.method;

            if (compareInstance(server, glue.agm.instance) && method?.name === name) {
                callDone();
            }
        });

        glue.agm.createStream(name).then((s) => {
            s.close();
        });
    });

    it("when I start I receive serverAdded about myself", (done) => {
        glue.agm.serverAdded((server) => {
            if (compareInstance(server, glue.agm.instance)) {
                done();
            }
        });
    });
});
