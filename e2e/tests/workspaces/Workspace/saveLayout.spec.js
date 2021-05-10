describe('saveLayout() Should ', function () {
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
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const summaries = await glue.workspaces.layouts.getSummaries();

        await Promise.all(summaries.filter(s => s && s.name && s.name.indexOf("layout.integration") !== -1).map(l => {
            return glue.workspaces.layouts.delete(l.name);
        }));

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const layoutName = gtf.getWindowName("layout.integration");
        const saveLayoutPromise = workspace.saveLayout(layoutName);

        expect(saveLayoutPromise.then).to.be.a("function");
        expect(saveLayoutPromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        const layoutName = gtf.getWindowName("layout.integration");
        await workspace.saveLayout(layoutName);
    });

    it("populate the summaries collection", async () => {
        const layoutName = gtf.getWindowName("layout.integration");
        await workspace.saveLayout(layoutName);
        const summaries = await glue.workspaces.layouts.getSummaries();

        const summariesContainLayout = summaries.some(s => s.name === layoutName);

        expect(summariesContainLayout).to.be.true;
    });

    it("set the layoutName property to the layout name when the workspace is saved", async () => {
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.saveLayout(layoutName);
        await workspace.refreshReference();

        expect(workspace.layoutName).to.eql(layoutName);
    });

    it("save the layout with a context when saveContext is true", async () => {
        const savedContext = { test: "42" };
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName, { saveContext: true });

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql(savedContext);
    });

    it("save the layout without context when saveContext is false", async () => {
        const savedContext = { test: "42" };
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName, { saveContext: false });

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql({});
    });

    it("save the layout without context when the options object is undefined", async () => {
        const savedContext = { test: "42" };
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName);

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql({});
    });

    it("resolve the promise when the workspace has been hibernated", async () => {
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();

        await workspace.saveLayout(layoutName, { saveContext: false });
    });

    it("save a layout that can be restored when the workspace has been hibernated", async () => {
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();

        await workspace.saveLayout(layoutName, { saveContext: false });

        await workspace.frame.restoreWorkspace(layoutName);
    });

    it("not update the title after the save", async () => {
        const title = "myNewTitle";
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.setTitle(title);
        await workspace.saveLayout(layoutName);
        await workspace.refreshReference();

        expect(workspace.title).to.eql(title);
    });

    Array.from([[], {}, 42, undefined, null]).forEach((input) => {
        it(`reject when the layout name is ${JSON.stringify(input)}`, (done) => {
            workspace.saveLayout(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    })
});
