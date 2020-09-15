describe("getGroup() Should", () => {
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
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "dummyApp"
                                    }]
                                }]
                        }]
                    },
                ]
            }
        ]
    }

    let workspace = undefined;

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("iterate over all groups", () => {
        let iterations = 0;
        workspace.getGroup((g) => {
            iterations += 1;
            return false;
        });

        expect(iterations).to.eql(2);
    });

    it("return the correct group", () => {
        const groupWithColumn = workspace.getGroup((g) => g.parent.type === "column");
        const groupWithRow = workspace.getGroup((g) => g.parent.type === "row");

        expect(groupWithColumn.parent.type).to.eql("column");
        expect(groupWithRow.parent.type).to.eql("row");
    });

    it("return undefined when no group could be found", () => {
        const group = workspace.getGroup((p) => {
            return false;
        });

        expect(group).to.be.undefined;
    });

    describe("", () => {
        // Not focused workspace

        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("iterate over all groups when the workspace is not focused", () => {
            let iterations = 0;
            workspace.getGroup((g) => {
                iterations += 1;
                return false;
            });

            expect(iterations).to.eql(2);
        });

        it("return the correct group when the workspace is not focused", () => {
            const groupWithColumn = workspace.getGroup((g) => g.parent.type === "column");
            const groupWithRow = workspace.getGroup((g) => g.parent.type === "row");

            expect(groupWithColumn.parent.type).to.eql("column");
            expect(groupWithRow.parent.type).to.eql("row");
        });
    });

    Array.from([undefined, null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getGroup(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });


})
