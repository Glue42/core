describe("getAllRows() Should", () => {
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "window",
                            appName: "dummyApp"
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        }]
                    },
                ]
            }
        ]
    }

    let workspace = undefined;
    //TODO add predicate tests
    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return all rows", () => {
        const rows = workspace.getAllRows();

        expect(rows.length).to.eql(2);
    });

    // Not focused workspae
    it("return all rows when the workspace is not focused", async () => {
        await glue.workspaces.createWorkspace(basicConfig);
        const rows = workspace.getAllRows();

        expect(rows.length).to.eql(2);
    });

    Array.from([null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getAllRows(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });
});
