describe('application() ', function () {
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

    it("should return the application if present", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const app = glue.appManager.application(extraDefOne.name);

        expect(app).to.not.be.undefined;
        expect(app.name).to.eql(extraDefOne.name);
        expect(app.userProperties.details.url).to.eql(extraDefOne.details.url);
    });

    it("should return undefined if the app is not present", () => {
        const app = glue.appManager.application(extraDefOne.name);

        expect(app).to.be.undefined;
    });

    [
        undefined,
        42,
        {},
        [],
        true
    ].forEach((input) => {
        it("should throw when invalid arg is provided", () => {
            try {
                glue.appManager.application(input);
            } catch (error) {
                return;
            }

            throw new Error(`Should have thrown, because the provided argument is not valid: ${JSON.stringify(input)}`);
        });
    });
});
