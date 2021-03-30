describe("hibernate() Should", () => {
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
                        appName: "dummyApp"
                    }
                ]
            }]
        }]
    };

    const basicConfigTwoWindows = {
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
                                appName: "dummyApp"
                            }
                        ]
                    },
                ],
            }]
        }]
    };

    let workspace = undefined;

    before(async () => {
        await coreReady;
    });

    beforeEach(async () => {
        gtf.clearWindowActiveHooks();
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("resolve the promise when the workspace is not selected", async () => {
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        return workspace.hibernate();
    });

    it("close the windows in the hibernated workspace", async () => {
        await Promise.all(workspace.getAllWindows().map((w) => w.forceLoad()));

        const windowsInHibernatedWorkspace = workspace.getAllWindows().length;

        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await Promise.all(secondWorkspace.getAllWindows().map((w) => w.forceLoad()));

        const beforeHibernateWindowCount = glue.windows.list().length;

        await workspace.hibernate();

        const afterHibernateWindowCount = glue.windows.list().length;

        expect(beforeHibernateWindowCount).to.eql(afterHibernateWindowCount + windowsInHibernatedWorkspace);
    });

    it("have workspace windows which are not loaded", async () => {
        await Promise.all(workspace.getAllWindows().map((w) => w.forceLoad()));

        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await Promise.all(secondWorkspace.getAllWindows().map((w) => w.forceLoad()));
        await workspace.hibernate();
        await workspace.refreshReference();

        workspace.getAllWindows().forEach((w) => {
            expect(w.isLoaded).to.eql(false);
            let hasFoundGdWindow = undefined;
            try {
                hasFoundGdWindow = !!w.getGdWindow();
            } catch (error) {
                hasFoundGdWindow = false;
            }
            expect(hasFoundGdWindow).to.be.false;
        });
    });

    it("have the same amount of workspace windows as before being hibernated", async () => {
        await Promise.all(workspace.getAllWindows().map((w) => w.forceLoad()));

        const workspaceWindowsCount = workspace.getAllWindows().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await Promise.all(secondWorkspace.getAllWindows().map((w) => w.forceLoad()));
        await workspace.hibernate();
        await workspace.refreshReference();

        const workspaceWindowsCountAfterHibernate = workspace.getAllWindows().length;

        expect(workspaceWindowsCount).to.eql(workspaceWindowsCountAfterHibernate);
    });

    it("have the same amount of columns as before being hibernated", async () => {
        const columnsCount = workspace.getAllColumns().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.refreshReference();

        const columnsCountAfterHibernate = workspace.getAllColumns().length;

        expect(columnsCount).to.eql(columnsCountAfterHibernate);
    });

    it("have the same amount of rows as before being hibernated", async () => {
        const rowsCount = workspace.getAllRows().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.refreshReference();

        const rowsCountAfterHibernate = workspace.getAllRows().length;

        expect(rowsCount).to.eql(rowsCountAfterHibernate);
    });

    it("have the same amount of groups as before being hibernated", async () => {
        const groupsCount = workspace.getAllGroups().length;
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.refreshReference();

        const groupsCountAfterHibernate = workspace.getAllGroups().length;

        expect(groupsCount).to.eql(groupsCountAfterHibernate);
    });

    it("resume when the workspace is selected after being hibernated", async () => {
        const secondWorkspace = await workspace.frame.createWorkspace(basicConfig);

        await workspace.hibernate();
        await workspace.focus();
        await workspace.refreshReference();

        expect(workspace.isHibernated).to.be.false;
    });

    it("not trigger onWindowLoaded when the workspace is selected after being hibernated", (done) => {
        const allWindowsInWorkspace = workspace.getAllWindows();

        Promise.all(allWindowsInWorkspace.map(w => w.forceLoad())).then(() => {
            return workspace.frame.createWorkspace(basicConfigTwoWindows);
        }).then(() => {
            return workspace.onWindowLoaded(() => {
                gtf.wait(10000).then(() => {
                    done("Should not resolve");
                });
            });
        }).then((unSub) => {
            gtf.addWindowHook(unSub);
            return workspace.hibernate();
        }).then(() => {
            gtf.wait(5000, () => {
                done();
            });
            return workspace.focus();
        }).catch(done)
    });

    it("not trigger onWindowRemoved after being hibernated", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return workspace.onWindowRemoved(() => {
                done("Should not resolve");
            })
        }).then((unsub) => {
            gtf.addWindowHook(unsub);
            gtf.wait(3000, () => {
                done();
            });
            return workspace.hibernate();
        }).catch(done);

    });

    it("throw an error when the workspace is selected", (done) => {
        workspace.hibernate().then(() => {
            done("Should not resolve");
        }).catch(() => {
            done();
        });
    });

    it("throw an error when the workspace is empty", (done) => {
        let secondWorkspace = undefined;
        workspace.frame.createWorkspace({ children: [] }).then((w) => {
            secondWorkspace = w;
            return workspace.frame.createWorkspace({ children: [] })
        }).then(() => {
            return secondWorkspace.hibernate();
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done();
        });
    });

    it("throw an error when the workspace is not selected and hibernated twice (sequential)", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return workspace.hibernate();
        }).then(() => {
            return workspace.hibernate();
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done()
        });

    });

    it("throw an errorwhen the workspace is not selected and hibernated twice (parallel)", (done) => {
        workspace.frame.createWorkspace(basicConfig).then(() => {
            return Promise.all([workspace.hibernate(), workspace.hibernate()]);
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done()
        });
    });
});