describe("constraints() Should", () => {
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

    const verticalDecorations = 30;
    const getSingleChildrenConfig = (constraints) => {
        return {
            children: [
                {
                    type: "group",
                    children: [{
                        type: "window",
                        appName: "noGlueApp",
                        config: constraints
                    }]
                }]
        };
    }

    before(() => coreReady);

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("resolve", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const frame = workspace.frame;
        await frame.constraints();
    });

    it("resolve with default constraints when no constraints have been set", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const frame = workspace.frame;
        const constraints = await frame.constraints();

        expect(constraints.minWidth).to.eql(30);
        expect(constraints.maxWidth).to.eql(32767);
        expect(constraints.minHeight).to.eql(10 + verticalDecorations * 2); // Workspace tab size and window tab size
        expect(constraints.maxHeight).to.eql(32767);
    });

    it("resolve with the same constraints as the one of the workspace when the frame has only a single workspace", async () => {
        const singleWindwoConfig = getSingleChildrenConfig({
            minWidth: 400,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 800
        });

        const workspace = await glue.workspaces.createWorkspace(singleWindwoConfig);
        const frame = workspace.frame;
        const constraints = await frame.constraints();

        expect(constraints.minWidth).to.eql(workspace.minWidth);
        expect(constraints.maxWidth).to.eql(workspace.maxWidth);
        expect(constraints.minHeight).to.eql(workspace.minHeight + verticalDecorations); // workspace size + decorations
        expect(constraints.maxHeight).to.eql(workspace.maxHeight + verticalDecorations); // workspace size + decorations
    });

    it("resolve with the smallest constraints when the frame has multiple workspaces and the constraints are different", async () => {
        const singleWindwoConfig = getSingleChildrenConfig({
            minWidth: 420,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 800
        });

        const singleWindwoConfig2 = getSingleChildrenConfig({
            minWidth: 400,
            minHeight: 450,
            maxWidth: 600,
            maxHeight: 800
        });

        const singleWindwoConfig3 = getSingleChildrenConfig({
            minWidth: 400,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 700
        });

        const workspace = await glue.workspaces.createWorkspace(singleWindwoConfig);
        const frame = workspace.frame;
        const secondWorkspace = await frame.createWorkspace(singleWindwoConfig2);
        await frame.createWorkspace(singleWindwoConfig3);

        const constraints = await frame.constraints();
        expect(constraints.minWidth).to.eql(420);
        expect(constraints.maxWidth).to.eql(600);
        expect(constraints.minHeight).to.eql(450 + verticalDecorations * 2); // workspace size + workspace tab decorations + group header decorations
        expect(constraints.maxHeight).to.eql(700 + verticalDecorations * 2); // workspace size + workspace tab decorations + group header decorations
    });

    it("remove the constraints from the invalid workspace when the frame has multiple workspaces and the constraints are incompatible", async () => {
        const singleWindowConfig = getSingleChildrenConfig({
            minWidth: 420,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 800
        });

        const singleWindowConfig2 = getSingleChildrenConfig({
            minWidth: 830,
            minHeight: 830,
            maxWidth: 1000,
            maxHeight: 1000
        });

        const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);

        await workspace.frame.createWorkspace(singleWindowConfig2);

        const constraints = await workspace.frame.constraints();

        expect(constraints.minWidth).to.eql(420);
        expect(constraints.minHeight).to.eql(400 + verticalDecorations * 2);// workspace size + workspace tab decorations + group header decorations
        expect(constraints.maxWidth).to.eql(800);
        expect(constraints.maxHeight).to.eql(800 + verticalDecorations * 2); // workspace size + workspace tab decorations + group header decorations
    });

    it("remove the constraints when the frame consists of one workspace with invalid width constraints", async () => {
        const singleWindowConfig = getSingleChildrenConfig({
            minWidth: 820,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 800
        });

        const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);
        const constraints = await workspace.frame.constraints();

        expect(constraints.minWidth).to.eql(10);
        expect(constraints.maxWidth).to.eql(32767);
        expect(constraints.minHeight).to.eql(10 + verticalDecorations * 2);// workspace size + workspace tab decorations + group header decorations
        expect(constraints.maxHeight).to.eql(32767);
    });

    it("remove the constraints when the frame consists of one workspace with invalid height constraints", async () => {
        const singleWindowConfig = getSingleChildrenConfig({
            minWidth: 420,
            minHeight: 900,
            maxWidth: 800,
            maxHeight: 800
        });

        const workspace = await glue.workspaces.createWorkspace(singleWindowConfig);
        const constraints = await workspace.frame.constraints();

        expect(constraints.minWidth).to.eql(10);
        expect(constraints.maxWidth).to.eql(32767);
        expect(constraints.minHeight).to.eql(10 + verticalDecorations * 2);// workspace size + workspace tab decorations + group header decorations
        expect(constraints.maxHeight).to.eql(32767);
    });
});