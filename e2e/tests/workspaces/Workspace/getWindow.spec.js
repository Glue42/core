describe("getWindow() Should", () => {
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

    it("iterate over the windows", () => {
        let iterations = 0;
        workspace.getWindow((c) => {
            iterations += 1;
            return false;
        });

        expect(iterations).to.eql(3);
    });

    it("return the correct window", () => {
        const rowWindow = workspace.getWindow((w) => w.parent.type === "row");
        const colWindow = workspace.getWindow((w) => w.parent.type === "column");
        const groupWindow = workspace.getWindow((w) => w.parent.type === "group");

        expect(rowWindow.parent.type).to.eql("row");
        expect(colWindow.parent.type).to.eql("column");
        expect(groupWindow.parent.type).to.eql("group");
    });

    it("return undefined when no window could be found", () => {
        const win = workspace.getWindow((c) => {
            return false;
        });

        expect(win).to.be.undefined;
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        // Not focused workspace
        it("iterate over the windows when the workspace is not focused", () => {
            let iterations = 0;
            workspace.getWindow((c) => {
                iterations += 1;
                return false;
            });

            expect(iterations).to.eql(3);
        });

        it("return the correct window when the workspace is not focused", () => {
            const rowWindow = workspace.getWindow((w) => w.parent.type === "row");
            const colWindow = workspace.getWindow((w) => w.parent.type === "column");
            const groupWindow = workspace.getWindow((w) => w.parent.type === "group");

            expect(rowWindow.parent.type).to.eql("row");
            expect(colWindow.parent.type).to.eql("column");
            expect(groupWindow.parent.type).to.eql("group");
        });
    });

    Array.from([undefined, null, 42, "42", {}, []]).forEach((input) => {
        it(`throw an error when the input is ${JSON.stringify(input)}`, (done) => {
            try {
                workspace.getWindow(input);
                done("Should have thrown an error");
            } catch (error) {
                done();
            }
        });
    });


})
