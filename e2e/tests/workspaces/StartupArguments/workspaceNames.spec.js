// incorrect tests
describe.skip("Argument workspaceNames Should", () => {
    const sampleLayoutNameOne = "sample-workspace-name-one";
    const sampleLayoutNameTwo = "sample-workspace-name-two";

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

    it("open a frame with the specified workspaces", async () => {
        const winName = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(winName, `/glue/workspaces?workspaceNames=["${sampleLayoutNameOne}","${sampleLayoutNameTwo}"]`);

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
        const windowCount = firstWorkspace.getAllWindows().length + secondWorkspace.getAllWindows().length;

        expect(framesCount).to.eql(1);
        expect(workspacesCount).to.eql(2);
        expect(windowCount).to.eql(3);
    });

    it("set the layoutName to the workspaceName when a workspace is restored from a query argument", async () => {
        const winName = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(winName, `/glue/workspaces?workspaceNames=["${sampleLayoutNameOne}","${sampleLayoutNameTwo}"]`);

        const foundServer = glue.interop.servers().find((server) => {
            const serverMatch = server.windowId === win.id;
            const methodMatch = server.getMethods().some((method) => method.name === "T42.Workspaces.Control");

            return serverMatch && methodMatch;
        });

        if (!foundServer) {
            await waitForControl(win);
        }

        const firstWorkspace = (await glue.workspaces.getAllWorkspaces())[0];
        const secondWorkspace = (await glue.workspaces.getAllWorkspaces())[1];

        if (firstWorkspace.getAllWindows().length === 1) {
            expect(firstWorkspace.layoutName).to.eql(sampleLayoutNameOne);
            expect(secondWorkspace.layoutName).to.eql(sampleLayoutNameTwo);
        } else if (firstWorkspace.getAllWindows().length === 2) {
            expect(firstWorkspace.layoutName).to.eql(sampleLayoutNameTwo);
            expect(secondWorkspace.layoutName).to.eql(sampleLayoutNameOne);
        } else {
            throw new Error("Invalid window count in the workspace objects");
        }
    });
});
