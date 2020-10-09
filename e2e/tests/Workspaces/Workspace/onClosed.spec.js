describe('workspace.onClosed ', () => {

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ]
    };
    let unSubFuncs = [];
    let timeout;
    let defaultFrame;
    let defaultWorkspace;

    before(() => coreReady);

    beforeEach(async () => {
        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
        defaultWorkspace = await glue.workspaces.createWorkspace(createConfig);
        defaultFrame = defaultWorkspace.frame;
    });

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));

        defaultFrame = null;
        defaultWorkspace = null;

        unSubFuncs.forEach((unSub) => {
            if (typeof unSub === "function") {
                unSub();
            }
        });
        unSubFuncs = [];
    });

    it('should return a promise, which resolves with a function', async () => {
        const workspaceClosedPromise = defaultWorkspace.onClosed(() => { });

        expect(workspaceClosedPromise.then).to.be.a("function");
        expect(workspaceClosedPromise.catch).to.be.a("function");

        const workspaceClosedResult = await workspaceClosedPromise;

        expect(workspaceClosedResult).to.be.a("function");

        unSubFuncs.push(workspaceClosedResult);
    });

    it('should notify when the workspace was closed', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace
            .onClosed(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once of the closed workspace by closing the frame', (done) => {
        const ready = gtf.waitFor(3, done);
        let workspaceClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onClosed(() => {
                if (workspaceClosedCalled) {
                    done("Workspace closed was already triggered!");
                    return;
                }
                workspaceClosedCalled = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once of a closed workspace by closing the workspace', (done) => {
        const ready = gtf.waitFor(3, done);
        let workspaceClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onClosed(() => {
                if (workspaceClosedCalled) {
                    done("Workspace closed was already triggered!");
                    return;
                }
                workspaceClosedCalled = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once when two workspaces (one is the default) were closed in the same frame by closing the frame', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);
        let workspaceClosedCalled = false;

        defaultWorkspace
            .onClosed(() => {
                if (workspaceClosedCalled) {
                    done("Workspace closed was already triggered!");
                    return;
                }
                workspaceClosedCalled = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(() => {
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct workspace when two workspaces were closed in the same frames by closing the workspaces (parallel)', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);
        let called = false;

        defaultWorkspace
            .onClosed(() => {
                if (called) {
                    done("Should not have been called again.");
                    return;
                }
                called = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then((wsp) => {
                return Promise.all([
                    wsp.close(),
                    defaultWorkspace.close()
                ]);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct workspace when two workspaces were closed in the same frame by closing the workspaces (sequential)', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);
        let called = false;

        defaultWorkspace
            .onClosed(() => {
                if (called) {
                    done("Should not have been called again.");
                    return;
                }
                called = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then((wsp) => {
                return wsp.close();
            })
            .then(() => defaultWorkspace.close())
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct workspace when two workspaces were closed in the same frame by closing the workspaces (on notify)', (done) => {
        const ready = gtf.waitFor(4, done);

        timeout = setTimeout(ready, 3000);
        let called = false;

        let secondaryWorkspace;

        defaultWorkspace
            .onClosed(() => {
                if (!called) {
                    ready();
                    secondaryWorkspace.close().then(ready).catch(done);
                } else {
                    done("Heard invalid workspace");
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then((wsp) => {
                secondaryWorkspace = wsp;
                return defaultWorkspace.close();
            })
            .then(ready)
            .catch(done);
    });

    it('the workspace should not exist in the workspaces collection when notified of its closing', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace
            .onClosed(async () => {
                try {
                    const workspaces = await glue.workspaces.getAllWorkspaces((wsp) => wsp.id === defaultWorkspace.id);
                    expect(workspaces.length).to.eql(0);
                    ready()
                } catch (error) {
                    done(error);
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when immediately unsubscribed', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onClosed(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribing after receiving notifications', (done) => {
        const ready = gtf.waitFor(3, done);
        let addedWorkspace;
        let workspaceClosedCalled = false;
        let unSub;

        timeout = setTimeout(ready, 3000);

        glue.workspaces.createWorkspace(basicConfig)
            .then((wsp) => {
                addedWorkspace = wsp;
                return defaultWorkspace.onClosed(() => {

                    if (!workspaceClosedCalled) {
                        workspaceClosedCalled = true;
                        unSub();
                        addedWorkspace.close().then(ready).catch(done);
                        return;
                    }

                    done("Should not have been called");
                });
            })
            .then((un) => {
                unSub = un;
                return defaultWorkspace.close();
            })
            .then(ready)
            .catch(done);
    });

    [
        undefined,
        null,
        42,
        true,
        {},
        { test: () => { } },
        "function",
        [() => { }]
    ].forEach((input) => {
        it(`should reject if the provided parameter is not a function: ${JSON.stringify(input)}`, (done) => {
            defaultWorkspace.onClosed(input)
                .then((unSub) => {
                    unSubFuncs.push(unSub);
                    done(`Should have resolved, because the provided parameter is not valid: ${JSON.stringify(input)}`);
                })
                .catch(() => {
                    done();
                });
        });
    });

});
