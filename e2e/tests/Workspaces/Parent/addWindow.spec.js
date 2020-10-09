describe("addWindow() Should", () => {
    const config = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: []
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "dummyApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: []
                    }
                ]
            }
        ]
    };

    let workspace = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    Array.from(["row", "column", "group"]).forEach((parentType) => {
        it(`return the added window when the parent is a ${parentType}`, async () => {
            const box = workspace.getAllBoxes().find(p => p.type === parentType);
            const window = await box.addWindow({
                type: "window",
                appName: "dummyApp"
            });

            expect(window).to.not.be.undefined;
            expect(window.constructor.name).to.eql("Window");
        });

        it(`add the window when the parent is ${parentType}`, async () => {
            const box = workspace.getAllBoxes().find(p => p.type === parentType);
            const window = await box.addWindow({
                type: "window",
                appName: "dummyApp"
            });

            await workspace.refreshReference();

            const windows = workspace.getAllWindows();

            expect(windows.length).to.eql(2);
        });

        it(`update the window context when a context is passed and the parent is ${parentType}`, async () => {
            const box = workspace.getAllBoxes().find(p => p.type === parentType);
            const context = { test: gtf.getWindowName("workspaces") };
            const window = await box.addWindow({
                type: "window",
                appName: "dummyApp",
                context
            });

            await window.forceLoad();
            await workspace.refreshReference();

            const glueWindow = window.getGdWindow();
            const windowContext = await glueWindow.getContext();

            expect(windowContext).to.eql(context);
        });

        describe("", () => {
            beforeEach(async () => {
                await glue.workspaces.createWorkspace(config);
            });

            it(`return the added window when the parent is a ${parentType} and the workspace is not focused`, async () => {
                const box = workspace.getAllBoxes().find(p => p.type === parentType);
                const window = await box.addWindow({
                    type: "window",
                    appName: "dummyApp"
                });

                expect(window).to.not.be.undefined;
                expect(window.constructor.name).to.eql("Window");
            });

            it(`add the window when the parent is ${parentType} and the workspace is not focused`, async () => {
                const box = workspace.getAllBoxes().find(p => p.type === parentType);
                const window = await box.addWindow({
                    type: "window",
                    appName: "dummyApp"
                });

                await workspace.refreshReference();

                const windows = workspace.getAllWindows();

                expect(windows.length).to.eql(2);
            });

            it(`update the window context when a context is passed and the parent is ${parentType} and the workspace is not focused`, async () => {
                const box = workspace.getAllBoxes().find(p => p.type === parentType);
                const context = { test: gtf.getWindowName("workspaces") };
                const window = await box.addWindow({
                    type: "window",
                    appName: "dummyApp",
                    context
                });

                await window.forceLoad();
                await workspace.refreshReference();

                const glueWindow = window.getGdWindow();
                const windowContext = await glueWindow.getContext();

                expect(windowContext).to.eql(context);
            });
        });

        Array.from(["42", 42, [], {}, undefined, null]).forEach((input) => {
            it(`reject when the parent is ${parentType} and the argument is ${JSON.stringify(input)}`, (done) => {
                const box = workspace.getAllBoxes().find(p => p.type === parentType);
                box.addWindow(input)
                    .then(() => done("Should not resolve"))
                    .catch(() => done());
            });
        });
    });
});