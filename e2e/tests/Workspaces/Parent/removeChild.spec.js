describe("removeChild() Should", () => {
    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("remove the child when the child is a column and doesn't have more children and the parent is a row", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: []
                    },
                    {
                        type: "column",
                        children: [{ type: "window", appName: "dummyApp" }]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "column");
        await workspace.refreshReference();

        const columns = workspace.getAllColumns();

        expect(columns.length).to.eql(1);
    });

    it("remove the child when the child is a group and doesn't have more children and the parent is a row", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "group",
                            children: []
                        },
                        {
                            type: "column",
                            children: [
                                { type: "window", appName: "dummyApp" }
                            ]
                        }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);

        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "group");

        await workspace.refreshReference();

        const group = workspace.getBox(p => p.type === "group");

        expect(group).to.be.undefined;
    });

    it("remove the child when the child is a row and doesn't have more children and the parent is a column", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "row",
                        children: []
                    },
                    {
                        type: "row",
                        children: [{ type: "window", appName: "dummyApp" }]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "row");
        await workspace.refreshReference();

        const row = workspace.getAllRows();

        expect(row.length).to.eql(1);
    });

    it("remove the child when the child is a group and doesn't have more children and the parent is a column", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "group",
                        children: []
                    },
                    {
                        type: "row",
                        children: [{ type: "window", appName: "dummyApp" }]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const group = workspace.getBox(p => p.type === "group");

        expect(group).to.be.undefined;
    });

    it("remove the child and all of its children when the child is a column and has more children and the parent is a row", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: []
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{ type: "window", appName: "dummyApp" }]
                            }
                        ]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "column");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();

        expect(boxes.length).to.eql(2);
    });

    it("remove the child and all of its children when the child is a group and has more children and the parent is a row", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "dummyApp"
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "window",
                                appName: "dummyApp"
                            }
                        ]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(1);
        expect(windows.length).to.eql(1);
    });

    it("remove the child and all of its children when the child is a row and has more children and the parent is a column", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
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
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "row");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(0);
        expect(windows.length).to.eql(0);
    });

    it("remove the child and all of its children when the child is a group and has more children and the parent is a column", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                        }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(0);
        expect(windows.length).to.eql(0);
    });

    it("remove the child when the child is a window and doesn't have more children and the parent is a group", async () => {
        const config = {
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "dummyApp"
                        },
                        {
                            type: "window",
                            appName: "dummyApp"
                        }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);

        const group = workspace.getBox(p => p.type === "group");
        const windowsBeforeRemove = workspace.getAllWindows();

        await group.removeChild(c => c.id === windowsBeforeRemove[0].id);
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(2); // It has an underlying column
        expect(windows.length).to.eql(1);
    });

    // Not focused
    it("remove the child when the child is a column and doesn't have more children and the parent is a row and the workspaces is not focused", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: []
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "column");
        await workspace.refreshReference();

        const column = workspace.getBox(p => p.type === "column");

        expect(column).to.be.undefined;
    });

    it("remove the child when the child is a group and doesn't have more children and the parent is a row and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: []
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "group");

        await workspace.refreshReference();

        const group = workspace.getBox(p => p.type === "group");

        expect(group).to.be.undefined;
    });

    it("remove the child when the child is a row and doesn't have more children and the parent is a column and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "row",
                        children: []
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "row");
        await workspace.refreshReference();

        const row = workspace.getBox(p => p.type === "row");

        expect(row).to.be.undefined;
    });

    it("remove the child when the child is a group and doesn't have more children and the parent is a column and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "group",
                        children: []
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const group = workspace.getBox(p => p.type === "group");

        expect(group).to.be.undefined;
    });

    it("remove the child and all of its children when the child is a column and has more children and the parent is a row and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: []
                            }
                        ]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);
        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "column");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();

        expect(boxes.length).to.eql(0); // the workspace is closed
    });

    it("remove the child and all of its children when the child is a group and has more children and the parent is a row and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "dummyApp"
                            }
                        ]
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const row = workspace.getBox(p => p.type === "row");

        await row.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(0); // The workspace is closed
        expect(windows.length).to.eql(0);
    });

    it("remove the child and all of its children when the child is a row and has more children and the parent is a column and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
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
                    }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "row");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(0); // the workspace is closed
        expect(windows.length).to.eql(0);
    });

    it("remove the child and all of its children when the child is a group and has more children and the parent is a column and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: "dummyApp"
                                }]
                        }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);

        const column = workspace.getBox(p => p.type === "column");

        await column.removeChild(c => c.type === "group");
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(0); // the workspace is closed
        expect(windows.length).to.eql(0);
    });

    it("remove the child when the child is a window and doesn't have more children and the parent is a group and the workspace is not focused", async () => {
        const config = {
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "dummyApp"
                        },
                        {
                            type: "window",
                            appName: "dummyApp"
                        }]
                }
            ]
        }

        const workspace = await glue.workspaces.createWorkspace(config);

        await glue.workspaces.createWorkspace(config);

        const group = workspace.getBox(p => p.type === "group");
        const windowsBeforeRemove = workspace.getAllWindows();


        await group.removeChild(c => c.id === windowsBeforeRemove[0].id);
        await workspace.refreshReference();

        const boxes = workspace.getAllBoxes();
        const windows = workspace.getAllWindows();

        expect(boxes.length).to.eql(2); // it has an underlying column
        expect(windows.length).to.eql(1);
    });

    Array.from([null, undefined, [], {}, 42, "42"]).forEach((input) => {
        it(`reject when the argument is ${JSON.stringify(input)}`, (done) => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "dummyApp"
                            },
                            {
                                type: "window",
                                appName: "dummyApp"
                            }]
                    }
                ]
            }

            glue.workspaces.createWorkspace(config).then((workspace) => {
                const group = workspace.getBox(p => p.type === "group");
                const windows = workspace.getAllWindows();

                return group.removeChild(input);
            }).then(() => done("Should not resolve")).catch(() => done());
        });
    });

});
