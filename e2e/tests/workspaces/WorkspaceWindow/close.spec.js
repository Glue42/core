describe("close() Should", () => {
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

        const closePromise = window.close();

        expect(closePromise.then).to.be.a("function");
        expect(closePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.close();
    });

    it("remove the workspace window when it is invoked before the window was loaded", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.close();

        await workspace.refreshReference();
        const windowsAfterClose = workspace.getAllWindows().filter(w => w.name.includes("dummyApp"));;

        expect(windowsAfterClose.length).to.eql(0);
    });

    it("remove the workspace window when it is invoked after the window was loaded", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.forceLoad();
        await window.close();
        await workspace.refreshReference();
        const windowsAfterClose = workspace.getAllWindows();

        expect(windowsAfterClose.length).to.eql(0);
    });

    it("close the corresponding gd window when it is invoked before the window was loaded", async () => {
        const gdWindows = glue.windows.list().filter(w => w.name.includes("dummyApp"));

        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.close();

        const gdWindowsAfterClose = glue.windows.list().filter(w => w.name.includes("dummyApp"));

        expect(gdWindowsAfterClose.length).to.eql(gdWindows.length);
    })

    it("close the corresponding gd window when it is invoked after the window was loaded", async () => {
        await workspace.addWindow(windowConfig);
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];

        await window.forceLoad();
        const gdWindows = glue.windows.list();

        await window.close();

        const gdWindowsAfterClose = glue.windows.list();

        expect(gdWindowsAfterClose.length).to.eql(gdWindows.length - 1);
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("return a promise when the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            const closePromise = window.close();

            expect(closePromise.then).to.be.a("function");
            expect(closePromise.catch).to.be.a("function");
        });

        it("resolve the promise when the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.close();
        });

        it("remove the workspace window when it is invoked before the window was loaded when the workspace is not focused", async () => {
            // Potential race if the window loads very fast
            // TODO refactor
            await workspace.refreshReference();

            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.close();

            await workspace.refreshReference();
            const windowsAfterClose = workspace.getAllWindows();

            expect(windowsAfterClose.length).to.eql(0);
        });

        it("remove the workspace window when it is invoked after the window was loaded when the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.forceLoad();
            await window.close();
            await workspace.refreshReference();
            const windowsAfterClose = workspace.getAllWindows();

            expect(windowsAfterClose.length).to.eql(0);
        });

        it("close the corresponding gd window when it is invoked before the window was loaded when the workspace is not focused", async () => {
            const gdWindows = glue.windows.list().filter(w => w.name.includes("dummyApp"));

            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.close();

            const gdWindowsAfterClose = glue.windows.list().filter(w => w.name.includes("dummyApp"));;

            expect(gdWindowsAfterClose.length).to.eql(gdWindows.length);
        })

        it("close the corresponding gd window when it is invoked after the window was loaded when the workspace is not focused", async () => {
            const gdWindows = glue.windows.list().filter(w => w.name.includes("dummyApp"));

            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.forceLoad();
            await window.close();

            const gdWindowsAfterClose = glue.windows.list().filter(w => w.name.includes("dummyApp"));

            expect(gdWindowsAfterClose.length).to.eql(gdWindows.length);
        });
    });

    it("reject when invoked twice on the same window and the window is loaded", async () => {
        let errorThrown = false;
        try {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.forceLoad();
            await Promise.all([window.close(), window.close()]);
        } catch (error) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });

    it("reject when invoked twice on the same window and the window is not loaded", async () => {
        let errorThrown = false;
        try {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await Promise.all([window.close(), window.close()]);
        } catch (error) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });
});
