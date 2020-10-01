describe("maximize() Should", () => {
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
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", async () => {
        const maximizePromise = window.maximize();

        expect(maximizePromise.then).to.be.a("function");
        expect(maximizePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await window.maximize();
    });

    it("change the window state to maximized when the window is not loaded", async () => {
        await window.maximize();
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.true;
    });

    it("change the window state to maximized when the window is loaded", async () => {
        await window.forceLoad();
        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        window = windows[0];

        await window.maximize();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.true;
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("resolve the promise when the workspace is not focused", async () => {
            await window.maximize();
        });

        it("change the window state to maximized when the window is not loaded and the workspace is not focused", async () => {
            await window.maximize();
            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            window = windows[0];

            expect(window.isMaximized).to.be.true;
        });

        it("change the window state to maximized when the window is loaded and the workspace is not focused", async () => {
            await window.forceLoad();
            await workspace.refreshReference();

            let windows = workspace.getAllWindows();
            window = windows[0];

            await window.maximize();
            await workspace.refreshReference();

            windows = workspace.getAllWindows();
            window = windows[0];

            expect(window.isMaximized).to.be.true;
        });
    });
});
