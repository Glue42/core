describe("resize() Should", () => {
    const basicConfig = {
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
            }
        ]
    };

    before(() => coreReady);

    let workspace;
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it.skip("move the frame", async () => {
        const boundsBeforeResize = await workspace.frame.getBounds();

        await workspace.frame.move({
            left: boundsBeforeResize.left + 10,
            top: boundsBeforeResize.left + 10
        });

        const boundsAfterResize = await workspace.frame.getBounds();

        expect(boundsAfterResize.left).to.eql(boundsBeforeResize.left + 10);
        expect(boundsAfterResize.top).to.eql(boundsBeforeResize.top + 10);
    });
});