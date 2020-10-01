describe('getMyWorkspace() Should ', function () {
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

    it.skip('return the current workspace when the window is in a workspace', async () => {
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

        //Act
        const resultWorkspace = await glue.workspaces.getMyWorkspace();

        // TODO maybe move it to the cleanup logic
        await myWindow.eject();

        //Assert
        expect(resultWorkspace.id).to.eql(myWorkspace.id);
        expect(resultWorkspace.constructor.name).to.eql("Workspace");
    });

    it.skip('return the current workspace when the window has been added to a workspace', async () => {
        //Arrange
        const workspaces = await glue.workspaces.getAllWorkspaces();
        const myWinId = glue.windows.my().id;
        const firstWorkspace = workspaces[0];

        await firstWorkspace.addWindow({ windowId: myWinId });

        const secondWorkspace = await glue.workspaces.createWorkspace(basicConfig);
        const myWindow = firstWorkspace.getAllWindows().find(w => w.windowId === myWinId);

        //Act
        const resultWorkspace = await glue.workspaces.getMyWorkspace();

        await myWindow.eject();

        //Assert
        expect(resultWorkspace.id).to.eql(firstWorkspace.frameId);
        expect(resultWorkspace.constructor.name).to.eql("Workspace");
    });

    it('reject when the window is not in a workspace', (done) => {
        glue.workspaces.getMyWorkspace().then(() => {
            done("Should not resolve")
        }).catch(() => done());
    });

    it.skip('reject when the window has been removed from a workspace', (done) => {
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

        glue.workspaces.createWorkspace(newWorkspaceConfig).then((myWorkspace) => {
            const myWindow = myWorkspace.getAllWindows()[0];

            return myWindow.eject();
        }).then(() => {
            glue.workspaces.getMyWorkspace().then(() => {
                done("Should not resolve");
            }).catch(() => done());
        }).catch(done);
    });
});
