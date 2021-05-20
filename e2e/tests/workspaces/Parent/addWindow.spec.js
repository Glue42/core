describe("addWindow() Should", () => {

    const decorationsHeight = 30;
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

        it(`add the window and update the workspace constraints when the parent is a group and the window has constraints`, async () => {
            const parent = workspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 500,
                    maxWidth: 600,
                    minHeight: 550,
                    maxHeight: 700
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(520);
            expect(workspace.maxWidth).to.eql(32767); // the neighbours have a max maxWidth so they can compensate
            expect(workspace.minHeight).to.eql(550 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(700 + decorationsHeight);
        });

        it(`add the window and update the workspace constraints when the parent is a row and the window has constraints`, async () => {
            const parent = workspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 500,
                    maxWidth: 600,
                    minHeight: 550,
                    maxHeight: 700
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(520);
            expect(workspace.maxWidth).to.eql(32767); // the neighbours have a max maxWidth so they can compensate
            expect(workspace.minHeight).to.eql(550);
            expect(workspace.maxHeight).to.eql(700);
        });

        it(`add the window and update the workspace constraints when the parent is a column and the window has constraints`, async () => {
            const parent = workspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 500,
                    maxWidth: 600,
                    minHeight: 550,
                    maxHeight: 700
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(520);
            expect(workspace.maxWidth).to.eql(32767); // the neighbours have a max maxWidth so they can compensate
            expect(workspace.minHeight).to.eql(550);
            expect(workspace.maxHeight).to.eql(700);
        });

        it(`add the window and not update the workspace constraints when the parent is a group and the window has invalid width constraints`, async () => {
            const parent = workspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 700,
                    maxWidth: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a group and the window has invalid height constraints`, async () => {
            const parent = workspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 700,
                    maxHeight: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a row and the window has invalid width constraints`, async () => {
            const parent = workspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 700,
                    maxWidth: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a row and the window has invalid height constraints`, async () => {
            const parent = workspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 700,
                    maxHeight: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a column and the window has invalid width constraints`, async () => {
            const parent = workspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 700,
                    maxWidth: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a column and the window has invalid height constraints`, async () => {
            const parent = workspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 700,
                    maxHeight: 600,
                }
            });

            await workspace.refreshReference();

            expect(workspace.minWidth).to.eql(30);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a group and the window has incompatible width constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "group",
                        children: [],
                        config: {
                            minWidth: 800,
                            maxWidth: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 600,
                    maxWidth: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(800);
            expect(secondWorkspace.maxWidth).to.eql(1000);
            expect(secondWorkspace.minHeight).to.eql(10 + decorationsHeight);
            expect(secondWorkspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a group and the window has incompatible height constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "group",
                        children: [],
                        config: {
                            minHeight: 800,
                            maxHeight: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 600,
                    maxHeight: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(10);
            expect(secondWorkspace.maxWidth).to.eql(32767);
            expect(secondWorkspace.minHeight).to.eql(800);
            expect(secondWorkspace.maxHeight).to.eql(1000);
        });

        it(`add the window and not update the workspace constraints when the parent is a row and the window has incompatible width constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "row",
                        children: [],
                        config: {
                            minWidth: 800,
                            maxWidth: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 600,
                    maxWidth: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(800);
            expect(secondWorkspace.maxWidth).to.eql(1000);
            expect(secondWorkspace.minHeight).to.eql(10);
            expect(secondWorkspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a row and the window has incompatible height constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "row",
                        children: [],
                        config: {
                            minHeight: 800,
                            maxHeight: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 600,
                    maxHeight: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(10);
            expect(secondWorkspace.maxWidth).to.eql(32767);
            expect(secondWorkspace.minHeight).to.eql(800);
            expect(secondWorkspace.maxHeight).to.eql(1000);
        });

        it(`add the window and not update the workspace constraints when the parent is a column and the window has incompatible width constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "column",
                        children: [],
                        config: {
                            minWidth: 800,
                            maxWidth: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minWidth: 600,
                    maxWidth: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(800);
            expect(secondWorkspace.maxWidth).to.eql(1000);
            expect(secondWorkspace.minHeight).to.eql(10);
            expect(secondWorkspace.maxHeight).to.eql(32767);
        });

        it(`add the window and not update the workspace constraints when the parent is a column and the window has incompatible height constraints`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "column",
                        children: [],
                        config: {
                            minHeight: 800,
                            maxHeight: 1000
                        }
                    }
                ]
            });
            const parent = secondWorkspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    minHeight: 600,
                    maxHeight: 700,
                }
            });

            await secondWorkspace.refreshReference();

            expect(secondWorkspace.minWidth).to.eql(10);
            expect(secondWorkspace.maxWidth).to.eql(32767);
            expect(secondWorkspace.minHeight).to.eql(800);
            expect(secondWorkspace.maxHeight).to.eql(1000);
        });

        it(`lock the window when the paret is a column and locking config has been passed`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "column",
                        children: [],
                    }
                ]
            });
            const parent = secondWorkspace.getAllColumns()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    allowExtract: false,
                    showCloseButton: false
                }
            });
    
            await secondWorkspace.refreshReference();
    
            expect(window.allowExtract).to.be.false;
            expect(window.showCloseButton).to.be.false;
        });
    
        it(`lock the window when the paret is a group and locking config has been passed`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "group",
                        children: [],
                    }
                ]
            });
            const parent = secondWorkspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    allowExtract: false,
                    showCloseButton: false
                }
            });
    
            await secondWorkspace.refreshReference();
    
            expect(window.allowExtract).to.be.false;
            expect(window.showCloseButton).to.be.false;
        });
    
        it(`lock the window when the paret is a group with windows and locking config has been passed`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "group",
                        children: [{
                            type: "window",
                            appName: "noGlueApp"
                        }],
                    }
                ]
            });
            const parent = secondWorkspace.getAllGroups()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    allowExtract: false,
                    showCloseButton: false
                }
            });
    
            await secondWorkspace.refreshReference();
    
            expect(window.allowExtract).to.be.false;
            expect(window.showCloseButton).to.be.false;
        });
    
        it(`lock the window when the paret is a row and locking config has been passed`, async () => {
            const secondWorkspace = await glue.workspaces.createWorkspace({
                children: [
                    {
                        type: "row",
                        children: [],
                    }
                ]
            });
            const parent = secondWorkspace.getAllRows()[0];
            const window = await parent.addWindow({
                type: "window",
                appName: "noGlueApp",
                config: {
                    allowExtract: false,
                    showCloseButton: false
                }
            });
    
            await secondWorkspace.refreshReference();
    
            expect(window.allowExtract).to.be.false;
            expect(window.showCloseButton).to.be.false;
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