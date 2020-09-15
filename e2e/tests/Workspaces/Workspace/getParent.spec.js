describe("getBox() Should", () => {
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

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("iterate over all boxes", () => {
        let iterations = 0;
        workspace.getBox((p) => {
            iterations += 1;
            return false;
        });

        expect(iterations).to.eql(6);
    });

    it("return the correct box", () => {
        const row = workspace.getBox((p) => p.type === "row");
        const group = workspace.getBox((p) => p.type === "group");
        const column = workspace.getBox((p) => p.type === "column");

        expect(row.type).to.eql("row");
        expect(group.type).to.eql("group");
        expect(column.type).to.eql("column");
    });

    it("return undefined when no box could be found", () => {
        const parent = workspace.getBox((p) => {
            return false;
        });

        expect(parent).to.be.undefined;
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        // Not focused workspace
        it("iterate over all boxes when the workspace is not focused", () => {
            let iterations = 0;
            workspace.getBox((p) => {
                iterations += 1;
                return false;
            });

            expect(iterations).to.eql(6);
        });

        it("return the correct box when the workspace is not focused", () => {
            const row = workspace.getBox((p) => p.type === "row");
            const group = workspace.getBox((p) => p.type === "group");
            const column = workspace.getBox((p) => p.type === "column");

            expect(row.type).to.eql("row");
            expect(group.type).to.eql("group");
            expect(column.type).to.eql("column");
        });

    });

    Array.from([undefined, null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getBox(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });


})
