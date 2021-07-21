import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";

// tslint:disable:no-unused-expression

describe("contexts.create", () => {

    let gluePermissionedSecret: string = "";
    let glueReadPermissionedSecret: string = "";
    let glueCreator!: Glue42Core.GlueCore;
    let gluePermissioned!: Glue42Core.GlueCore;
    let glueNotPermissioned!: Glue42Core.GlueCore;
    let glueReadPermissioned!: Glue42Core.GlueCore;

    beforeEach(async () => {
        gluePermissionedSecret = generate() + "." + generate()
        glueReadPermissionedSecret = generate() + "." + generate()
        glueCreator = await createGlue();
        gluePermissioned = await createGlue("child-" + gluePermissionedSecret);
        glueNotPermissioned = await createGlue();
        glueReadPermissioned = await createGlue("child-" + glueReadPermissionedSecret);
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("check if creating a new context with data works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        // the point of these subscribe calls is to give all peers time to get in sync
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            expect(await glueCreator.contexts.get(ctxName)).to.deep.equal(data);
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal(data);
            pw.resolve();
        });
        return pw.promise;
    });

    it("check if create for existing context with data works", async () => {
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        await gluePermissioned.contexts.create(ctxName, data2);
        expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data });
        expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data });
    });


    it("check if create for existing context with data works (+update)", async () => {
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { moo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        await gluePermissioned.contexts.create(ctxName, data2);
        await gluePermissioned.contexts.update(ctxName, data3);
        expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data3 });
        expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data3 });
    });

    it("check if creating a new context with data and read restrictions works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        await glueCreator.contexts.create(ctxName, data, { readPermissions: `$application == 'child-${gluePermissionedSecret}'` });
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal(data);
            expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({});
            pw.resolve();
        });

        return pw.promise;
    });

    it("check if creating a new context with data and write restrictions works", async () => {
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { boo: generate() };
        const data4 = { zoo: generate() };
        await glueCreator.contexts.create(ctxName, data, {
            writePermissions: `$application == 'child-${gluePermissionedSecret}'`
        });
        await glueCreator.contexts.update(ctxName, data2);
        await gluePermissioned.contexts.update(ctxName, data3);
        let thrown = false;
        try {
            await glueNotPermissioned.contexts.update(ctxName, data4);
            thrown = false;
        } catch (e) {
            thrown = true;
        }
        expect(thrown).to.equal(true);
        expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
        expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
        expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
    });

    it("check if creating a new context with data and read and write restrictions works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { boo: generate() };
        const data4 = { zoo: generate() };
        const data5 = { woo: generate() };
        await glueCreator.contexts.create(ctxName, data, {
            readPermissions: `$application == 'child-${glueReadPermissionedSecret}'`,
            writePermissions: `$application == 'child-${gluePermissionedSecret}'`
        });
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            await glueCreator.contexts.update(ctxName, data2);
            await gluePermissioned.contexts.update(ctxName, data3);
            let thrown = false;
            try {
                await glueNotPermissioned.contexts.update(ctxName, data4);
                thrown = false;
            } catch (e) {
                thrown = true;
            }
            expect(thrown).to.equal(true);
            try {
                await glueReadPermissioned.contexts.update(ctxName, data5);
                thrown = false;
            } catch (e) {
                thrown = true;
            }
            expect(thrown).to.equal(true);

            expect(await glueReadPermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({ });
            pw.resolve();
        });
        return pw.promise;
    });

    it("check if creating a new context with data and read and write restrictions specified with syntax sugar works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { boo: generate() };
        const data4 = { zoo: generate() };
        const data5 = { woo: generate() };
        await glueCreator.contexts.create(ctxName, data, {
            readPermissions: { application: `child-${glueReadPermissionedSecret}` },
            writePermissions: { application: `child-${gluePermissionedSecret}` }
        });
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            await glueCreator.contexts.update(ctxName, data2);
            await gluePermissioned.contexts.update(ctxName, data3);
            let thrown = false;
            try {
                await glueNotPermissioned.contexts.update(ctxName, data4);
                thrown = false;
            } catch (e) {
                thrown = true;
            }
            expect(thrown).to.equal(true);
            try {
                await glueReadPermissioned.contexts.update(ctxName, data5);
                thrown = false;
            } catch (e) {
                thrown = true;
            }
            expect(thrown).to.equal(true);

            expect(await glueReadPermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({ });
            pw.resolve();
        });
        return pw.promise;
    });

    it("check if subscribe followed by create works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data });
            pw.resolve();
        });
        glueCreator.contexts.create(ctxName, data);

        return pw.promise;
    });

});
