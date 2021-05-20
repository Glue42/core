describe("setHeight() Should", () => {
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

    it("enlarge the height of the row when the parent is a row", async () => {
        const row = workspace.getAllRows()[0];
        const newHeight = row.height + 10;

        await row.setHeight(newHeight);

        expect(Math.abs(row.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the height of the row when the parent is a row", async () => {
        const row = workspace.getAllRows()[0];
        const newHeight = row.height - 10;
        await row.setHeight(newHeight);

        expect(Math.abs(row.height - newHeight) <= 1).to.be.true;
    });

    Array.from([undefined, null, () => { }, {}, "42", true, -1, 0]).forEach((arg) => {
        it(`reject when the passed argument is ${typeof arg}`, (done) => {
            const row = workspace.getAllRows()[0];
            row.setHeight(arg).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});