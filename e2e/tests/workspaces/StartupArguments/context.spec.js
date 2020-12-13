// incorrect tests
describe.skip("Argument context Should", () => {
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

    it("set the workspace contexts when the other argument is workspaceNames", async () => {
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

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(2);

        const firstWorkspaceContext = await firstWorkspace.getContext();
        const secondWorkspaceContext = await secondWorkspace.getContext();

        expect(firstWorkspaceContext).to.eql(context);
        expect(secondWorkspaceContext).to.eql(context);
    });

    it("set the workspace context when the other argument is workspaceName", async () => {
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

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(1);

        const firstWorkspaceContext = await firstWorkspace.getContext();

        expect(firstWorkspaceContext).to.eql(context);

    });

    it("merge the context in the layout and the passed context when the layout contains a context and a context has been passed", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const secondContext = {
            test: "42"
        }
        const layoutName = "gtf-layout-name";
        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfigOne);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const winName = gtf.getWindowName("workspaces");
        const url = `/glue/workspaces?workspaceNames=["${layoutName}"]&context=${JSON.stringify(secondContext)}`
        const win = await glue.windows.open(winName, url);

        const foundServer = glue.interop.servers().find((server) => {
            const serverMatch = server.windowId === win.id;
            const methodMatch = server.getMethods().some((method) => method.name === "T42.Workspaces.Control");

            return serverMatch && methodMatch;
        });

        if (!foundServer) {
            await waitForControl(win);
        }

        const restoredWorkspace = (await glue.workspaces.getAllWorkspaces())[0];

        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(Object.assign(secondContext, contextToBeSaved));
    });
});
