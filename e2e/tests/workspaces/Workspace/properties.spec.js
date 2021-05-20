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

    const decorationsHeight = 30;

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

    describe("isHibernated: Should", () => {
        let workspace;

        beforeEach(async () => {
            workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
        });

        afterEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));
        });

        it("be false when the workspace hasnt been hibernated", () => {
            expect(workspace.isHibernated).to.be.false;
        });

        it("be true when the workspace has been hibernated", async () => {
            await workspace.frame.createWorkspace(threeContainersConfig);
            await workspace.hibernate();
            await workspace.refreshReference();

            expect(workspace.isHibernated).to.be.true;
        });

        it("be false when the workspace has been resumed", async () => {
            await workspace.frame.createWorkspace(threeContainersConfig);
            await workspace.hibernate();
            await workspace.resume();
            await workspace.refreshReference();

            expect(workspace.isHibernated).to.be.false;
        });

        it("be true when the workspace has been resumed and then hibernated", async () => {
            await workspace.frame.createWorkspace(threeContainersConfig);
            await workspace.hibernate();
            await workspace.resume();
            await workspace.hibernate();
            await workspace.refreshReference();

            expect(workspace.isHibernated).to.be.true;
        });
    });

    describe("constraints: Should", () => {
        afterEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));
        });

        it("be equal to the default values when no elements have constraints", async () => {
            const singleWindowConfig = {
                children: [
                    windowConfig
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10);
            expect(workspace.maxHeight).to.eql(32767);
        });

        Array.from([200, 300]).forEach((mw) => {
            it(`have a minWidth equal to the sum of all minWidths (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minWidth).to.eql(3 * mw);
            });

            it(`have a minHeight equal to the sum of all minHeight (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minHeight).to.eql(3 * mw);
            });

            it(`have a minWidth equal to the biggest (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw + 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minWidth).to.eql(mw + 10);
            });

            it(`have a minHeight equal to the biggest minHeight (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw + 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minHeight).to.eql(mw + 10);
            });

            it(`have a maxWidth equal to the sum of all maxWidths (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxWidth).to.eql(3 * mw);
            });

            it(`have a maxHeight equal to the sum of all maxHeight (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxHeight).to.eql(3 * mw);
            });

            it(`have a maxWidth equal to the smallest (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw - 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxWidth).to.eql(mw - 10);
            });

            it(`have a maxHeight equal to the smallest maxHeight (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw - 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxHeight).to.eql(mw - 10);
            });

            it(`have a minWidth equal to the sum of all minWidths (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minWidth).to.eql(3 * mw);
            });

            it(`have a minHeight equal to the sum of all minHeight (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minHeight).to.eql(3 * mw);
            });

            it(`have a minWidth equal to the biggest (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw + 10
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minWidth).to.eql(mw + 10);
            });

            it(`have a minHeight equal to the biggest minHeight (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw
                                                    },
                                                }
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
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw + 10
                                                    },
                                                }
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
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.minHeight).to.eql(mw + 10 + decorationsHeight);
            });

            it(`have a maxWidth equal to the sum of all maxWidths (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxWidth).to.eql(3 * mw);
            });

            it(`have a maxHeight equal to the sum of all maxHeight (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxHeight).to.eql(3 * mw);
            });

            it(`have a maxWidth equal to the smallest (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw - 10
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxWidth).to.eql(mw - 10);
            });

            it(`have a maxHeight equal to the smallest maxHeight (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw
                                                    },
                                                }
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
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw - 10
                                                    },
                                                }
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
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                const workspace = await glue.workspaces.createWorkspace(config);

                expect(workspace.maxHeight).to.eql(mw - 10 + decorationsHeight);
            });
        });

        it(`have a minWidth equal to the biggest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 100
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 400
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 200
                                },
                            }
                        ]
                    }
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(400);
        });

        it(`have a minHeight equal to the biggest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 100
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 400
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 200
                                },
                            }
                        ]
                    }
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minHeight).to.eql(400 + decorationsHeight);
        });

        it(`have a maxWidth equal to the smallest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 500
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 700
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 600
                                },
                            }
                        ]
                    }
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.maxWidth).to.eql(500);
        });

        it(`have a maxHeight equal to the smallest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 500
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 700
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 600
                                },
                            }
                        ]
                    }
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.maxHeight).to.eql(500 + decorationsHeight);
        });

        it("set the constraints to the default ones when a row has invalid height constraints", async () => {
            const config = {
                children: [
                    {
                        type: "row",
                        config: {
                            minHeight: 600,
                            maxHeight: 500
                        },
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 200,
                                            maxHeight: 800
                                        },
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a column has invalid width constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        config: {
                            minWidth: 600,
                            maxWidth: 500
                        },
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 200,
                                            maxHeight: 800
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a group has invalid width constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minWidth: 600,
                                    maxWidth: 500
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 200,
                                            maxHeight: 800
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a group has invalid height constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minHeight: 600,
                                    maxHeight: 500
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 200,
                                            maxHeight: 800
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a window has invalid width constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minWidth: 200,
                                    maxWidth: 800
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minWidth: 800,
                                            maxWidth: 300
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a group has invalid height constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minWidth: 200,
                                    maxWidth: 800
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minWidth: 800,
                                            maxWidth: 300
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a parent and child have incompatible width constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minWidth: 200,
                                    maxWidth: 800
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minWidth: 850,
                                            maxWidth: 1000
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a parent and child have incompatible height constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                config: {
                                    minHeight: 200,
                                    maxHeight: 800
                                },
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 850,
                                            maxHeight: 1000
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a parent and an inderect child have incompatible width constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        config: {
                            minWidth: 200,
                            maxWidth: 800
                        },
                        children: [
                            {
                                type: "group",

                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minWidth: 850,
                                            maxWidth: 1000
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

        it("set the constraints to the default ones when a parent and an indirect child have incompatible height constraints", async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        config: {
                            minHeight: 200,
                            maxHeight: 800
                        },
                        children: [
                            {
                                type: "group",

                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                        config: {
                                            minHeight: 850,
                                            maxHeight: 1000
                                        }
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    },
                                    {
                                        type: "window",
                                        appName: "noGlueApp",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);

            expect(workspace.minWidth).to.eql(10);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(10 + decorationsHeight);
            expect(workspace.maxHeight).to.eql(32767);
        });

    });

    describe("width: Should", () => {
        it("be a number", async () => {
            const singleWindowConfig = {
                children: [
                    windowConfig
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);

            expect(workspace.width).to.be.a("number");
        });
    });

    describe("height: Should", () => {
        it("be a number", async () => {
            const singleWindowConfig = {
                children: [
                    windowConfig
                ]
            }

            const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);

            expect(workspace.height).to.be.a("number");
        });
    });
});
