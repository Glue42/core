describe('onWorkspaceOpened ', () => {
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

    before(() => coreReady);

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

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
        const workspaceOpenedPromise = glue.workspaces.onWorkspaceOpened(() => { });

        expect(workspaceOpenedPromise.then).to.be.a("function");
        expect(workspaceOpenedPromise.catch).to.be.a("function");

        const workspaceOpenedResult = await workspaceOpenedPromise;

        expect(workspaceOpenedResult).to.be.a("function");

        unSubFuncs.push(workspaceOpenedResult);
    });

    it('should notify when a new workspace was opened together with a frame', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.onWorkspaceOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig)
            })
            .then(ready)
            .catch(done);
    });

    it('should notify with a valid workspace instance when a new workspace was opened', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
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

    it('should notify exactly once when one workspace was opened', (done) => {
        const ready = gtf.waitFor(3, done);
        let workspaceOpenedCalled = false;

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onWorkspaceOpened(() => {
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

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
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

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
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

    it('should notify twice with different instance when two workspaces are opened in different frames (parallel)', (done) => {
        const ready = gtf.waitFor(3, done);
        const heardWsps = [];

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
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
                const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
                return Promise.all([
                    glue.workspaces.createWorkspace(createConfig),
                    glue.workspaces.createWorkspace(createConfig)
                ]);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice with different instance when two workspaces are opened in different frames (sequential)', (done) => {
        const ready = gtf.waitFor(3, done);
        const heardWsps = [];

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
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
                return glue.workspaces.createWorkspace(createConfig);
            })
            .then(() => {
                return glue.workspaces.createWorkspace(createConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice with different instance when two workspaces are opened in different frames (on notify)', (done) => {
        const ready = gtf.waitFor(3, done);
        const heardWsps = [];
        let openOneMore = true;
        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces
            .onWorkspaceOpened((wsp) => {
                const alreadyHeard = heardWsps.some((w) => w.id === wsp.id);
                if (alreadyHeard) {
                    done("This workspace was already heard");
                    return;
                }

                heardWsps.push(wsp);
                ready();

                if (openOneMore) {
                    glue.workspaces.createWorkspace(createConfig).then(ready).catch(done);
                }

                openOneMore = false;
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(createConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('the workspace should exist in the workspaces collection when notified of its opening', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
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

        glue.workspaces
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
        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onWorkspaceOpened(() => {
                if (!workspaceOpenedCalled) {
                    workspaceOpenedCalled = true;
                    unSub();
                    glue.workspaces.createWorkspace(createConfig).then(() => ready()).catch(done);
                    return;
                }
                done("Should not have been called");
            })
            .then((un) => {
                unSub = un;
                return glue.workspaces.createWorkspace(createConfig);
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
            glue.workspaces.onWorkspaceOpened(input)
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