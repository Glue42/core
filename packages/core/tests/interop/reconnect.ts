import { getMethodName, waitFor } from "./helpers";
import { createGlue, doneAllGlues, gwObject, startGW } from "../initializer";
import { Glue42Core } from "../../glue";
import { PromiseWrapper } from "../../src/utils/pw";
import { waitForArr } from "../helpers";

describe("reconnect", () => {
    let glueClient: Glue42Core.GlueCore;
    let glueServer: Glue42Core.GlueCore;

    beforeEach(async () => {
        [glueClient, glueServer] = await Promise.all([
            createGlue(), createGlue()
        ]);
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("my interop instance is changed after reconnect", async () => {
        const pw = new PromiseWrapper();
        const serverInstance = Object.assign({}, glueServer.interop.instance);
        const compareInstances = (i1: Glue42Core.Interop.Instance, i2: Glue42Core.Interop.Instance) => {
            return i1.instance === i2.instance && i1.peerId === i2.peerId;
        };

        glueServer.connection.disconnected(() => {
            if (!compareInstances(serverInstance, glueServer.interop.instance)) {
                pw.reject(`received reject for unknown server instance`);
            }
        });

        let first = true;
        glueServer.connection.connected(() => {
            if (first) {
                if (!compareInstances(serverInstance, glueServer.interop.instance)) {
                    pw.reject("unexpected initial connect event");
                }
                first = false;
                return;
            }

            if (!compareInstances(serverInstance, glueServer.interop.instance)) {
                pw.resolve();
            } else {
                pw.reject("unexpected connect event");
            }
        });

        await glueServer.connection.reconnect();
        return pw.promise;
    });

    it("my interop method is re-published after reconnect", async () => {
        const name = getMethodName();
        const serverInstance = glueServer.interop.instance.instance;
        const waitForResult = waitForArr(["ma", "mr", "sr", "ma"], true);
        const waitForMethodAdded = waitForArr([1]);

        glueClient.interop.methodAdded((m) => {
            if (m.name === name) {
                waitForResult.fn("ma");
                waitForMethodAdded.fn(1);
            }
        });

        glueClient.interop.methodRemoved((m) => {
            if (m.name === name) {
                waitForResult.fn("mr");
            }
        });

        glueClient.interop.serverRemoved((s) => {
            if (s.instance === serverInstance) {
                waitForResult.fn("sr");
            }
        });

        await glueServer.interop.register(name, () => {
            // TODO - do nothing
        });

        await waitForMethodAdded.promise;

        await Promise.all([
            glueServer.connection.reconnect(),
            glueClient.connection.reconnect()]);

        await waitForResult.promise;

        return Promise.resolve();
    });

    it("my interop method handler is invoked after reconnect", async () => {
        const name = getMethodName();
        glueServer.interop.register(name, () => {
            return { a: 1 };
        });

        Promise.all([
            glueServer.connection.reconnect(),
            glueClient.connection.reconnect()]);

        const result = await glueClient.interop.invoke(name, {});
        if (result.returned.a !== 1) {
            throw new Error(`invalid response`);
        }
    });

    it("server and client can see each other after reconnect", (done) => {
        const name = getMethodName();
        glueServer.interop.register(name, () => {
            // Do nothing
        });

        Promise.all([
            glueServer.connection.reconnect(),
            glueClient.connection.reconnect()]);

        setTimeout(() => {
            let ok = 0;
            glueServer.interop.serverAdded((s) => {
                ok++;
                if (ok === 2) {
                    done();
                }
            });

            glueClient.interop.serverAdded((d) => {
                ok++;
                if (ok === 2) {
                    done();
                }
            });
        }, 1500);
    });

    it("my subscription is re-established after client reconnect", async () => {
        const name = getMethodName();
        const pw = new PromiseWrapper<void>();
        let events = 0;
        const stream = await glueServer.interop.createStream(name, {
            subscriptionAddedHandler: (s) => {
                stream.push({ events: ++events });
            }
        });

        const sub = await glueClient.interop.subscribe(name);
        sub.onData((data) => {
            if (data.data.events === 2) {
                pw.resolve();
            }
        });
        await glueClient.connection.reconnect();

        return pw.promise;
    });

    it("onConnected event is fired after initial connect and after reconnect", async () => {
        const name = getMethodName();
        await glueServer.interop.createStream(name);
        const wf = waitForArr([false, true], true);
        await glueClient.interop.subscribe(name, {
            onConnected: (_server, reconnect) => {
                wf.fn(reconnect);
                if (!reconnect) {
                    // trigger reconnect
                    glueClient.connection.reconnect();
                }
            }
        });

        return wf.promise;
    });

    it("my stream is republished after reconnect", async () => {
        const name = getMethodName();
        await glueServer.interop.createStream(name, {
            subscriptionAddedHandler: () => {
                // TODO
            },
            subscriptionRemovedHandler: () => {
                // TODO
            },
            subscriptionRequestHandler: () => {
                // TODO
            }
        });

        const pw = new PromiseWrapper();
        let events = 0;
        glueClient.interop.methodAdded((m) => {
            if (m.name === name && m.supportsStreaming) {
                events++;
                if (events === 2) {
                    pw.resolve();
                }
            }
        });

        await Promise.all([
            glueServer.connection.reconnect(),
            glueClient.connection.reconnect()]);

        return pw.promise;
    });

    it("my subscription is re-established after client&server reconnect", async () => {
        const name = getMethodName();
        const wfSubscriptionAddedHandler = waitForArr([true, true]);
        const wfOnData = waitForArr([true, true]);
        let events = 0;
        const stream = await glueServer.interop.createStream(name, {
            subscriptionAddedHandler: (_s) => {
                wfSubscriptionAddedHandler.fn(true);
                stream.push({ events: ++events });
            }
        });

        const sub = await glueClient.interop.subscribe(name);
        sub.onData((_d) => {
            wfOnData.fn(true);
        });

        await Promise.all([
            glueClient.connection.reconnect(),
            glueServer.connection.reconnect()
        ]);

        return Promise.all([
            wfOnData.promise,
            wfSubscriptionAddedHandler.promise]);
    });

    it("ws restart - my subscription is re-established after client&server reconnect", async () => {
        const name = getMethodName();
        const wfSubscriptionAddedHandler = waitForArr([true, true]);
        const wfOnData = waitForArr([true, true]);
        let events = 0;
        const stream = await glueServer.interop.createStream(name, {
            subscriptionAddedHandler: (_s) => {
                wfSubscriptionAddedHandler.fn(true);
                stream.push({ events: ++events });
            }
        });

        const sub = await glueClient.interop.subscribe(name);
        sub.onData((_d) => {
            wfOnData.fn(true);
        });

        await gwObject.stop();
        await startGW();

        return Promise.all([
            wfOnData.promise,
            wfSubscriptionAddedHandler.promise]);
    });

});
