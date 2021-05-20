describe("setWidth() Should", () => {
    const config = {
        children: [
            {
                type: "column",
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
                                                appName: "noGlueApp"
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
                                                appName: "noGlueApp"
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
                                                appName: "noGlueApp"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
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
                                                appName: "noGlueApp"
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
                                                appName: "noGlueApp"
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
                                                appName: "noGlueApp"
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

    let workspace;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("enlarge the width of the column when the parent is a column", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 1);
        const newWidth = column.width + 10;
        await column.setWidth(newWidth);

        expect(column.width).to.eql(newWidth);
    });

    it("reduce the width of the column when the parent is a column", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 1);
        const newWidth = column.width - 10;
        await column.setWidth(newWidth);

        expect(column.width).to.eql(newWidth);
    });

    Array.from([undefined, null, () => { }, {}, "42", true,-1, 0]).forEach((arg) => {
        it(`reject when the passed argument is ${typeof arg}`, (done) => {
            const column = workspace.getAllColumns().find(c => c.children.length === 1);
            column.setWidth(arg).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});