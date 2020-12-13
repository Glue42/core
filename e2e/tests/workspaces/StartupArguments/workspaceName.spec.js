// incorrect tests
describe.skip("Argument workspaceName Should", () => {
    const sampleLayoutName = "sample-workspace-name";

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
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.saveLayout(sampleLayoutName);

        await workspace.close();
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map(f => f.close()));
    });

    after(async () => {
        await glue.workspaces.layouts.delete(sampleLayoutName);
    });

    it("open a frame with the specified workspace", async () => {
        const winName = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(winName, `/glue/workspaces?workspaceName=${sampleLayoutName}`);

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
        const windowCount = firstWorkspace.getAllWindows().length;

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(1);
        expect(windowCount).to.eql(1);
    });

    it("set the layoutName to the workspaceName when a workspace is restored from a query argument", async () => {
        const winName = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(winName, `/glue/workspaces?workspaceName=${sampleLayoutName}`);

        const foundServer = glue.interop.servers().find((server) => {

            const serverMatch = server.windowId === win.id;
            const methodMatch = server.getMethods().some((method) => method.name === "T42.Workspaces.Control");

            return serverMatch && methodMatch;
        });

        if (!foundServer) {
            await waitForControl(win);
        }
        const firstWorkspace = (await glue.workspaces.getAllWorkspaces())[0];

        expect(firstWorkspace.layoutName).to.eql(sampleLayoutName);
    });
});
