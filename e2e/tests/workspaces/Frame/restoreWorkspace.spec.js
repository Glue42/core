describe('restoreWorkspace() Should', function () {

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

    let workspace;
    let frame;
    const layoutName = "layout.integration.tests";

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        frame = (await glue.workspaces.getAllFrames())[0];
        await workspace.saveLayout(layoutName);
    });

    afterEach(async () => {
        await glue.workspaces.layouts.delete(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("restore the layout when the arguments are correct and the workspace is still opened", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName);
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName, {});
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout in the same frame when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice only by name", async () => {
        const firstWorkspace = await frame.restoreWorkspace(layoutName);
        const secondWorkspace = await frame.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(3);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice with an empty object", async () => {
        const firstWorkspace = await frame.restoreWorkspace(layoutName, {});
        const secondWorkspace = await frame.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(3);
    });

    it("restore the layout in the same frame when the workspace is still opened and newFrame is false", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName, { newFrame: false });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened and frameId is passed", async () => {
        const secondWorkspace = await frame.restoreWorkspace(layoutName, { frameId: workspace.frameId });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("set the workspace context to the given context when a context is passed", async () => {
        const context = {
            my: "context"
        };

        const secondWorkspace = await frame.restoreWorkspace(layoutName, { context });
        const workspaceContext = await secondWorkspace.getContext();

        expect(workspaceContext).to.eql(context);
    });

    it("merge the context in the layout and the passed context when the layout contains a context and a context has been passed", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const secondContext = {
            test: "42"
        }

        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const restoredWorkspace = await frame.restoreWorkspace(layoutName, { context: secondContext });
        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(Object.assign(secondContext, contextToBeSaved));
    });

    it.skip("reuse the specified workspace when the reuseWorkspaceIdOptions is passed", async () => {
        await workspace.addWindow({
            type: "window",
            appName: "dummyApp"
        });
        const secondWorkspace = await frame.restoreWorkspace(layoutName, { reuseWorkspaceId: workspace.id });
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();
        const workspaceWindows = secondWorkspace.getAllWindows();

        expect(workspaceSummaries.length).to.eql(1);
        expect(workspaceWindows.length).to.eql(1);
    });

    it("restore the layout with the given title when a title is passed", async () => {
        const title = "myNewTitle";
        const secondWorkspace = await frame.restoreWorkspace(layoutName, { title });

        expect(secondWorkspace.title).to.eql(title);
    });

    it("reject the promise when there isn't a layout with such name", (done) => {
        frame.restoreWorkspace("some missing layout").then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from([null, undefined, 42, "SomeString", [], {}]).forEach((input) => {
        if (typeof input != "string") {
            it(`reject the promise when the name parameter is ${JSON.stringify(input)}`, (done) => {
                frame.restoreWorkspace(input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }

        if (typeof input != "undefined" && typeof input != "object") {
            it(`reject the promise when the options parameter is ${JSON.stringify(input)}`, (done) => {
                frame.restoreWorkspace(layoutName, input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }
    });
});
