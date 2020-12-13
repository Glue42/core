describe('getMyFrame() Should ', function () {
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
        await Promise.all(frames.map((f) => f.close()));
    });

    it.skip('return the current frame when the window is in a workspace', async () => {
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

        const myFrame = await glue.workspaces.getMyFrame();

        // TODO maybe move it to the cleanup logic
        await myWindow.eject();

        expect(myFrame.id).to.eql(myWorkspace.frameId);
        expect(myFrame.constructor.name).to.eql("Frame");
    });


    it.skip('return the current frame when the window has been added to a workspace', async () => {
        const workspaces = await glue.workspaces.getAllWorkspaces();
        const myWinId = glue.windows.my().id;
        const firstWorkspace = workspaces[0];

        await firstWorkspace.addWindow({ windowId: myWinId });

        const secondWorkspace = await glue.workspaces.createWorkspace(basicConfig);
        const myWindow = firstWorkspace.getAllWindows().find(w => w.windowId === myWinId);

        const myFrame = await glue.workspaces.getMyFrame();

        await myWindow.eject();

        expect(myFrame.id).to.eql(firstWorkspace.frameId);
        expect(myFrame.constructor.name).to.eql("Frame");
    });

    it('reject when the window is not in a workspace', (done) => {
        glue.workspaces.getMyFrame().then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it.skip('reject when the window has been removed from a workspace', (done) => {
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
            glue.workspaces.getMyFrame().then(() => done("Should not resolve")).catch(() => done());
        }).catch(done);
    });
});
