describe('addGroup() Should ', function () {
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
        await Promise.all(frames.map((frame) => frame.close()));
    });

    it("return a promise", () => {
        expect(workspace.addGroup().then).to.be.a("function");;
        expect(workspace.addGroup().catch).to.be.a("function");;
    });

    it("resolve", async () => {
        await workspace.addGroup();
    });

    it("resolve with a group", async () => {
        const group = await workspace.addGroup();

        expect(group.constructor.name).to.eql("Group");
    });

    it("add the group and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const group = await workspace.addGroup({
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

        await Promise.all(group.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(group.children.map(async (w, i) => {
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
        it(`add ${i + 1} empty group/s to the workspace`, async () => {

            const groups = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                return workspace.addGroup();
            }))

            await workspace.refreshReference();
            const allGroups = workspace.getAllGroups();

            const groupChildren = groups.reduce((acc, r) => [...acc, ...r.children], []);

            expect(allGroups.length).to.eql(i + 1);
            expect(groupChildren.length).to.eql(0);
        })
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        // Not focused workspace
        it("return a promise when the workspace is not focused", () => {
            expect(workspace.addGroup().then).to.be.a("function");;
            expect(workspace.addGroup().catch).to.be.a("function");;
        });

        it("resolve when the workspace is not focused", async () => {
            await workspace.addGroup();
        });

        it("resolve with a group when the workspace is not focused", async () => {
            const group = await workspace.addGroup();

            expect(group.constructor.name).to.eql("Group");
        });

        it("add the group and update the context of the windows in it when a window definition array is passed with contexts and the workspace is not focused", async () => {
            const firstContext = {
                first: true
            };

            const secondContext = {
                second: true
            };

            const group = await workspace.addGroup({
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

            await Promise.all(group.children.map((w) => w.forceLoad()));
            await workspace.refreshReference();

            const wait = new Promise((r) => setTimeout(r, 3000));
            await wait;

            await Promise.all(group.children.map(async (w, i) => {
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
            it(`add ${i + 1} group/s to the workspace when the workspace is not focused`, async () => {
                await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addGroup();
                }))

                await workspace.refreshReference();
                const allGroups = workspace.getAllGroups();

                expect(allGroups.length).to.eql(i + 1);
            });

            it(`add ${i + 1} empty group/s to the workspace when the workspace is not focused`, async () => {

                const groups = await Promise.all(Array.from({ length: i + 1 }).map(() => {
                    return workspace.addGroup();
                }))

                await workspace.refreshReference();
                const allGroups = workspace.getAllGroups();

                const groupChildren = groups.reduce((acc, r) => [...acc, ...r.children], []);

                expect(allGroups.length).to.eql(i + 1);
                expect(groupChildren.length).to.eql(0);
            });
        });
    });


    // TODO add tests with config
    Array.from([42, []]).forEach((input) => {
        it(`reject when the input is ${JSON.stringify(input)}`, (done) => {
            workspace.addGroup(input).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    })
});
