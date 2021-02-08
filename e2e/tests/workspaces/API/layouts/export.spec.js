// todo: title test
describe('export() Should ', function () {
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

    let layoutsForCleanup = [];

    before(() => coreReady);

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

    Array.from({ length: 3 }).forEach((_, i) => {
        it(`return ${i + 1} layouts`, async () => {
            const savePromises = Array.from({ length: i + 1 }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);
                const layoutName = gtf.getWindowName("layout");

                await workspace.saveLayout(layoutName);

                layoutsForCleanup.push(layoutName);
            });

            await Promise.all(savePromises);

            const layouts = await glue.workspaces.layouts.export();
            const exportedLayouts = layouts.filter(s => s.name.startsWith("layout"));

            expect(exportedLayouts.length).to.eql(i + 1);
        });

        it(`return ${i + 1} layouts with the correct names`, async () => {
            const currentLayouts = [];
            const savePromises = Array.from({ length: i + 1 }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);
                const layoutName = gtf.getWindowName("layout");
                await workspace.saveLayout(layoutName);

                layoutsForCleanup.push(layoutName);
                currentLayouts.push(layoutName);
            });

            await Promise.all(savePromises);

            const layouts = await glue.workspaces.layouts.export();

            expect(layouts.filter(s => s.name.startsWith("layout.")).length).to.eql(i + 1);

            currentLayouts.forEach((cl) => {
                const currentLayout = layouts.find(l => l.name === cl);

                expect(currentLayout).to.not.be.undefined;
                expect(currentLayout.components).to.not.be.undefined;
            });
        });
    })

});
