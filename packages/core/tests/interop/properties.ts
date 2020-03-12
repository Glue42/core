import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";

describe("properties", function () {
    let glue!: Glue42Core.GlueCore;
    let glueOther!: Glue42Core.GlueCore;

    beforeEach(async () => {
        [glue, glueOther] = await Promise.all([
            createGlue(), createGlue()
        ]);
    });

    afterEach(() => {
        doneAllGlues();
    });

    this.timeout(5000);

    describe("instance", () => {
        it("AGM should exist when glue is initialized", () => {
            expect(glue.agm).to.not.be.undefined;
            expect(glue.interop).to.not.be.undefined;
        });

        it("AGM should should contain all properties defined in the API", () => {
            const {
                interop
            } = glue;
            expect(interop.instance).to.not.be.undefined;
            expect(typeof interop.createStream).to.eql("function");
            expect(typeof interop.invoke).to.eql("function");
            expect(typeof interop.methodAdded).to.eql("function");
            expect(typeof interop.methodRemoved).to.eql("function");
            expect(typeof interop.methods).to.eql("function");
            expect(typeof interop.methodsForInstance).to.eql("function");
            expect(typeof interop.register).to.eql("function");
            expect(typeof interop.registerAsync).to.eql("function");
            expect(typeof interop.serverAdded).to.eql("function");
            expect(typeof interop.serverMethodAdded).to.eql("function");
            expect(typeof interop.serverMethodRemoved).to.eql("function");
            expect(typeof interop.serverRemoved).to.eql("function");
            expect(typeof interop.servers).to.eql("function");
            expect(typeof interop.subscribe).to.eql("function");
            expect(typeof interop.unregister).to.eql("function");
        });

        it("AGM instance should contain all properties with default value defined in the API", () => {
            for (const server of glue.interop.servers()) {
                checkInstance(server);
            }
        });

        it("server has instance", () => {
            for (const server of glue.interop.servers()) {
                checkInstance(server);
            }
        });

        function checkInstance(instance: Glue42Core.Interop.Instance) {
            expect(typeof instance.application, "application").to.eql("string");
            expect(typeof instance.applicationName, "applicationName").to.eq("string");
            expect(typeof instance.machine, "machine").to.eql("string");
            expect(typeof instance.pid, "pid").to.eql("number");
            expect(typeof instance.user, "user").to.eql("string");
            // expect(typeof instance.environment, "environment").to.eql("string");
            // expect(typeof instance.region, "region").to.eql("string");
            // expect(typeof instance.service, "service").to.eql("string");
            expect(typeof instance.getMethods).to.eql("function");
            expect(typeof instance.getStreams).to.eql("function");
            expect(typeof instance.peerId, "peerId").to.eql("string");
            expect(typeof instance.isLocal, "isLocal").to.eql("boolean");
            expect(typeof instance.instance, "instance").to.eql("string");
            expect(typeof instance.user, "user").to.eql("string");
            expect(typeof instance.api, "api").to.eql("string");
        }
    });
});
