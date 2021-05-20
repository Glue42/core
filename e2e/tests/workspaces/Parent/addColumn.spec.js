describe("addColumn() Should", () => {
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

    const verticalDecorations = 30;
    let workspace = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return the column when the box parent is a row and is passed a column definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn({ type: "column", children: [] });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and is passed a column definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ type: "column", children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the column when the box parent is a row and is passed column as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn({ type: "column" });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and is passed column as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ type: "column" });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the column when the box parent is a row and a children array is passed", async () => {
        const allBox = workspace.getAllBoxes();
        const row = allBox.find(p => p.type === "row");
        const column = await row.addColumn({ children: [] });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add the column and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    context: firstContext,
                    appName: "dummyApp"
                },
                {
                    type: "window",
                    context: secondContext,
                    appName: "dummyApp"
                }
            ]
        });

        await Promise.all(column.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(column.children.map(async (w, i) => {
            const glueWin = w.getGdWindow();
            const winContext = await glueWin.getContext();

            if (winContext.first) {
                expect(winContext).to.eql(firstContext);
            } else if (winContext.second) {
                expect(winContext).to.eql(secondContext);
            } else {
                throw new Error(`The window context was not set successfuly ${JSON.stringify(winContext)}`);
            }
        }));
    });

    it("return the column when the box parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn();

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn();
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("update the constraints when a column with constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ],
            config: {
                minWidth: 500,
                maxWidth: 1000
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(530);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("not update the constraints when a column with invalid constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ],
            config: {
                minWidth: 1000,
                maxWidth: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(40);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("not update the constraints when a column with incompatible inner constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minWidth: 1200,
                        maxWidth: 1900
                    }
                }
            ],
            config: {
                minWidth: 900,
                maxWidth: 1000
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(40);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("add a locked column when a config with allowDrop:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(column.allowDrop).to.be.false;
    });

    it("add a column with locked contents when a config with allowDrop:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        },
                    ]
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(column.children[0].allowDrop).to.be.false;
    });

    it("add a locked column with unlocked contents when the children override the allowDrop constraint", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        },
                    ],
                    config: {
                        allowDrop: true
                    }
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(column.allowDrop).to.be.false;
        expect(column.children[0].allowDrop).to.be.true;
    });

    it("add a column with valid width when the column is pinned", async () => {
        const row = workspace.getAllRows().find(r => r.children.length);

        const column = await row.addColumn({
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        },
                    ]
                }
            ],
            config: {
                isPinned: true
            }
        });

        await workspace.refreshReference();

        expect(column.width > column.minWidth).to.be.true;
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(config);
        });

        it("return the column when the box parent is a row and is passed a column definition when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ type: "column", children: [] });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is passed a column definition when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ type: "column", children: [] });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("return the column when the box parent is a row and is passed column as a type when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ type: "column" });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is  passed column as a type when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ type: "column" });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("return the column when the box parent is a row and a children array is passed when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ children: [] });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and a children array is passed when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ children: [] });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("add the column and update the context of the windows in it when a window definition array is passed with contexts and the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const firstContext = {
                first: true
            };

            const secondContext = {
                second: true
            };

            const column = await row.addColumn({
                children: [
                    {
                        type: "window",
                        context: firstContext,
                        appName: "dummyApp"
                    },
                    {
                        type: "window",
                        context: secondContext,
                        appName: "dummyApp"
                    }
                ]
            });

            await Promise.all(column.children.map((w) => w.forceLoad()));
            await workspace.refreshReference();

            const wait = new Promise((r) => setTimeout(r, 3000));
            await wait;

            await Promise.all(column.children.map(async (w, i) => {
                const glueWin = w.getGdWindow();
                const winContext = await glueWin.getContext();

                if (winContext.first) {
                    expect(winContext).to.eql(firstContext);
                } else if (winContext.second) {
                    expect(winContext).to.eql(secondContext);
                } else {
                    throw new Error(`The window context was not set successfully ${JSON.stringify(winContext)}`);
                }
            }));
        });

        it("return the column when the box parent is a row and is without arguments when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn();

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is without arguments when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn();
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });
    });

    it("reject when the box parent is a column and is passed a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "column");
        row.addColumn({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a group and is passed a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "group");
        row.addColumn({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a row and the arguments is a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "row", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the box parent is a row and the arguments is a group definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "group", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the box parent is a row and the arguments is a window definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "window" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })
});
