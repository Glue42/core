import { expect } from "chai";
import { init as initGlue, shutdown } from "./base";
import { defaultWS } from "../initializer";
// tslint:disable:no-unused-expression

describe("core", () => {

    afterEach((done) => {
        shutdown();
        done();
    });

    it("initializes with no error", (done) => {
        initGlue((err) => {
            done(err);
        });
    });

    it("initializes with undefined config", (done) => {
        initGlue((err) => {
            done(err);
        }, undefined);
    });

    it("has all the libraries available", (done) => {
        initGlue((err, glue) => {
            if (err) {
                done(err);
                return;
            }
            if (!glue){
                done("glue is undefined");
                return;
            }

            expect(glue.agm).not.to.be.undefined;
            expect(glue.interop).not.to.be.undefined;
            expect(glue.connection).not.to.be.undefined;
            expect(glue.metrics).not.to.be.undefined;
            expect(glue.contexts).not.to.be.undefined;

            done();
        });
    });

    it("interop is agm alias", (done) => {
        initGlue((err, glue) => {
            if (!glue || !glue.agm || !glue.interop) {
                err("agm or interop missing");
                return;
            }

            const agmKeys = Object.keys(glue.agm);
            const interopKeys = Object.keys(glue.interop);

            expect(JSON.stringify(agmKeys)).to.be.equal(JSON.stringify(interopKeys));

            done(err);
        });
    });

    it("should fail to initialize if GW3 and no auth (but GW requires)", (done) => {
        const userConfig = {
            gateway: {
                protocolVersion: 3,
                ws: defaultWS
            }
        };

        initGlue((err, glue) => {
            if (err) {
                // failing is ok
                done();
                return;
            }
            done("should not be here");
        }, userConfig);
    });
});
