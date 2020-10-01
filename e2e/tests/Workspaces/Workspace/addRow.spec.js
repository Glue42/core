describe('addRow() Should ', function () {
    const basicConfig = {
        children: [
            {
                type: "column",
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
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        expect(workspace.addRow().then).to.be.a("function");;
        expect(workspace.addRow().catch).to.be.a("function");;
    });

    it("resolve", async () => {
        await workspace.addRow();
    });

    it("resolve with a row", async () => {
        const row = await workspace.addRow();

        expect(row.constructor.name).to.eql("Row");
    });

    it("add the row and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const row = await workspace.addRow({
            children: [
                {
                    type: "window",
                    context: firstContext,
                    appName: "dummyApp"
                },
                {
                    type: "window",
                    context: secondContext,
                    appName: "dummyApp"
                }
            ]
        });

        await Promise.all(row.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(row.children.map(async (w, i) => {
            const glueWin = w.getGdWindow();
            const winContext = await glueWin.getContext();

            if (winContext.first) {
                expect(winContext).to.eql(firstContext);
            } else if (winContext.second) {
                expect(winContext).to.eql(secondContext);
            } else {
                throw new Error(`The window context was not set successfuly ${JSON.stringify(winContext)}`);
            }
        }));
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`add ${i + 1} empty row/s to the workspace`, async () => {

            const rows = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                return workspace.addRow();
            }))

            await workspace.refreshReference();
            const allRows = workspace.getAllRows();
            const rowChildren = rows.reduce((acc, r) => [...acc, ...r.children], []);

            expect(allRows.length).to.eql(i + 1);
            expect(rowChildren.length).to.eql(0);
        })
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        // Not focused workspace
        it("return a promise when the workspace is not focused", () => {
            expect(workspace.addRow().then).to.be.a("function");;
            expect(workspace.addRow().catch).to.be.a("function");;
        });

        it("resolve when the workspace is not focused", async () => {
            await workspace.addRow();
        });

        it("resolve with a row when the workspace is not focused", async () => {
            const row = await workspace.addRow();

            expect(row.constructor.name).to.eql("Row");
        });

        it("add the row and update the context of the windows in it when a window definition array is passed with contexts and the workspace is not focused", async () => {
            const firstContext = {
                first: true
            };

            const secondContext = {
                second: true
            };

            const row = await workspace.addRow({
                children: [
                    {
                        type: "window",
                        context: firstContext,
                        appName: "dummyApp"
                    },
                    {
                        type: "window",
                        context: secondContext,
                        appName: "dummyApp"
                    }
                ]
            });

            await Promise.all(row.children.map((w) => w.forceLoad()));
            await workspace.refreshReference();

            const wait = new Promise((r) => setTimeout(r, 3000));
            await wait;

            await Promise.all(row.children.map(async (w, i) => {
                const glueWin = w.getGdWindow();
                const winContext = await glueWin.getContext();

                if (winContext.first) {
                    expect(winContext).to.eql(firstContext);
                } else if (winContext.second) {
                    expect(winContext).to.eql(secondContext);
                } else {
                    throw new Error(`The window context was not set successfuly ${JSON.stringify(winContext)}`);
                }
            }));
        });

        Array.from({ length: 5 }).forEach((_, i) => {
            it(`add ${i + 1} row/s to the workspace when the workspace is not focused`, async () => {
                await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addRow();
                }));

                await workspace.refreshReference();
                const allRows = workspace.getAllRows();

                expect(allRows.length).to.eql(i + 1);
            });

            it(`add ${i + 1} empty row/s to the workspace when the workspace is not focused`, async () => {

                const rows = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addRow();
                }));

                await workspace.refreshReference();
                const allRows = workspace.getAllRows();
                const rowChildren = rows.reduce((acc, r) => [...acc, ...r.children], []);

                expect(allRows.length).to.eql(i + 1);
                expect(rowChildren.length).to.eql(0);
            });
        });
    });

    // TODO add tests with config
    Array.from([42, []]).forEach((input) => {
        it(`reject when the input is ${JSON.stringify(input)}`, (done) => {
            workspace.addRow(input).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    })
});
