describe("properties: ", () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };
    const threeContainersConfig = {
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

                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    windowConfig
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [

                        ]
                    }
                ]
            }
        ]
    };
    let workspace;

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    describe("id: ", () => {
        it(`Should not be undefined`, () => {
            expect(workspace.id).to.not.be.undefined;
            expect(workspace.id.length).to.not.eql(0);
        });
    });

    describe("frameId: ", () => {
        it(`Should be correct`, async () => {
            const currFrame = (await glue.workspaces.getAllFrames())[0];

            expect(workspace.frameId).to.eql(currFrame.id);
        });

        it(`Should not be undefined`, () => {
            expect(workspace.frameId).to.not.be.undefined;
            expect(workspace.frameId.length).to.not.eql(0);
        });
    });

    describe("title: Should", () => {
        const layoutName = "unique.layout.name";
        const workspaceTitle = "unique.window.name";
        const configWithTitle = {
            name: layoutName,
            type: "Workspace",
            metadata: {},
            components: [{
                type: "Workspace",
                state: {
                    children: [{
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    config: {
                                        appName: "dummyApp",
                                    }
                                }],
                                config: {}
                            }],
                            config: {}
                        }],
                        config: {}
                    }],
                    config: {
                        name: layoutName,
                        title: workspaceTitle
                    },
                }
            }]
        }

        const configWithoutTitle = {
            name: layoutName,
            type: "Workspace",
            metadata: {},
            components: [{
                type: "Workspace",
                state: {
                    children: [{
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    config: {
                                        appName: "dummyApp",
                                    }
                                }],
                                config: {}
                            }],
                            config: {}
                        }],
                        config: {}
                    }],
                    config: {
                        name: "differentName"
                    },
                }
            }]
        }

        const configWithoutTitleAndName = {
            name: layoutName,
            type: "Workspace",
            metadata: {},
            components: [{
                type: "Workspace",
                state: {
                    children: [{
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    config: {
                                        appName: "dummyApp",
                                    }
                                }],
                                config: {}
                            }],
                            config: {}
                        }],
                        config: {}
                    }],
                    config: {
                    },
                }
            }]
        }

        afterEach(() => {
            return glue.workspaces.layouts.delete(layoutName);
        });

        it("be the same as the one in the layout", async () => {
            await glue.workspaces.layouts.import([configWithTitle]);
            const newWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            expect(newWorkspace.title).to.eql(workspaceTitle);
        });

        it("be the same as the name in the config of the layout when a title is not passed", async () => {
            await glue.workspaces.layouts.import([configWithoutTitle]);
            const newWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            expect(newWorkspace.title).to.eql(configWithoutTitle.components[0].state.config.name);
        });

        it("be the same as the name of the layout when a title is not passed and the config object is empty", async () => {
            await glue.workspaces.layouts.import([configWithoutTitleAndName]);
            const newWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            expect(newWorkspace.title).to.eql(configWithoutTitleAndName.name);
        });

        it("not be undefined", () => {
            expect(workspace.title).to.not.be.undefined;
            expect(workspace.title.length).to.not.eql(0);
        });
    });

    describe("positionIndex: ", () => {
        it(`Should be 0 when the workspace is first`, () => {
            expect(workspace.positionIndex).to.eql(0);
        });
    });

    describe("children: ", () => {
        const basicConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                            }]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "row",
                                children: [{
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                            }]
                        },
                    ]
                }
            ]
        }

        let workspace = undefined;

        before(async () => {
            await coreReady;
            workspace = await glue.workspaces.createWorkspace(basicConfig);
        });

        after(async () => {
            const frames = await glue.workspaces.getAllFrames();
            await Promise.all(frames.map((f) => f.close()));
        });

        it("return only the immediate children", () => {
            const children = workspace.children;

            expect(children.length).to.eql(1);
            expect(children[0].type).to.eql("row");
        });

        // Not focused workspace
        it("return only the immediate children when the workspace is not focused", async () => {
            await glue.workspaces.createWorkspace(basicConfig);
            const children = workspace.children;

            expect(children.length).to.eql(1);
            expect(children[0].type).to.eql("row");
        });
    });

    describe("frame: ", () => {
        const basicConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "window",
                            appName: "dummyApp"
                        }
                    ]
                }
            ],
            frame: {
                newFrame: true,
            }
        }


        before(() => coreReady);

        afterEach(async () => {
            const frames = await glue.workspaces.getAllFrames();
            await Promise.all(frames.map((f) => f.close()));
        });

        Array.from({ length: 3 }).forEach((_, i) => {
            it(`return the correct frame for all ${i + 1} workspaces when there are ${i + 1} workspaces open in different frames`, async () => {
                await glue.workspaces.createWorkspace(basicConfig);

                const workspaces = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return glue.workspaces.createWorkspace(basicConfig);
                }));

                workspaces.forEach(w => {
                    const workspaceFrame = w.frame;

                    expect(workspaceFrame.id).to.eql(w.frameId);
                });
            });
        });
    });

    describe("layoutName: Should", () => {
        let workspace = undefined;
        let layoutName = "sample-layout-name";

        const basicConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                            }]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "row",
                                children: [{
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                            }]
                        },
                    ]
                }
            ]
        }

        before(async () => {
            await coreReady;
            workspace = await glue.workspaces.createWorkspace(basicConfig);
        });

        after(async () => {
            const frames = await glue.workspaces.getAllFrames();
            await Promise.all(frames.map((f) => f.close()));

            const layouts = await glue.workspaces.layouts.getSummaries();

            if (layouts.some(l => l.name === layoutName)) {
                await glue.workspaces.layouts.delete(layoutName);
            }
        });

        it("be equal to the layout name from which the workspace was restored when the workspace is restored", async () => {
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.layoutName).to.eql(layoutName);
        });

        it("be undefined when the workspace is created", async () => {
            expect(workspace.layoutName).to.eql(undefined);
        });
    });
});
