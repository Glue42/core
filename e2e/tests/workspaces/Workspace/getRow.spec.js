describe("getRow() Should", () => {
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

    it("iterate over all rows", () => {
        let iterations = 0;
        workspace.getRow((r) => {
            iterations += 1;
            return false;
        });

        expect(iterations).to.eql(2);
    });

    it("return the correct row", () => {
        const row = workspace.getRow((r) => r.children[0].type !== "window");
        const rowWithWindow = workspace.getRow((r) => r.children[0].type === "window");

        expect(row.children[0].type).to.eql("column");
        expect(rowWithWindow.children[0].type).to.eql("window");
    });

    it("return undefined when no row could be found", () => {
        const row = workspace.getRow((p) => {
            return false;
        });

        expect(row).to.be.undefined;
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        // Not focused workspace
        it("iterate over all rows when the workspace is not focused", () => {
            let iterations = 0;
            workspace.getRow((r) => {
                iterations += 1;
                return false;
            });

            expect(iterations).to.eql(2);
        });

        it("return the correct row when the workspace is not focused", () => {
            const row = workspace.getRow((r) => r.children[0].type !== "window");
            const rowWithWindow = workspace.getRow((r) => r.children[0].type === "window");

            expect(row.children[0].type).to.eql("column");
            expect(rowWithWindow.children[0].type).to.eql("window");
        });
    });



    Array.from([undefined, null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getRow(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });


})
