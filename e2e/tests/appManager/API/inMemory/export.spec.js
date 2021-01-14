describe('export() ', function () {

    const extraDefOne = {
        name: "ExtraOne",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    afterEach(() => glue.appManager.inMemory.import(definitionsOnStart, "replace"));


    it("should return a promise", async () => {
        const appsExportPromise = glue.appManager.inMemory.export();

        expect(appsExportPromise.then).to.be.a("function");
        expect(appsExportPromise.catch).to.be.a("function");

        await appsExportPromise;
    });

    it("should resolve with a valid Glue definitions array", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const apps = await glue.appManager.inMemory.export();

        expect(Array.isArray(apps)).to.be.true;
        apps.forEach((app) => {
            expect(app.name).to.be.a("string");
            expect(app.details).to.be.an("object");
        });
    });

    it("the exported definitions should be the same number as the ones returned from applications", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const exported = await glue.appManager.inMemory.export();
        const returned = glue.appManager.applications();

        expect(exported.length).to.eql(returned.length);
    });

    it("the exported definitions have the same names as the ones returned from applications", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const exported = await glue.appManager.inMemory.export();
        const returned = glue.appManager.applications();

        exported.forEach((exp) => {
            expect(returned.some((ret) => ret.name === exp.name));
        });
    });

});

