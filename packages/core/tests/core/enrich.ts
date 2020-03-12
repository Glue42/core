import { expect } from "chai";
import { init as initGlue, shutdown } from "./base";
import { Glue42Core } from "../../glue";

/**
 * Tests around glue.core enrichment functionality
 */
describe("core", () => {

    afterEach((done) => {
        shutdown();
        done();
    });

    it("can enrich glue with lib and config", (done) => {
        const createLib = () => {
            return { version: "1", inner: 55 };
        };
        const ext: Glue42Core.Extension = {
            libs: [
                { name: "something", create: createLib },
            ],
            version: "52",
            enrichGlue: (glue) => {
                glue.config.something = 54;
            }
        };

        initGlue((err, glue, config) => {
            if (err) {
                done(err);
                return;
            }

            if (!glue) {
                done("no glue");
                return;
            }

            expect(glue.version).to.be.eq("52");
            expect((glue as any).something.inner).to.be.eq(55);

            done();
        }, undefined, ext);
    });
});
