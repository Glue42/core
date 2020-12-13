describe("eject() Should", () => {
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
    let windowsForClosing = [];

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    // The windows can't be closed
    it("return a promise", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];
        await window.forceLoad();
        windowsForClosing.push(window.getGdWindow());
        const ejectPromise = window.eject();

        expect(ejectPromise.then).to.be.a("function");
        expect(ejectPromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];
        await window.forceLoad();

        windowsForClosing.push(window.getGdWindow());

        await window.eject();
    });

    it("remove the workspace window when it is invoked after the window was loaded", async () => {
        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];
        await window.forceLoad();
        windowsForClosing.push(window.getGdWindow());
        await window.eject();
        await workspace.refreshReference();
        const windowsAfterEject = workspace.getAllWindows();

        expect(windowsAfterEject.length).to.eql(0);
    });

    it("don't close the gdWindow when the window is loaded", async () => {
        await workspace.addWindow(windowConfig);
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        const window = windows[0];
        await window.forceLoad();
        const dummyAppWindows = glue.windows.list().filter(w => w.name.includes("dummyApp"));

        windowsForClosing.push(window.getGdWindow());
        await window.eject();
        const windowsAfterEject = glue.windows.list().filter(w => w.name.includes("dummyApp"));

        expect(windowsAfterEject.length).to.eql(dummyAppWindows.length);
    });

    it.skip("preserve the window context", async () => {
        const window = await workspace.addWindow(windowConfig);
        await window.forceLoad();
        const randomString = gtf.getWindowName("window");
        const newContext = { myContext: randomString };

        await window.getGdWindow().setContext(newContext);
        await window.eject();

        const waitForWindowByName = (name) => {
            return new Promise((res) => {
                const unsub = glue.windows.onWindowAdded((w) => {
                    if (w.name === name) {
                        res(w);
                        unsub();
                    }
                });

                const win = glue.windows.list().find(w => w.name === name);
                if (win) {
                    res(win);
                    unsub();
                }
            });
        };
        const ejectedWindow = await waitForWindowByName(window.appName);
        const wait = new Promise(r => setTimeout(r, 3000));

        await wait;

        const contextAfterEject = await ejectedWindow.getContext();

        expect(contextAfterEject).to.eql(newContext);
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("resolve the promise when the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);
            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];

            await window.forceLoad();
            windowsForClosing.push(window.getGdWindow());
            await window.eject();
        });

        it("remove the workspace window when it is invoked before the window was loaded and the workspace is not focused", async () => {
            // Potential race if the window loads very fast
            // TODO refactor
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];
            await window.forceLoad();

            windowsForClosing.push(window.getGdWindow());
            await window.eject();

            await workspace.refreshReference();
            const windowsAfterEject = workspace.getAllWindows();

            expect(windowsAfterEject.length).to.eql(0);
        });

        it("remove the workspace window when it is invoked after the window was loaded and the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];
            await window.forceLoad();

            windowsForClosing.push(window.getGdWindow());
            await window.eject();
            await workspace.refreshReference();
            const windowsAfterEject = workspace.getAllWindows();

            expect(windowsAfterEject.length).to.eql(0);
        });

        it("don't close the gdWindow when the window is loaded and the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);
            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];
            await window.forceLoad();
            const dummyWindows = glue.windows.list().filter(w => w.name.includes("dummyApp"));

            windowsForClosing.push(window.getGdWindow());
            await window.eject();
            const windowsAfterEject = glue.windows.list().filter(w => w.name.includes("dummyApp"));

            expect(windowsAfterEject.length).to.eql(dummyWindows.length);
        });
    })

    it("reject when invoked twice on the same window and the window is loaded", async () => {
        let errorThrown = false;
        try {
            await workspace.addWindow(windowConfig);

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            const window = windows[0];
            await window.forceLoad();

            windowsForClosing.push(window.getGdWindow());
            await Promise.all([window.eject(), window.eject()]);
        } catch (error) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });
});
