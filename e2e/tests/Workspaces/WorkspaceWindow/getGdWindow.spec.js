describe("getGdWindow() Should", () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                ]
            }
        ]
    }

    let workspace = undefined;

    before(() => coreReady);
    
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return the gdWindow after its loaded", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        let window = windows[0];

        await window.forceLoad();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.getGdWindow()).to.not.be.undefined;
    });

    it("return a gdWindow that is present in the gdWindow collection", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        let window = windows[0];

        await window.forceLoad();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        const gdWindows = glue.windows.list();
        const gdWindow = window.getGdWindow();
        const isPresent = gdWindows.some(w => w.id === gdWindow.id);

        expect(isPresent).to.be.true;
    })
});
