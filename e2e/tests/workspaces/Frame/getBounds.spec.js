describe("getBounds() Should", () => {
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

    it("return an object with left, top, width, height properties", async () => {
        const bounds = await workspace.frame.getBounds();

        expect(typeof bounds.left).to.eql("number");
        expect(typeof bounds.top).to.eql("number");
        expect(typeof bounds.width).to.eql("number");
        expect(typeof bounds.height).to.eql("number");
    });

    it("return an object with positive width, height properties", async () => {
        const bounds = await workspace.frame.getBounds();

        expect(bounds.width>0).to.be.true;
        expect(bounds.height>0).to.be.true;
    });
});