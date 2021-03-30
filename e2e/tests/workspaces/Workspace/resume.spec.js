describe("resume() Should", () => {
    const basicConfig = {
        children: [{
            type: "column",
            children: [{
                type: "row",
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            }
                        ]
                    },
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            }
                        ]
                    },
                ],
            },
            {
                type: "group",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }]
        }]
    };

    let workspace = undefined;

    beforeEach(async () => {
        gtf.clearWindowActiveHooks();
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("resolve the promise when the workspace is hibernated", async () => {
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.resume();
    });


    it("have the same amount of workspace windows as before being resumed", async () => {
        await Promise.all(workspace.getAllWindows().map((w) => w.forceLoad()));

        const workspaceWindowsCount = workspace.getAllWindows().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await Promise.all(secondWorkspace.getAllWindows().map((w) => w.forceLoad()));
        await workspace.hibernate();
        await workspace.resume();
        await workspace.refreshReference();

        const workspaceWindowsCountAfterHibernate = workspace.getAllWindows().length;

        expect(workspaceWindowsCount).to.eql(workspaceWindowsCountAfterHibernate);
    });

    it("have the same amount of columns as before being resumed", async () => {
        const columnsCount = workspace.getAllColumns().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.resume();
        await workspace.refreshReference();

        const columnsCountAfterHibernate = workspace.getAllColumns().length;

        expect(columnsCount).to.eql(columnsCountAfterHibernate);
    });

    it("have the same amount of rows as before being resumed", async () => {
        const rowsCount = workspace.getAllRows().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.resume();
        await workspace.refreshReference();

        const rowsCountAfterHibernate = workspace.getAllRows().length;

        expect(rowsCount).to.eql(rowsCountAfterHibernate);
    });

    it("have the same amount of groups as before being resumed", async () => {
        const groupsCount = workspace.getAllGroups().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.resume();
        await workspace.refreshReference();

        const groupsCountAfterHibernate = workspace.getAllGroups().length;

        expect(groupsCount).to.eql(groupsCountAfterHibernate);
    });

    it("be able to load all windows after being resumed", async () => {
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.resume();
        await workspace.refreshReference();

        await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));
    });

    it("not trigger onWindowAdded after being resumed", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return gtf.wait(3000, () => { });
        }).then(() => {
            return workspace.onWindowAdded(() => {
                done("Should not resolve");
            })
        }).then((unsub) => {
            gtf.addWindowHook(unsub);
            return workspace.hibernate();
        }).then(() => {
            gtf.wait(3000, () => {
                done();
            })
            return workspace.resume();
        }).catch(done);

    });

    it("throw an error when the workspace is not hibernated", (done) => {
        workspace.resume().then(() => {
            done("Should not resolve");
        }).catch(() => {
            done();
        });
    });

    it("throw an error when the workspace is resumed twice (sequential)", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return workspace.hibernate();
        }).then(() => {
            return workspace.resume();
        }).then(() => {
            return workspace.resume();
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done()
        });

    });

    it("throw an errorwhen the workspace is not selected is resumed twice (parallel)", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return workspace.resume();
        }).then(() => {
            return Promise.all([workspace.resume(), workspace.resume()]);
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done()
        });
    });
});