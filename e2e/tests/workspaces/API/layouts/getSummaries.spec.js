// validated V2
describe('getSummaries() Should ', function () {
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
    
    before(() => coreReady);

    let layoutsForCleanup = [];

    afterEach(async () => {
        const summaries = await glue.workspaces.layouts.getSummaries();
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));

        await Promise.all(layoutsForCleanup.map(l => {
            if (summaries.some(s => s.name === l)) {
                return glue.workspaces.layouts.delete(l);
            }
        }));
    });

    Array.from({ length: 3 }).forEach((_, i) => {
        it(`return ${i + 1} summaries`, async () => {
            const savePromises = Array.from({ length: i + 1 }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);
                const layoutName = gtf.getWindowName("layout");
                await workspace.saveLayout(layoutName);

                layoutsForCleanup.push(layoutName);
            });

            await Promise.all(savePromises);

            const summaries = await glue.workspaces.layouts.getSummaries();

            expect(summaries.filter(s => s.name.startsWith("layout")).length).to.eql(i + 1);
        });

        it(`return ${i + 1} summaries with the correct names`, async () => {
            const currentLayouts = [];
            const savePromises = Array.from({ length: i + 1 }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);
                const layoutName = gtf.getWindowName("layout");
                await workspace.saveLayout(layoutName);

                layoutsForCleanup.push(layoutName);
                currentLayouts.push(layoutName);
            });

            await Promise.all(savePromises);

            const summaries = await glue.workspaces.layouts.getSummaries();

            expect(summaries.filter(s => s.name.startsWith("layout")).length).to.eql(i + 1);

            currentLayouts.forEach((l) => {
                const summariesContainLayout = summaries.some(s => s.name === l);

                expect(summariesContainLayout).to.be.true;
            });
        });
    })

});
