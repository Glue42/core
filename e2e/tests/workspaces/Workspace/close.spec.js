describe('close() Should ', function () {
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
    let workspace = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        await glue.workspaces.createWorkspace(basicConfig);

        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const closePromise = workspace.close();
        expect(closePromise.then).to.be.a("function");
        expect(closePromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        workspace.close();
    });

    it("remove the workspace from getAllWorkspaces", async () => {
        await workspace.close();

        const getAllWorkspaces = await glue.workspaces.getAllWorkspaces();

        const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

        expect(isWorkspaceInCollection).to.be.false;
    });

    it("remove the workspace from getAllWorkspacesSummaries", async () => {
        await workspace.close();

        const getAllWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();

        const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

        expect(isWorkspaceInCollection).to.be.false;
    });

    it("remove the workspace from getAllWorkspaces when the workspace has been closed twice", async () => {
        try {
            await Promise.all([workspace.close(), workspace.close()]);

        } catch (error) {
            // Tested elsewhere
        }

        const getAllWorkspaces = await glue.workspaces.getAllWorkspaces();

        const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

        expect(isWorkspaceInCollection).to.be.false;
    });

    it("successfully close the workspace when its hibernated", async () => {
        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();
        await workspace.close();
    });

    it("remove the workspace from the summary list when its hibernated and then close", async () => {
        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();
        const allWorkspacesCount = (await glue.workspaces.getAllWorkspacesSummaries()).length;
        await workspace.close();

        const getAllWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();

        const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

        expect(isWorkspaceInCollection).to.be.false;
        expect(allWorkspacesCount - 1).to.eql(getAllWorkspaces.length);
    });

    it("remove the workspace from getAllWorkspacesSummaries when the workspace has been closed twice", async () => {
        try {
            await Promise.all([workspace.close(), workspace.close()]);

        } catch (error) {
            // Tested elsewhere
        }
        const getAllWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();
        const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

        expect(isWorkspaceInCollection).to.be.false;
    });

    // Not focused workspace
    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("return a promise when the workspace is not focused", () => {
            const closePromise = workspace.close();
            expect(closePromise.then).to.be.a("function");
            expect(closePromise.catch).to.be.a("function");
        });

        it("resolve", async () => {
            workspace.close();
        });

        it("remove the workspace from getAllWorkspaces when the workspace is not focused", async () => {
            await workspace.close();

            const getAllWorkspaces = await glue.workspaces.getAllWorkspaces();

            const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

            expect(isWorkspaceInCollection).to.be.false;
        });

        it("remove the workspace from getAllWorkspacesSummaries when the workspace is not focused", async () => {
            await workspace.close();

            const getAllWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();

            const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

            expect(isWorkspaceInCollection).to.be.false;
        });

        it("remove the workspace from getAllWorkspaces when the workspace has been closed twice when the workspace is not focused", async () => {
            try {
                await Promise.all([workspace.close(), workspace.close()]);

            } catch (error) {
                // Tested elsewhere
            }
            const getAllWorkspaces = await glue.workspaces.getAllWorkspaces();
            const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

            expect(isWorkspaceInCollection).to.be.false;
        });

        it("remove the workspace from getAllWorkspacesSummaries when the workspace has been closed twice when the workspace is not focused", async () => {
            try {
                await Promise.all([workspace.close(), workspace.close()]);

            } catch (error) {
                // Tested elsewhere
            }

            const getAllWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();

            const isWorkspaceInCollection = getAllWorkspaces.filter(w => w.id === workspace.id).length > 0;

            expect(isWorkspaceInCollection).to.be.false;
        });
    });

    it("reject when the workspace has been closed twice", (done) => {
        workspace.close()
            .then(() => {
                return workspace.close();
            })
            .then(() => done("Should not resolve"))
            .catch(() => done());
    });

    it("reject when the workspace has been closed twice without waiting", (done) => {
        Promise.all([workspace.close(), workspace.close()]).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done();
        });
    });

});
