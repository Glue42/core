describe("restore() Should", () => {
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
    let window = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.addWindow(windowConfig);
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        await window.maximize();
        await workspace.refreshReference();
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", async () => {
        const restorePromise = window.restore();

        expect(restorePromise.then).to.be.a("function");
        expect(restorePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await window.restore();
    });

    it("change the window state to normal when the window is not loaded", async () => {
        await window.restore();
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.false;
    });

    it("change the window state to maximized when the window is loaded", async () => {
        await window.forceLoad();
        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        window = windows[0];

        await window.restore();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.false;
    });

});
