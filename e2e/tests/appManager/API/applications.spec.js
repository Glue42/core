describe('applications() ', function () {

    const extraDefOne = {
        name: "ExtraOne",
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

        definitionsOnStart = await glue.appManager.export();
    });

    afterEach(async () => glue.appManager.import(definitionsOnStart, "replace"));

    it("should return all applications in the system", async () => {
        await glue.appManager.import([extraDefOne], "replace");

        const apps = glue.appManager.applications();

        expect(apps.length).to.eql(1);
        expect(apps[0].name).to.eql(extraDefOne.name);
    });

    it("every applications should contain valid name and url", async () => {
        await glue.appManager.import([extraDefOne], "merge");

        const apps = glue.appManager.applications();

        apps.forEach((app) => {
            expect(app.name).to.be.a("string");
            expect(app.userProperties.details.url).to.a("string");
        });
    });

    it("should return an empty array if not apps in the system", async () => {
        await glue.appManager.import([], "replace");

        const apps = glue.appManager.applications();

        expect(Array.isArray(apps)).to.be.true;
        expect(apps.length).to.eql(0);
    });

});
