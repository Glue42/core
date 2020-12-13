describe('addWindow() Should ', function () {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const basicConfig = {
        children: [
            {
                type: "column",
                children: [windowConfig]
            }
        ]
    };
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
        expect(workspace.addWindow(windowConfig).then).to.be.a("function");;
        expect(workspace.addWindow(windowConfig).catch).to.be.a("function");;
    });

    it("resolve", async () => {
        await workspace.addWindow(windowConfig);
    });

    it("resolve with a window", async () => {
        const window = await workspace.addWindow(windowConfig);

        expect(window.constructor.name).to.eql("Window");
    });

    it("update the window context when a context is passed", async () => {
        const context = { test: gtf.getWindowName("workspaces") };
        const window = await workspace.addWindow({
            type: "window",
            appName: "dummyApp",
            context
        });

        await window.forceLoad();
        await workspace.refreshReference();

        const wait = new Promise(r => setTimeout(r, 3000));
        await wait;

        const glueWindow = window.getGdWindow();
        const windowContext = await glueWindow.getContext();

        expect(windowContext).to.eql(context);
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`add ${i + 1}  window/s to the workspace`, async () => {

            const windows = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                return workspace.addWindow(windowConfig);
            }));

            await workspace.refreshReference();
            const allWindows = workspace.getAllWindows();

            expect(allWindows.length).to.eql(i + 2);
        })
    });

    // Not focused workspace
    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("return a promise when the workspace is not focused", () => {
            expect(workspace.addWindow(windowConfig).then).to.be.a("function");;
            expect(workspace.addWindow(windowConfig).catch).to.be.a("function");;
        });

        it("resolve when the workspace is not focused", async () => {
            await workspace.addWindow(windowConfig);
        });

        it("update the window context when a context is passed and the workspace is not focused", async () => {
            const context = { test: gtf.getWindowName("workspaces") };
            const window = await workspace.addWindow({
                type: "window",
                appName: "dummyApp",
                context
            });

            await window.forceLoad();
            await workspace.refreshReference();

            const wait = new Promise(r => setTimeout(r, 3000));
            await wait;

            const glueWindow = window.getGdWindow();
            const windowContext = await glueWindow.getContext();

            expect(windowContext).to.eql(context);
        });

        it("resolve with a window when the workspace is not focused", async () => {
            const window = await workspace.addWindow(windowConfig);

            expect(window.constructor.name).to.eql("Window");
        });

        Array.from({ length: 5 }).forEach((_, i) => {
            it(`add ${i + 1}  window/s to the workspace when the workspace is not focused`, async () => {
                await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addWindow(windowConfig);
                }));

                await workspace.refreshReference();
                const allWindows = workspace.getAllWindows();

                expect(allWindows.length).to.eql(i + 2);
            })
        });
    });

    // TODO maybe test the positions of the windows
    Array.from([42, [], {}, "42", undefined, null]).forEach((input) => {
        it(`reject when the input is ${JSON.stringify(input)}`, (done) => {
            workspace.addWindow(input).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    })
});
