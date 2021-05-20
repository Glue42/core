describe("setSize() Should", () => {
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


    it("enlarge the width of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newWidth = group.width + 10;
        await group.setSize(newWidth);

        expect(group.width).to.eql(newWidth);
    });

    it("enlarge the height of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newHeight = group.height + 10;
        await group.setSize(undefined, newHeight);

        expect(Math.abs(group.height - newHeight) <= 1).to.be.true;
    });

    it("enlarge the width and height of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newHeight = group.height + 10;
        const newWidth = group.width + 10;

        await group.setSize(newWidth, newHeight);

        expect(group.width).to.eql(newWidth);
        expect(Math.abs(group.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newWidth = group.width - 10;
        await group.setSize(newWidth);

        expect(group.width).to.eql(newWidth);
    });

    it("reduce the height of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newHeight = group.height - 10;
        await group.setSize(undefined, newHeight);

        expect(Math.abs(group.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width and height of the group when the parent is a group", async () => {
        const group = workspace.getAllGroups()[0];
        const newWidth = group.width - 10;
        const newHeight = group.height - 10;
        await group.setSize(newWidth, newHeight);

        expect(group.width).to.eql(newWidth);
        expect(Math.abs(group.height - newHeight) <= 1).to.be.true;
    });


    Array.from([undefined, null, () => { }, {}, "42", true, -1, 0]).forEach((arg) => {
        it(`reject when the passed arguments are ${typeof arg}`, (done) => {
            const group = workspace.getAllGroups()[0];
            group.setSize(arg, arg).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });

});