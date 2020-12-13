describe('frame.onWorkspaceOpened ', () => {
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

    before(() => coreReady);

    beforeEach(async () => {
        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
        const wsp = await glue.workspaces.createWorkspace(createConfig);
        defaultFrame = wsp.frame;
    });

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        defaultFrame = null;

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));

        unSubFuncs.forEach((unSub) => {
            if (typeof unSub === "function") {
                unSub();
            }
        });
        unSubFuncs = [];
    });

    it('should return a promise, which resolves with a function', async () => {
        const workspaceOpenedPromise = defaultFrame.onWorkspaceOpened(() => { });

        expect(workspaceOpenedPromise.then).to.be.a("function");
        expect(workspaceOpenedPromise.catch).to.be.a("function");

        const workspaceOpenedResult = await workspaceOpenedPromise;

        expect(workspaceOpenedResult).to.be.a("function");

        unSubFuncs.push(workspaceOpenedResult);
    });

    it('should notify when a new workspace was opened in the frame', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame.onWorkspaceOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig)
            })
            .then(ready)
            .catch(done);
    });

    it('should notify with a valid workspace instance when a new workspace was opened', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame.onWorkspaceOpened((wsp) => {
            try {
                expect(wsp.id).to.be.a('string');
                expect(wsp.frameId).to.be.a('string');
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig)
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once when one new workspace was opened in the frame', (done) => {
        const ready = gtf.waitFor(3, done);
        let workspaceOpenedCalled = false;

        timeout = setTimeout(ready, 3000);

        defaultFrame.onWorkspaceOpened(() => {
            if (workspaceOpenedCalled) {
                done("Workspace opened was already triggered!");
                return;
            }
            workspaceOpenedCalled = true;
            ready();
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice with different instances when two workspaces are opened in the same frame (sequential)', (done) => {

        const ready = gtf.waitFor(3, done);
        const heardWsps = [];

        defaultFrame.onWorkspaceOpened((wsp) => {
            const alreadyHeard = heardWsps.some((w) => w.id === wsp.id);
            if (alreadyHeard) {
                done("This workspace was already heard")
                return;
            }
            heardWsps.push(wsp);
            ready();
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(() => {
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice with different instances when two workspaces are opened in the same frame (on notify)', (done) => {
        const ready = gtf.waitFor(3, done);
        const heardWsps = [];
        let openOneMore = true;

        defaultFrame.onWorkspaceOpened((wsp) => {
            const alreadyHeard = heardWsps.some((w) => w.id === wsp.id);
            if (alreadyHeard) {
                done("This workspace was already heard");
                return;
            }

            heardWsps.push(wsp);
            ready();

            if (openOneMore) {
                glue.workspaces.createWorkspace(basicConfig).then(ready).catch(done);
            }

            openOneMore = false;
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct instance when two workspaces are opened: one in the default frame, one in a new one (parallel)', (done) => {
        const ready = gtf.waitFor(3, done);
        timeout = setTimeout(ready, 3000);

        let notified = false;

        defaultFrame
            .onWorkspaceOpened((wsp) => {
                if (notified) {
                    done("Workspace opened was already invoked.");
                    return;
                }
                notified = true;
                const frameId = wsp.frameId;
                try {
                    expect(frameId).to.eql(defaultFrame.id);
                    ready();
                } catch (error) {
                    done(error);
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);

                const newFrameCreateConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
                const defaultFrameCreateConfig = Object.assign({}, basicConfig, { frame: { reuseFrameId: defaultFrame.id } });

                return Promise.all([
                    glue.workspaces.createWorkspace(newFrameCreateConfig),
                    glue.workspaces.createWorkspace(defaultFrameCreateConfig)
                ]);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct instance when two workspaces are opened: one in the default frame, one in a new one (sequential)', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);

        let notified = false;

        const newFrameCreateConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
        const defaultFrameCreateConfig = Object.assign({}, basicConfig, { frame: { reuseFrameId: defaultFrame.id } });

        defaultFrame
            .onWorkspaceOpened((wsp) => {
                if (notified) {
                    done("Workspace opened was already invoked.");
                    return;
                }
                notified = true;
                const frameId = wsp.frameId;
                try {
                    expect(frameId).to.eql(defaultFrame.id);
                    ready();
                } catch (error) {
                    done(error);
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(newFrameCreateConfig);
            })
            .then(() => {
                return glue.workspaces.createWorkspace(defaultFrameCreateConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once with correct instance when two workspaces are opened: one in the default frame, one in a new one (on notify)', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);

        let notified = false;

        const newFrameCreateConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
        const defaultFrameCreateConfig = Object.assign({}, basicConfig, { frame: { reuseFrameId: defaultFrame.id } });

        defaultFrame
            .onWorkspaceOpened((wsp) => {
                if (notified) {
                    done("Workspace opened was already invoked.");
                    return;
                }
                notified = true;
                const frameId = wsp.frameId;
                try {
                    expect(frameId).to.eql(defaultFrame.id);
                    glue.workspaces.createWorkspace(newFrameCreateConfig).then(ready).catch(done);
                    ready();
                } catch (error) {
                    done(error);
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(defaultFrameCreateConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('the workspace should exist in the workspaces collection when notified of its opening', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame
            .onWorkspaceOpened(async (workspace) => {
                try {
                    const hasWorkspace = await glue.workspaces.getAllWorkspaces((wsp) => wsp.id === workspace.id);
                    expect(hasWorkspace).to.not.be.undefined;
                    ready();
                } catch (error) {
                    done(error);
                }
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when immediately unsubscribed', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        defaultFrame
            .onWorkspaceOpened(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribing after receiving notifications', (done) => {
        const ready = gtf.waitFor(3, done);

        let unSub;
        let workspaceOpenedCalled = false;

        timeout = setTimeout(ready, 3000);

        defaultFrame
            .onWorkspaceOpened(() => {
                if (!workspaceOpenedCalled) {
                    workspaceOpenedCalled = true;
                    unSub();
                    glue.workspaces.createWorkspace(basicConfig).then(ready).catch(done);
                    return;
                }
                done("Should not have been called");
            })
            .then((un) => {
                unSub = un;
                return glue.workspaces.createWorkspace(basicConfig);
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
        it.skip(`should reject if the provided parameter is not a function: ${JSON.stringify(input)}`, (done) => {
            defaultFrame.onWorkspaceOpened(input)
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