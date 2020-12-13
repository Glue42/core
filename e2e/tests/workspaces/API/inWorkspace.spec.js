describe('inWorkspace() Should ', function () {
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

    it('return a promise', async () => {
        const getAllWorkspacesPromise = glue.workspaces.inWorkspace();

        expect(getAllWorkspacesPromise.then).to.be.a("function");
        expect(getAllWorkspacesPromise.catch).to.be.a("function");
    });

    it('resolve', async () => {
        await glue.workspaces.inWorkspace();
    });

    // When the runner is hidden there is a problem
    it.skip('return true when the window is in a workspace', async () => {
        //Arrange
        const newWorkspaceConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "window",
                            windowId: glue.windows.my().id
                        }
                    ]
                }
            ]
        };

        const myWorkspace = await glue.workspaces.createWorkspace(newWorkspaceConfig);
        const myWindow = myWorkspace.getAllWindows()[0];

        const inWorkspaceResult = await glue.workspaces.inWorkspace();

        // TODO maybe move it to the cleanup logic
        await myWindow.forceLoad();
        await myWorkspace.refreshReference();
        await myWindow.eject();

        expect(inWorkspaceResult).to.be.true;
    });

    it('return false when the window is not in a workspace', async () => {
        const inWorkspaceResult = await glue.workspaces.inWorkspace();

        expect(inWorkspaceResult).to.be.false;
    });

    it.skip('return false when the window has been removed from a workspace', async () => {
        //Arrange
        const newWorkspaceConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "window",
                            windowId: glue.windows.my().id
                        }
                    ]
                }
            ]
        };

        const myWorkspace = await glue.workspaces.createWorkspace(newWorkspaceConfig);
        const myWindow = myWorkspace.getAllWindows()[0];

        await myWindow.forceLoad();
        await myWorkspace.refreshReference();
        await myWindow.eject();

        //Act
        const inWorkspaceResult = await glue.workspaces.inWorkspace();

        //Assert
        expect(inWorkspaceResult).to.be.false;
    });

    it.skip('return true when the window has been added to a workspace', async () => {
        //Arrange
        const workspaces = await glue.workspaces.getAllWorkspaces();
        const myWinId = glue.windows.my().id;
        const firstWorkspace = workspaces[0];

        await firstWorkspace.addWindow({ windowId: myWinId });

        const myWindow = firstWorkspace.getAllWindows().find(w => w.id === myWinId);

        //Act
        const inWorkspaceResult = await glue.workspaces.inWorkspace();

        await myWindow.forceLoad();
        await firstWorkspace.refreshReference();
        await myWindow.eject();

        //Assert
        expect(inWorkspaceResult).to.be.true;
    });
});
