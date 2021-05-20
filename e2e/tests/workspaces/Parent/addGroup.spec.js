describe("addGroup() Should", () => {
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
        await glue.workspaces.createWorkspace(config);
        workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return the group when the parent is a row and is passed a group definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const group = await row.addGroup({ type: "group", children: [] });

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a row and is passed a group definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addGroup({ type: "group", children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a row and is passed group as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const group = await row.addGroup({ type: "group" });

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a row and is passed group as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addGroup({ type: "group" });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a row and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const group = await row.addGroup({ children: [] });

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a row and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addGroup({ children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const group = await row.addGroup();

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addGroup();
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a column and is passed a group definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const group = await column.addGroup({ type: "group", children: [] });

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a column and is passed a group definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addGroup({ type: "group", children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a column and is passed group as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const group = await column.addGroup({ type: "group" });

        expect(column).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a column and is passed group as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addGroup({ type: "group" });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the group when the parent is a column and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const group = await column.addGroup({ children: [] });

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a column and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addGroup({ children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add the group and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const group = await column.addGroup({
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

        await Promise.all(group.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(group.children.map(async (w, i) => {
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

    it("return the group when the parent is a column and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const group = await column.addGroup();

        expect(group).to.not.be.undefined;
        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group when the parent is a column and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addGroup();
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add group with allowDrop false when the parent is a column and has been locked", async () => {
        const column = workspace.getAllColumns()[0];
        await column.lock();

        const group = await column.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ]
        });

        await workspace.refreshReference();

        expect(group.allowDrop).to.be.false;
    });

    it("update the constraints when the parent is a column and the group has constraints", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const group = await column.addGroup({
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
                minHeight: 600,
                maxWidth: 800,
                maxHeight: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(520);
        expect(workspace.minHeight).to.eql(600);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(900);
    });

    it("not update the constraints when the parent is a column and the group has invalid height constraints", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const group = await column.addGroup({
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
                minHeight: 1000,
                maxWidth: 800,
                maxHeight: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(30);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a column and the group has invalid width constraints", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const group = await column.addGroup({
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
                minHeight: 6000,
                maxWidth: 800,
                maxHeight: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(30);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a row and the group has incompatible height constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                    config: {
                        minHeight: 1000,
                        maxHeight: 1900
                    }
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
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
                minHeight: 500,
                maxHeight: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(10);
        expect(workspace.minHeight).to.eql(1000);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(1900);
    });

    it("not update the constraints when the parent is a column and the group has incompatible width constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "column",
                    children: [],
                    config: {
                        minWidth: 1000,
                        maxWidth: 1800,
                    }
                }
            ]
        })
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const group = await column.addGroup({
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
                maxWidth: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(1000);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(1800);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a row and the elements inside the group have incompatible height constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minHeight: 800,
                        maxHeight: 1600,
                    }
                }
            ],
            config: {
                minHeight: 500,
                maxHeight: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(10);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a row and the elements inside the group have incompatible width constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minWidth: 800,
                        maxWidth: 1600,
                    }
                }
            ],
            config: {
                minWidth: 500,
                maxWidth: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(10);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a column and the elements in the group have incompatible width constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "column",
                    children: [],
                }
            ]
        })
        const column = workspace.getAllColumns()[0];

        const group = await column.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minWidth: 1000,
                        maxWidth: 1600,
                    }
                }
            ],
            config: {
                minWidth: 500,
                maxWidth: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(10);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the parent is a column and the elements in the group have incompatible height constraints", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "column",
                    children: [],
                }
            ]
        })
        const column = workspace.getAllColumns()[0];

        const group = await column.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minHeight: 1000,
                        maxHeight: 1600,
                    }
                }
            ],
            config: {
                minHeight: 500,
                maxHeight: 600,
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(10);
        expect(workspace.minHeight).to.eql(10 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("add a locked group when the parent is an empty row and the group has constraints set", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
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
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.allowDrop).to.be.false;
        expect(group.allowExtract).to.be.false;
        expect(group.showMaximizeButton).to.be.false;
        expect(group.showEjectButton).to.be.false;
    });

    it("add a locked group with locked children when the parent is an empty row and the group has constraints set", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
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
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.children[0].allowExtract).to.be.false;
    });

    it("add a locked group with unlocked children when the parent is an empty row, the group has constraints set and the children have overrides", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        allowExtract: true
                    }
                }
            ],
            config: {
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.children[0].allowExtract).to.be.true;
    });

    it("add a locked group when the parent is a row and the group has constraints set", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            }
                        ]
                    }],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
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
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.allowDrop).to.be.false;
        expect(group.allowExtract).to.be.false;
        expect(group.showMaximizeButton).to.be.false;
        expect(group.showEjectButton).to.be.false;
    });

    it("add a locked group with locked children when the parent is a row and the group has constraints set", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: "noGlueApp"
                                }
                            ]
                        }
                    ],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
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
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.children[0].allowExtract).to.be.false;
    });

    it("add a locked group with unlocked children when the parent is a row, the group has constraints set and the children have overrides", async () => {
        const workspace = await glue.workspaces.createWorkspace({
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "group",
                            children: [
                                {
                                    type: "window",
                                    appName: "noGlueApp"
                                }
                            ]
                        }
                    ],
                }
            ]
        })
        const row = workspace.getAllRows()[0];

        const group = await row.addGroup({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        allowExtract: true
                    }
                }
            ],
            config: {
                allowDrop: false,
                allowExtract: false,
                showMaximizeButton: false,
                showEjectButton: false,
                showAddWindowButton: false,
            }
        });

        await workspace.refreshReference();

        expect(group.children[0].allowExtract).to.be.true;
    });

    it("reject when the parent is a group and is passed a group definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const group = allBoxes.find(p => p.type === "group");
        group.addGroup({ type: "group", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());

    });

    it("reject when the parent is a row and the arguments is a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addGroup({ type: "row", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the parent is a row and the arguments is a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addGroup({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the parent is a row and the arguments is a window definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addGroup({ type: "window" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the parent is a column and the arguments is a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addGroup({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the parent is a column and the arguments is a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addGroup({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })

    it("reject when the parent is a column and the arguments is a window definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addGroup({ type: "window" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    })
});
