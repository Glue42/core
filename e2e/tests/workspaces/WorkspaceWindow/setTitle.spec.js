describe("setTitle() Should", () => {
    // maybe I should check the title of the gdWindow
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
    // BUG
    let workspace = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        const randomTitle = gtf.getWindowName();
        const titlePromise = window.setTitle(randomTitle);

        expect(titlePromise.then).to.be.a("function");
        expect(titlePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const randomTitle = gtf.getWindowName();
        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.setTitle(randomTitle);
    });

    it("change the title when it is invoked before the window was loaded", async () => {
        // Potential race if the window loads very fast
        // TODO refactor
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];
        const randomTitle = gtf.getWindowName();

        await window.setTitle(randomTitle);

        await workspace.refreshReference();
        const windowsAfterRename = workspace.getAllWindows();

        expect(windowsAfterRename[0].title).to.eql(randomTitle);
    });

    it("change the title when it is invoked after the window was loaded", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.forceLoad();
        const randomTitle = gtf.getWindowName();

        await window.setTitle(randomTitle);
        await workspace.refreshReference();
        const windowsAfterRename = workspace.getAllWindows();

        expect(windowsAfterRename[0].title).to.eql(randomTitle);
    });

    Array.from([undefined, null, [], 42, {}]).forEach((input) => {
        it(`reject when invoked with ${JSON.stringify(input)}`, async () => {
            let errorThrown = false;
            try {
                await workspace.addWindow(windowConfig);

                await workspace.refreshReference();

                const windows = workspace.getAllWindows();
                const window = windows[0];

                await window.setTitle(input);
            } catch (error) {
                errorThrown = true;
            }

            expect(errorThrown).to.be.true;
        });
    });
});
