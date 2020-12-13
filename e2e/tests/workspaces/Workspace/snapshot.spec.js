describe('snapshot() Should ', function () {
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ]
    }
    let workspace = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        expect(workspace.snapshot().then).to.be.a("function");
        expect(workspace.snapshot().catch).to.be.a("function");
    });

    it("resolve", async () => {
        await workspace.snapshot();
    });

    it("have the correct id", async () => {
        const snapshot = await workspace.snapshot();

        expect(snapshot.id).to.eql(workspace.id);
    });

    //TODO test all other properties
});
