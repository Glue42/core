describe('getAllWorkspacesSummaries() Should ', function () {
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
        const getAllWorkspacesSummariesPromise = glue.workspaces.getAllWorkspacesSummaries();
        expect(getAllWorkspacesSummariesPromise.then).to.be.a("function");
        expect(getAllWorkspacesSummariesPromise.catch).to.be.a("function");
    });

    it('resolve', async () => {
        await glue.workspaces.getAllWorkspacesSummaries();
    });

    it('resolve with an array of workspace summaries', async () => {
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        workspaceSummaries.forEach((wsps) => {
            expect(wsps.id).to.not.be.undefined;
            expect(wsps.frameId).to.not.be.undefined;
            expect(wsps.title).to.not.be.undefined;
            expect(wsps.snapshot).to.be.undefined;
        });
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`return an array with a ${i + 1} workspace summaries with correct ids`, async () => {
            const workspaceIds = await Promise.all(Array.from({ length: i }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);

                return workspace.id;
            }));
            const allWorkspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

            workspaceIds.forEach((wspId) => {
                expect(allWorkspaceSummaries.some((workspaces) => wspId === workspaces.id)).to.be.true;
            });
        });
    });

    it("return an empty array when the single opened workspace has just been closed", async () => {
        const allFrames = await glue.workspaces.getAllFrames();
        await Promise.all(allFrames.map((f) => f.close()));

        const allWorkspacesAfterClosing = await glue.workspaces.getAllWorkspacesSummaries();

        expect(allWorkspacesAfterClosing.length).to.eql(0);
    })
});
