describe('applications() ', function () {

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
    
    let definitionsOnStart;

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    afterEach(async () => glue.appManager.inMemory.import(definitionsOnStart, "replace"));

    it("should return all applications in the system", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "replace");

        const apps = glue.appManager.applications();

        expect(apps.length).to.eql(1);
        expect(apps[0].name).to.eql(extraDefOne.name);
    });

    it("every applications should contain valid name and url", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const apps = glue.appManager.applications();

        apps.forEach((app) => {
            expect(app.name).to.be.a("string");
            expect(app.userProperties.details.url).to.a("string");
        });
    });

    it("should return an empty array if not apps in the system", async () => {
        await glue.appManager.inMemory.import([], "replace");

        const apps = glue.appManager.applications();

        expect(Array.isArray(apps)).to.be.true;
        expect(apps.length).to.eql(0);
    });

});
