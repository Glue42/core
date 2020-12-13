describe('setTitle() Should ', function () {
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
        const newTitle = gtf.getWindowName("workspaces");
        const setTitlePromise = workspace.setTitle(newTitle);

        expect(setTitlePromise.then).to.be.a("function");
        expect(setTitlePromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        const newTitle = gtf.getWindowName("workspaces");
        await workspace.setTitle(newTitle);
    });

    it("change the title of the workspace", async () => {
        const newTitle = gtf.getWindowName("workspaces");
        await workspace.setTitle(newTitle);

        await workspace.refreshReference();

        expect(workspace.title).to.eql(newTitle);
    });

    it("change the title of the workspace when there is a workspace with the same title", async () => {
        const secondWorkspace = await glue.workspaces.createWorkspace(basicConfig);
        const newTitle = gtf.getWindowName("workspaces");

        await secondWorkspace.setTitle(newTitle);
        await workspace.setTitle(newTitle);

        await workspace.refreshReference();
        await secondWorkspace.refreshReference();

        expect(workspace.title).to.eql(newTitle);
        expect(secondWorkspace.title).to.eql(newTitle);
    });

    Array.from([42, {}, [], undefined, null]).forEach((input) => {
        it("reject when the input is invalid", (done) => {
            workspace.setTitle(input).then(() => {
                done("Should not resolve")
            }).catch(() => {
                done();
            });
        });
    });
});
