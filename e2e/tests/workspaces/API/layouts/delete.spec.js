// validated V2
describe('delete() Should ', function () {
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

    let layoutsForCleanup = [];

    afterEach(async () => {
        const summaries = await glue.workspaces.layouts.getSummaries();
        await Promise.all(layoutsForCleanup.map(l => {
            if (summaries.some(s => s.name === l)) {
                return glue.workspaces.layouts.delete(l);
            }
        }));
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it(`delete the layout when the name is correct`, async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const layoutName = gtf.getWindowName("layout");
        await workspace.saveLayout(layoutName);

        layoutsForCleanup.push(layoutName);

        await glue.workspaces.layouts.delete(layoutName);

        const summaries = await glue.workspaces.layouts.getSummaries();
        
        summaries.forEach((s) => console.log(s.name));
        
        expect(summaries.filter(s => s.name === layoutName).length).to.eql(0);
    });
    Array.from([null, undefined, 42, {}, []]).forEach((input) => {
        it(`reject when the name is a ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.layouts.delete(input).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});
