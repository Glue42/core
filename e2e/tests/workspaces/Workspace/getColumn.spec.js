describe("getColumn() Should", () => {
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

    it("iterate over all columns", () => {
        let iterations = 0;
        workspace.getColumn((r) => {
            iterations += 1;
            return false;
        });

        expect(iterations).to.eql(3);
    });

    it("return the correct column", () => {
        const columnWithRow = workspace.getColumn((r) => r.children[0].type === "row");
        const columnWithWindow = workspace.getColumn((r) => r.children[0].type === "window");
        const columnWithGroup = workspace.getColumn((r) => r.children[0].type === "group");

        expect(columnWithRow.children[0].type).to.eql("row");
        expect(columnWithWindow.children[0].type).to.eql("window");
        expect(columnWithGroup.children[0].type).to.eql("group");
    });

    it("return undefined when no column could be found", () => {
        const column = workspace.getColumn((p) => {
            return false;
        });

        expect(column).to.be.undefined;
    });

    // Not focused workspace
    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("iterate over all columns when the workspace is not focused", () => {
            let iterations = 0;
            workspace.getColumn((r) => {
                iterations += 1;
                return false;
            });

            expect(iterations).to.eql(3);
        });

        it("return the correct column when the workspace is not focused", () => {
            const columnWithRow = workspace.getColumn((r) => r.children[0].type === "row");
            const columnWithWindow = workspace.getColumn((r) => r.children[0].type === "window");
            const columnWithGroup = workspace.getColumn((r) => r.children[0].type === "group");

            expect(columnWithRow.children[0].type).to.eql("row");
            expect(columnWithWindow.children[0].type).to.eql("window");
            expect(columnWithGroup.children[0].type).to.eql("group");
        });
    });

    Array.from([undefined, null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getColumn(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });


})
