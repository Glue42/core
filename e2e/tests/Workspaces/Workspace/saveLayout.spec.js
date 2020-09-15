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

    before(() => {
        return coreReady;
    });

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

    Array.from([[], {}, 42, undefined, null]).forEach((input) => {
        it(`reject when the layout name is ${JSON.stringify(input)}`, (done) => {
            workspace.saveLayout(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    })
});
