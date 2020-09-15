// @ts-check
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


    describe("type: ", () => {
        Array.from(["group", "column", "row"]).forEach((parent) => {
            it(`Should be "${parent}" when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.type).to.eql(parent);
            });
        });
    })

    describe("id: ", () => {
        Array.from(["group", "column", "row"]).forEach((parent) => {

            it(`Should not be undefined when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.id).to.not.be.undefined;
                expect(currParent.id.length).to.not.eql(0);
            });
        });

    });

    describe("frameId: ", () => {
        Array.from(["group", "column", "row"]).forEach((parent) => {

            it(`Should be correct when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.frameId).to.eql(workspace.frameId);
            });

            it(`Should not be undefined when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.frameId).to.not.be.undefined;
                expect(currParent.frameId.length).to.not.eql(0);
            });
        });

    });

    describe("workspaceId: ", () => {
        Array.from(["group", "column", "row"]).forEach((parent) => {

            it(`Should be correct when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.workspaceId).to.eql(workspace.id);
            });

            it(`Should not be undefined when the parent is a ${parent}`, () => {
                const currParent = workspace.getBox(p => p.type === parent);

                expect(currParent.workspaceId).to.not.be.undefined;
                expect(currParent.workspaceId.length).to.not.eql(0);
            });
        });

    });

    describe("children: Should", () => {
        const basicConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                },
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                }
                            ]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "dummyApp"
                                    },
                                    {
                                        type: "window",
                                        appName: "dummyApp"
                                    }
                                ]
                            }]
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "dummyApp"
                                        },
                                        {
                                            type: "row",
                                            children: []
                                        }
                                    ]
                                },
                            ]
                        }
                    ],
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

        it("return the immediate children when parent is a group", () => {
            const groupUnderTest = workspace.getBox(p => p.type == "group");
            const allChildren = groupUnderTest.children;

            expect(allChildren.length).to.eql(2);
        });

        it("return the immediate children when the parent is a row", () => {
            const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
            const allChildren = rowUnderTest.children;

            expect(allChildren.length).to.eql(3);
        });

        it("return the immediate children when the parent is a column", () => {
            const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
            const allChildren = columnUnderTest.children;

            expect(allChildren.length).to.eql(2);
        });

        it("return the correct children when the parent is a group", () => {
            const groupUnderTest = workspace.getBox(p => p.type == "group");
            const allChildren = groupUnderTest.children;

            const areAllChildrenWindows = allChildren.every(c => c.type === "window");

            expect(areAllChildrenWindows).to.be.true;
        });

        it("return the correct children when the parent is a row", () => {
            const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
            const allChildren = rowUnderTest.children;

            const areAllChildrenColumns = allChildren.every(c => c.type === "column");

            expect(areAllChildrenColumns).to.be.true;
        });

        it("return the correct children when the parent is a column", () => {
            const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
            const allChildren = columnUnderTest.children;

            const areAllChildrenWindows = allChildren.every(c => c.type === "window");

            expect(areAllChildrenWindows).to.be.true;
        });

        describe("", () => {
            before(async () => {
                await glue.workspaces.createWorkspace(basicConfig);
            });

            it("return the immediate children when parent is a group and the workspace is not focused", () => {
                const groupUnderTest = workspace.getBox(p => p.type == "group");
                const allChildren = groupUnderTest.children;

                expect(allChildren.length).to.eql(2);
            });

            it("return the immediate children when the parent is a row and the workspace is not focused", () => {
                const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
                const allChildren = rowUnderTest.children;

                expect(allChildren.length).to.eql(3);
            });

            it("return the immediate children when the parent is a column and the workspace is not focused", () => {
                const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
                const allChildren = columnUnderTest.children;

                expect(allChildren.length).to.eql(2);
            });

            it("return the correct children when the parent is a group and the workspace is not focused", () => {
                const groupUnderTest = workspace.getBox(p => p.type == "group");
                const allChildren = groupUnderTest.children;

                const areAllChildrenWindows = allChildren.every(c => c.type === "window");

                expect(areAllChildrenWindows).to.be.true;
            });

            it("return the correct children when the parent is a row and the workspace is not focused", () => {
                const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
                const allChildren = rowUnderTest.children;

                const areAllChildrenColumns = allChildren.every(c => c.type === "column");

                expect(areAllChildrenColumns).to.be.true;
            });

            it("return the correct children when the parent is a column and the workspace is not focused", () => {
                const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
                const allChildren = columnUnderTest.children;

                const areAllChildrenWindows = allChildren.every(c => c.type === "window");

                expect(areAllChildrenWindows).to.be.true;
            });
        });
    });

    describe("frame: Should", () => {
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
            ],
            frame: {
                newFrame: true
            }
        };

        let workspace = undefined;
        before(async () => {
            await coreReady;
            await glue.workspaces.createWorkspace(config);
            workspace = await glue.workspaces.createWorkspace(config);
            await glue.workspaces.createWorkspace(config);
        });

        after(async () => {
            const frames = await glue.workspaces.getAllFrames();
            await Promise.all(frames.map((f) => f.close()));
        });

        it("return the correct frame when the parent is a row", () => {
            const row = workspace.getAllBoxes().find(p => p.type === "row");
            const frame = row.frame;

            expect(frame.id).to.eql(workspace.frameId);
        });

        it("return the correct frame when the parent is a column", () => {
            const column = workspace.getAllBoxes().find(p => p.type === "column");
            const frame = column.frame;

            expect(frame.id).to.eql(workspace.frameId);
        });

        it("return the correct frame when the parent is a group", () => {
            const group = workspace.getAllBoxes().find(p => p.type === "group");
            const frame = group.frame;

            expect(frame.id).to.eql(workspace.frameId);
        });
    });

    describe("parent: Should", () => {
        const basicConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                },
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                }
                            ]
                        },
                        {
                            type: "column",
                            children: [{
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "dummyApp"
                                    },
                                    {
                                        type: "window",
                                        appName: "dummyApp"
                                    }
                                ]
                            }]
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "dummyApp"
                                        },
                                        {
                                            type: "row",
                                            children: []
                                        }
                                    ]
                                },
                            ]
                        }
                    ],
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

        it("return the parent when the target is a group", () => {
            const groupUnderTest = workspace.getBox(p => p.type == "group");
            const myParent = groupUnderTest.parent;

            expect(myParent.type).to.eql("column");
        });

        it("return the parent when the target is a row", () => {
            const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
            const myParent = rowUnderTest.parent;

            // to be a workspace
            expect(myParent.type).to.be.undefined;
        });

        it("return the parent when the target is a column", () => {
            const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
            const myParent = columnUnderTest.parent;

            expect(myParent.type).to.eql("row");
        });

        describe("", () => {
            before(async () => {
                await glue.workspaces.createWorkspace(basicConfig);
            });

            it("return the parent when the target is a group and workspace is not focused", () => {
                const groupUnderTest = workspace.getBox(p => p.type == "group");
                const myParent = groupUnderTest.parent;

                expect(myParent.type).to.eql("column");
            });

            it("return the parent when the target is a row and workspace is not focused", () => {
                const rowUnderTest = workspace.getBox(p => p.type == "row" && p.children.length === 3);
                const myParent = rowUnderTest.parent;

                // to be a workspace
                expect(myParent.type).to.be.undefined;
            });

            it("return the parent when the target is a column and workspace is not focused", () => {
                const columnUnderTest = workspace.getBox(p => p.type == "column" && p.children.length === 2);
                const myParent = columnUnderTest.parent;

                expect(myParent.type).to.eql("row");
            });
        });
    });

    describe("workspace: Should", () => {
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
            ],
            frame: {
                newFrame: true
            }
        };

        let workspace = undefined;
        before(async () => {
            await coreReady;
            await glue.workspaces.createWorkspace(config);
            workspace = await glue.workspaces.createWorkspace(config);
            await glue.workspaces.createWorkspace(config);
        });

        after(async () => {
            const frames = await glue.workspaces.getAllFrames();
            await Promise.all(frames.map((f) => f.close()));
        });

        it("return the correct workspace when the parent is a row", () => {
            const row = workspace.getAllBoxes().find(p => p.type === "row");
            const resultWorkspace = row.workspace;

            expect(resultWorkspace.id).to.eql(workspace.id);
        });

        it("return the correct workspace when the parent is a column", () => {
            const column = workspace.getAllBoxes().find(p => p.type === "column");
            const resultWorkspace = column.workspace;

            expect(resultWorkspace.id).to.eql(workspace.id);
        });

        it("return the correct workspace when the parent is a group", () => {
            const group = workspace.getAllBoxes().find(p => p.type === "group");
            const resultWorkspace = group.workspace;

            expect(resultWorkspace.id).to.eql(workspace.id);
        });
    });
});
