describe("addWindow() Should", () => {

    let workspace = undefined;
    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    describe("", () => {

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

        beforeEach(async () => {
            workspace = await glue.workspaces.createWorkspace(config);
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

        describe("complex", () => {
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
                                    }
                                ]
                            },
                            {
                                type: "column",
                                children: [
                                    {
                                        type: "row",
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
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            beforeEach(async () => {
                workspace = await glue.workspaces.createWorkspace(config);
            });

            it(`the parent children collection should be correctly updated`, async () => {
                const col = workspace.getAllColumns()[0];

                const countBefore = col.children.length;
                const idBefore = col.id;

                await col.addWindow({ appName: "dummyApp" });

                const countAfter = col.children.length;
                const idAfter = col.id;

                expect(idBefore).to.eql(idAfter);
                expect(countBefore + 1).to.eql(countAfter);
            });
        })
    });
});