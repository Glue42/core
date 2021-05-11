describe('restoreWorkspace() Should', function () {

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }
        ]
    };

    const secondBasicConfig = {
        children: [
            {
                type: "group",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    },
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }
        ]
    }

    let workspace;
    const layoutName = "layout.integration.tests";
    const secondLayoutName = "layout.integration.tests.2";
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.saveLayout(layoutName);
        let secondWorkspace = await glue.workspaces.createWorkspace(secondBasicConfig);
        await secondWorkspace.saveLayout(secondLayoutName);
        await secondWorkspace.close();
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();
        await glue.workspaces.layouts.delete(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("restore the layout when the arguments are correct and the workspace is still opened", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout when the arguments are correct and the workspace is closed", async () => {
        await workspace.close();
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(1);
    });

    it("restore the layout when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout when the workspace is closed and the options are an empty object", async () => {
        await workspace.close();
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice only by name", async () => {
        await workspace.close();
        const firstWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(2);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice with an empty object", async () => {
        await workspace.close();
        const firstWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(2);
    });

    it("restore the layout in the same frame when the workspace is still opened and newFrame is false", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: false });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened and frameId is passed", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { frameId: workspace.frameId });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it.skip("reuse the specified workspace when the reuseWorkspaceIdOptions is passed", async () => {
        await workspace.addWindow({
            type: "window",
            appName: "dummyApp"
        });
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { reuseWorkspaceId: workspace.id });
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();
        const workspaceWindows = secondWorkspace.getAllWindows();

        expect(workspaceSummaries.length).to.eql(1);
        expect(workspaceWindows.length).to.eql(1);
    });

    it("restore the layout in a new frame when the workspace is still opened and newFrame is true", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(2);
    });

    it("restore the layout with the given title when a title is passed", async () => {
        const title = "myNewTitle";
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { title });

        expect(secondWorkspace.title).to.eql(title);
    });

    it("set the workspace context to the given context when a context is passed", async () => {
        const context = {
            my: "context"
        };

        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { context });
        const workspaceContext = await secondWorkspace.getContext();

        expect(workspaceContext).to.eql(context);
    });

    it("set the workspace context to the context from the layout when the layout contains a context", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(contextToBeSaved);
    });

    it("merge the context in the layout and the passed context when the layout contains a context and a context has been passed", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const secondContext = {
            test: "42"
        }

        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { context: secondContext });
        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(Object.assign(secondContext, contextToBeSaved));
    });

    it("reject the promise when there isn't a layout with such name", (done) => {
        glue.workspaces.restoreWorkspace("some missing layout").then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from([null, undefined, 42, "SomeString", [], {}]).forEach((input) => {
        if (typeof input != "string") {
            it(`reject the promise when the name parameter is ${JSON.stringify(input)}`, (done) => {
                glue.workspaces.restoreWorkspace(input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }

        if (typeof input != "undefined" && typeof input != "object") {
            it(`reject the promise when the options parameter is ${JSON.stringify(input)}`, (done) => {
                glue.workspaces.restoreWorkspace(layoutName, input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }
    });

    describe('reuseWorkspaceId Should ', function () {
        // BASIC
        this.timeout(60000);

        it("change noTabHeader to true when the new workspace has noTabHeader:true and target one has false", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                noTabHeader: false
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                noTabHeader: true
            });

            const secondWorkspaceWindows = secondWorkspace.getAllWindows();
            expect(secondWorkspaceWindows.length).to.eql(2);
            // TODO assert correctly
        });

        it("change noTabHeader to false when the new workspaces has noTabHeader:false and target one has true", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                noTabHeader: true
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                noTabHeader: false
            });

            const secondWorkspaceWindows = secondWorkspace.getAllWindows();
            expect(secondWorkspaceWindows.length).to.eql(2);
            // TODO assert correctly
        });

        it('not add a new workspace in the summaries collection after resolve', async () => {
            const allWorkspacesBeforeReuse = await glue.workspaces.getAllWorkspacesSummaries();
            await gtf.wait(10000);
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });
            await gtf.wait(10000);
            const allWorkspacesAfterReuse = await glue.workspaces.getAllWorkspacesSummaries();

            expect(allWorkspacesAfterReuse.some((wsp) => wsp.id === workspace.id)).to.be.true;
            expect(allWorkspacesAfterReuse.length).to.eql(allWorkspacesBeforeReuse.length);
        });

        it('preserve the id', async () => {
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            expect(workspace.id).to.eql(secondWorkspаce.id);
        });

        it('increase the number of windows by one when the reused workspace has one app less', async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));
            await gtf.wait(3000);
            const windowsCount = glue.windows.list().length;
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            await Promise.all(secondWorkspаce.getAllWindows().map(w => w.forceLoad()));
            await gtf.wait(3000);
            const secondWindowsCount = glue.windows.list().length;
            expect(windowsCount + 1).to.eql(secondWindowsCount);
        });

        it("not preserve the context when a new context has not been passed", async () => {
            const firstContext = {
                "a": "b"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql({});
        });

        it("not preserve the context when an empty object has been passed as context", async () => {
            const firstContext = {
                "a": "b"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                context: {}
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql({});
        });

        it("set the context correctly when a new context has been passed", async () => {
            const firstContext = {
                "a": "b"
            };

            const secondContext = {
                "c": "d"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                context: secondContext
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql(secondContext);
        });

        it('not trigger workspace opened', (done) => {
            let unSubFunc;
            let workspace;

            glue.workspaces.restoreWorkspace(layoutName).then((w) => {
                workspace = w;
                return glue.workspaces.onWorkspaceOpened(() => {
                    try {
                        done("Should not be invoked");

                        unSubFunc();
                    } catch (error) { }
                });
            }).then((unSub) => {
                unSubFunc = unSub;
                return glue.workspaces.restoreWorkspace(secondLayoutName, {
                    reuseWorkspaceId: workspace.id
                });
            }).then(() => {
                return gtf.wait(3000, () => { done(); unSubFunc(); });
            }).catch(done);
        });

        it('not trigger workspace closed', (done) => {
            let unSubFunc;
            let workspace;

            glue.workspaces.restoreWorkspace(layoutName).then((w) => {
                workspace = w;
                return glue.workspaces.onWorkspaceClosed(() => {
                    try {
                        done("Should not be invoked");

                        unSubFunc();
                    } catch (error) { }
                });
            }).then((unSub) => {
                unSubFunc = unSub;
                return glue.workspaces.restoreWorkspace(secondLayoutName, {
                    reuseWorkspaceId: workspace.id
                });
            }).then(() => {
                return gtf.wait(3000, () => { done(); unSubFunc(); });
            }).catch(done);
        });

        it("resolve with correct title when it is specified and valid", async () => {
            const testTitle = "myTestTitle";
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);
            const secondWorkspace = await glue.workspaces.restoreWorkspace(
                secondLayoutName, { title: testTitle, reuseWorkspaceId: workspace.id }
            );

            expect(secondWorkspace.title).to.eql(testTitle);
        });

        it("set the title to the layoutName when a title isn't passed", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.title).to.eql(layoutName);
        });

        it("resolve when there are multiple frames opened and one of the middle ones (by starting order) contains the target workspace", async () => {
            const workspaceTwo = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            const workspaceThree = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            const workspaceFour = await glue.workspaces.restoreWorkspace(secondLayoutName, { reuseWorkspaceId: workspaceTwo.id });

            const allWorkspaces = await glue.workspaces.getAllWorkspaces();
            const allFrames = await glue.workspaces.getAllFrames();
            const windowsInWorkspaceFour = workspaceFour.getAllWindows();

            expect(allWorkspaces.length).to.eql(3);
            expect(allFrames.length).to.eql(3);
            expect(windowsInWorkspaceFour.length).to.eql(2);
        });
    });

    describe('loadingStrategy Should ', function () {
        const config = {
            children: [
                {
                    type: "column",
                    children: [
                        {
                            type: "row", children: [{
                                type: "group",
                                children: [
                                    { type: "window", appName: "dummyApp" },
                                    { type: "window", appName: "dummyApp" }]
                            }]
                        },
                        {
                            type: "row", children: [{
                                type: "group",
                                children: [
                                    { type: "window", appName: "dummyApp" },
                                    { type: "window", appName: "dummyApp" }]
                            }]
                        }
                    ]
                }
            ]
        };

        beforeEach(async () => {
            workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName, { saveContext: false });
            await workspace.frame.close();
        });

        afterEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));
        });

        it("load all windows when the loadingStrategy is direct", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded((w) => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "direct" });
            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load only the visible windows when the loadingStrategy is lazy", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(2);
        });

        it("load all windows when the loadingStrategy is lazy and all windows are force loaded", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load all windows when the loadingStrategy is lazy and all windows are focused", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });
            await Promise.all(workspace.getAllWindows().map(w => w.focus()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load one more window for 4 seconds when the loadingStrategy is delayed", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await gtf.wait(4000);

            expect(loadedWindowsCount).to.eql(3);
        });

        it("load all windows when the loadingStrategy is delayed and all windows are force loaded", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load all windows when the loadingStrategy is delayed and all windows are focused", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await Promise.all(workspace.getAllWindows().map(w => w.focus()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        [0, 100, 200, 300, 400, 500].forEach((delay) => {
            it(`not start any new windows when the loadingStrategy is delayed and the frame has been closed with a delay of ${delay} before all windows can be loaded`, async () => {
                let resolve;
                let reject;
                const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });

                let frameClosed = false;

                let unsub = await glue.windows.onWindowAdded(() => {
                    if (frameClosed) {
                        reject("Should not be invoked after the frame has been stopped");
                    }
                });

                gtf.addWindowHook(unsub);

                const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
                await gtf.wait(delay);
                await workspace.frame.close();
                frameClosed = true;

                gtf.wait(5000).then(() => {
                    resolve();
                });

                return promise;
            });
        });
    });

    describe('locking Should', () => {
        const lockingConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp"
                                                },
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp"
                                                },
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const lockedLayoutName = "layout.integration.tests.locked";

        it("restore the workspace with all constraints when the workspace was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            await workspace.lock();
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(restoredWorkspace.allowDrop).to.be.true;
            expect(restoredWorkspace.allowExtract).to.be.false;
            expect(restoredWorkspace.showSaveButton).to.be.false;
            expect(restoredWorkspace.showCloseButton).to.be.false;
            expect(restoredWorkspace.allowSplitters).to.be.false;
        });

        it("restore the workspace with containers with constraints when a group was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const groups = workspace.getAllGroups();

            await Promise.all(groups.map((group) => group.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllGroups().forEach((g) => {
                expect(g.allowDrop).to.be.false;
                expect(g.allowExtract).to.be.false;
                expect(g.showMaximizeButton).to.be.false;
                expect(g.showEjectButton).to.be.false;
                expect(g.showAddWindowButton).to.be.false;
            });
        });

        it("restore the workspace with containers with constraints when a row was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const rows = workspace.getAllRows();

            await Promise.all(rows.map((row) => row.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllRows().forEach((g) => {
                expect(g.allowDrop).to.be.false;
            });
        });

        it("restore the workspace with containers with constraints when a column was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const columns = workspace.getAllColumns();

            await Promise.all(columns.map((column) => column.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllColumns().forEach((c) => {
                expect(c.allowDrop).to.be.false;
            });
        });

        it("restore the workspace with windows with constraints when the windows were saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await Promise.all(windows.map((window) => window.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.false;
                expect(w.showCloseButton).to.be.false;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the groups were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const groups = workspace.getAllGroups();

            await workspace.lock();
            await Promise.all(groups.map((group) => group.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllGroups().forEach((g) => {
                expect(g.allowDrop).to.be.true;
                expect(g.showMaximizeButton).to.be.true;
                expect(g.showEjectButton).to.be.true;
                expect(g.allowExtract).to.be.true;
                expect(g.showAddWindowButton).to.be.true;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the columns were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const columns = workspace.getAllColumns();

            await workspace.lock();
            await Promise.all(columns.map((column) => column.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllColumns().forEach((c) => {
                expect(c.allowDrop).to.be.true;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the rows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const rows = workspace.getAllRows();

            await workspace.lock();
            await Promise.all(rows.map((row) => row.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllRows().forEach((g) => {
                expect(g.allowDrop).to.be.true;
            });
        });

        it("restore the workspace with the correct window overrides when the workspace was locked and some of the windows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await workspace.lock();
            await Promise.all(windows.map((win) => win.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.true;
                expect(w.showCloseButton).to.be.true;
            });
        });

        it("restore the workspace with the correct window overrides when the parent group was locked and some of the windows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await Promise.all(workspace.getAllGroups().map(g => g.lock()));
            await Promise.all(windows.map((win) => win.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllGroups(g => {
                expect(g.allowExtract).to.be.false;
            });

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.true;
                expect(w.showCloseButton).to.be.true;
            });
        });
    });
});
