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
        console.log(-3);
        await workspace.saveLayout(layoutName);
        console.log(-2);
        let secondWorkspace = await glue.workspaces.createWorkspace(secondBasicConfig);
        await secondWorkspace.saveLayout(secondLayoutName);
        console.log(-1);
        await secondWorkspace.close();
        console.log(0);
    });

    afterEach(async () => {
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

        it("preserve the context when a new context has not been passed", async () => {
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

            expect(secondWorkspaceContext).to.eql(firstContext);
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

        it("resolve when there are multiple frames opened and one of the middle ones (by starting order) contains the target workspace", async () => {
            console.log(1);
            const workspaceTwo = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            console.log(2);
            const workspaceThree = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            console.log(3);
            const workspaceFour = await glue.workspaces.restoreWorkspace(secondLayoutName, { reuseWorkspaceId: workspaceTwo.id });
            console.log(4);

            const allWorkspaces = await glue.workspaces.getAllWorkspaces();
            console.log(5);
            const allFrames = await glue.workspaces.getAllFrames();
            console.log(6);
            const windowsInWorkspaceFour = workspaceFour.getAllWindows();

            expect(allWorkspaces.length).to.eql(3);
            expect(allFrames.length).to.eql(3);
            expect(windowsInWorkspaceFour.length).to.eql(2);
        });
    })
});
