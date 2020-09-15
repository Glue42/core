describe("Argument workspaceNames Should", () => {
    const sampleLayoutNameOne = "sample-workspace-name-one";
    const sampleLayoutNameTwo = "sample-workspace-name-two";

    const context = {
        my: "custom context"
    };

    const basicConfigOne = {
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
    };

    const basicConfigTwo = {
        children: [
            {
                type: "group",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    },
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ]
    };

    const waitForControl = (win) => {
        return new Promise((res) => {
            const unsubscribe = glue.interop.serverMethodAdded((info) => {
                if (!info?.server || !info?.method) {
                    return;
                }

                const nameMatch = info.method.name === "T42.Workspaces.Control";
                const serverMatch = info.server.windowId === win?.id;

                if (win?.id && nameMatch && serverMatch) {
                    unsubscribe();
                    res();
                }
            });
        });
    }

    before(async () => {
        await coreReady;
        const workspaceOne = await glue.workspaces.createWorkspace(basicConfigOne);
        const workspaceTwo = await glue.workspaces.createWorkspace(basicConfigTwo);

        await workspaceOne.saveLayout(sampleLayoutNameOne);
        await workspaceTwo.saveLayout(sampleLayoutNameTwo);

        await workspaceOne.close();
        await workspaceTwo.close();

    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map(f => f.close()));
    });

    after(async () => {
        await glue.workspaces.layouts.delete(sampleLayoutNameOne);
        await glue.workspaces.layouts.delete(sampleLayoutNameTwo);
    });

    it("load the windows with the given context when the other argument is workspaceNames", async () => {
        const winName = gtf.getWindowName("workspaces");
        const url = `/glue/workspaces?workspaceNames=["${sampleLayoutNameOne}","${sampleLayoutNameTwo}"]&context=${JSON.stringify(context)}`
        const win = await glue.windows.open(winName, url);

        const foundServer = glue.interop.servers().find((server) => {
            const serverMatch = server.windowId === win.id;
            const methodMatch = server.getMethods().some((method) => method.name === "T42.Workspaces.Control");

            return serverMatch && methodMatch;
        });

        if (!foundServer) {
            await waitForControl(win);
        }

        const framesCount = (await glue.workspaces.getAllFrames()).length;
        const workspacesCount = (await glue.workspaces.getAllWorkspaces()).length;

        const firstWorkspace = (await glue.workspaces.getAllWorkspaces())[0];
        const secondWorkspace = (await glue.workspaces.getAllWorkspaces())[1];
        const allWindows = [...firstWorkspace.getAllWindows(), ...secondWorkspace.getAllWindows()];

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(2);
        expect(allWindows.length).to.eql(3);

        await Promise.all(allWindows.map(async (w) => {
            await w.forceLoad();

            const glueWin = w.getGdWindow();
            const gwContext = await glueWin.getContext();

            expect(gwContext).to.eql(context);
        }));
    });

    it("load the windows with the given context when the other argument is workspaceName", async () => {
        const winName = gtf.getWindowName("workspaces");
        const url = `/glue/workspaces?workspaceName=${sampleLayoutNameOne}&context=${JSON.stringify(context)}`
        const win = await glue.windows.open(winName, url);

        const foundServer = glue.interop.servers().find((server) => {
            const serverMatch = server.windowId === win.id;
            const methodMatch = server.getMethods().some((method) => method.name === "T42.Workspaces.Control");

            return serverMatch && methodMatch;
        });

        if (!foundServer) {
            await waitForControl(win);
        }

        const framesCount = (await glue.workspaces.getAllFrames()).length;
        const workspacesCount = (await glue.workspaces.getAllWorkspaces()).length;

        const firstWorkspace = (await glue.workspaces.getAllWorkspaces())[0];
        const allWindows = firstWorkspace.getAllWindows();

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(1);
        expect(allWindows.length).to.eql(1);

        await Promise.all(allWindows.map(async (w) => {
            await w.forceLoad();
            const glueWin = w.getGdWindow();
            const gwContext = await glueWin.getContext();

            expect(gwContext).to.eql(context);
        }));
    });
});
