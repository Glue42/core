describe('getAllWorkspaces() Should ', function () {
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
        ]
    }
    before(() => coreReady);

    // TODO add predicate tests
    beforeEach(async () => {
        await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    // this should be iterated with different complexities configs
    // BASIC

    it('return a promise', async () => {
        const getAllWorkspacesPromise = glue.workspaces.getAllWorkspaces();
        expect(getAllWorkspacesPromise.then).to.be.a("function");
        expect(getAllWorkspacesPromise.catch).to.be.a("function");
    });

    it('resolve', async () => {
        await glue.workspaces.getAllWorkspaces();
    });

    it('resolve with an array of workspace instances', async () => {
        const workspaces = await glue.workspaces.getAllWorkspaces();

        workspaces.forEach((wsp) => {
            expect(wsp.constructor.name).to.eql("Workspace");
        });
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`return an array with ${i + 1} workspace instances with correct ids`, async () => {
            const workspaceIds = await Promise.all(Array.from({ length: i }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);
                return workspace.id;
            }));
            const allWorkspaces = await glue.workspaces.getAllWorkspaces();
            workspaceIds.forEach((wspId) => {
                expect(allWorkspaces.some((workspace) => wspId === workspace.id)).to.be.true;
            });
        });
    });

    it("return an empty array when the single opened workspace has just been closed", async () => {
        const allFrames = await glue.workspaces.getAllFrames();
        await Promise.all(allFrames.map((f) => f.close()));

        const allWorkspacesAfterClosing = await glue.workspaces.getAllWorkspaces();

        expect(allWorkspacesAfterClosing.length).to.eql(0);
    });
});
