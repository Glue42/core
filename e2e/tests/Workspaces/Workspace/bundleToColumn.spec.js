describe('bundleToColumn() Should ', function () {
    const basicConfigWithRow = {
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
        workspace = await glue.workspaces.createWorkspace(basicConfigWithRow);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const bundlePromise = workspace.bundleToColumn();
        expect(bundlePromise.then).to.be.a("function");
        expect(bundlePromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await workspace.bundleToColumn();
    });

    it("bundle the workspace with base element column when it is a row", async () => {
        await workspace.bundleToColumn();
        await workspace.refreshReference();

        const rows = workspace.getAllRows();
        const columns = workspace.getAllColumns();

        expect(rows.length).to.eql(1);
        expect(columns.length).to.eql(1);
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfigWithRow);
        });
        // Not focused workspace
        it("return a promise when the workspace is not focused", () => {
            const bundlePromise = workspace.bundleToColumn();
            expect(bundlePromise.then).to.be.a("function");
            expect(bundlePromise.catch).to.be.a("function");
        });

        it("resolve when the workspace is not focused", async () => {
            await workspace.bundleToColumn();
        });

        it("bundle the workspace with base element column when it is a row when the workspace is not focused", async () => {
            await workspace.bundleToColumn();
            await workspace.refreshReference();

            const rows = workspace.getAllRows();
            const columns = workspace.getAllColumns();

            expect(rows.length).to.eql(1);
            expect(columns.length).to.eql(1);
        });
    });

    //TODO expected behaviour when the base element is already a column
});
