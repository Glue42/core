describe('getAllWindows() Should ', function () {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const basicConfig = {
        children: [
            {
                type: "column",
                children: [windowConfig]
            }
        ]
    }
    let workspace = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return an array", async () => {
        const windows = await workspace.getAllWindows();

        expect(Array.isArray(windows)).to.be.true;
    });


    Array.from({ length: 3 }).forEach((_, i) => {
        it(`return only the windows in the target workspace when there are ${i} workspaces`, async () => {
            const newWorkspace = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                return glue.workspaces.createWorkspace(basicConfig);
            }));

            await workspace.refreshReference();
            const allWindows = workspace.getAllWindows();

            expect(allWindows.length).to.eql(1);
        });

        if (i < 4) {
            it(`return all windows in the target workspace when they are ${i + 2}`, async () => {
                const windows = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addWindow(windowConfig);
                }));

                await workspace.refreshReference();
                const allWindows = workspace.getAllWindows();

                expect(allWindows.length).to.eql(i + 2);
            });
        }
    });

});
