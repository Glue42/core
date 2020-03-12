import { createGlue, doneAllGlues } from "../initializer";
import { expect } from "chai";

describe("bus", () => {
    afterEach(async () => {
        await doneAllGlues();
    });

    it("publish and subscribe for messages from everyone", (done) => {
        Promise.all([
            createGlue("publisherApp1", true),
            createGlue("subscriberApp1", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp.bus.subscribe("cars", (data, topic, source) => {
                expect(data).to.eql({ maker: "bmw" });
                expect(topic).to.equal("cars");
                expect(source.application).to.equal("publisherApp1");
                done();
            }).then(() => {
                publisherApp.bus.publish("cars", { maker: "bmw" });
            });
        });
    });

    it("publish and subscribe for messages from specific app", (done) => {
        Promise.all([
            createGlue("publisherApp2", true),
            createGlue("subscriberApp2", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp.bus.subscribe("cars", (data, topic, source) => {
                expect(data).to.eql({ maker: "bmw" });
                expect(topic).to.equal("cars");
                expect(source.application).to.equal("publisherApp2");
                done();
            }, { target: { application: "publisherApp2" } }).then(() => {
                publisherApp.bus.publish("cars", { maker: "bmw" }, { target: { application: "subscriberApp2" } });
            });
        });
    });

    it("publish and subscribe for messages with specific routing key", (done) => {
        Promise.all([
            createGlue("publisherApp3", true),
            createGlue("subscriberApp3", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp?.bus.subscribe("cars", (data, topic, source) => {
                expect(data).to.eql({ maker: "bmw" });
                expect(topic).to.equal("cars");
                expect(source.application).to.equal("publisherApp3");
                done();
            }, { routingKey: "key" }).then(() => {
                publisherApp?.bus.publish("cars", { maker: "bmw" }, { routingKey: "key" });
            });
        });
    });

    it("publish a message with routing key and receiving it in subscription without routing key", (done) => {
        Promise.all([
            createGlue("publisherApp4", true),
            createGlue("subscriberApp4", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp?.bus.subscribe("cars", (data, topic, source) => {
                expect(data).to.eql({ maker: "bmw" });
                expect(topic).to.equal("cars");
                expect(source.application).to.equal("publisherApp4");
                done();
            }).then(() => {
                publisherApp?.bus.publish("cars", { maker: "bmw" }, { routingKey: "key" });
            });
        });
    });

    it("publish a message with without key and receiving it in subscription with routing key", (done) => {
        Promise.all([
            createGlue("publisherApp5", true),
            createGlue("subscriberApp5", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp?.bus.subscribe("cars", (data, topic, source) => {
                expect(data).to.eql({ maker: "bmw" });
                expect(topic).to.equal("cars");
                expect(source.application).to.equal("publisherApp5");
                done();
            }, { routingKey: "key" }).then(() => {
                publisherApp?.bus.publish("cars", { maker: "bmw" });
            });
        });
    });

    it("not receiving messages when routing keys do not match", (done) => {
        let callbackCalled = false;
        Promise.all([
            createGlue("publisherApp6", true),
            createGlue("subscriberApp6", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp?.bus.subscribe("cars", () => {
                callbackCalled = true;
            }, { routingKey: "key1" }).then(() => {
                publisherApp?.bus.publish("cars", { maker: "bmw" }, { routingKey: "key2" });
            });
        });

        setTimeout(() => {
            expect(callbackCalled).to.equal(false);
            done();
        }, 1000);
    });

    it("not receiving messages when targets do not match", (done) => {
        let callbackCalled = false;
        Promise.all([
            createGlue("publisherApp7", true),
            createGlue("subscriberApp7", true)
        ]).then(([publisherApp, subscriberApp]) => {
            subscriberApp?.bus.subscribe("cars", () => {
                callbackCalled = true;
            }).then(() => {
                publisherApp?.bus.publish("cars", { maker: "bmw" }, { target: { application: "no-existing-app" } });
            });
        });

        setTimeout(() => {
            expect(callbackCalled).to.equal(false);
            done();
        }, 1000);
    });
});
