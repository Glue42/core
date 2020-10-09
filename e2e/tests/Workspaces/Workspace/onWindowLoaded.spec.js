describe('workspace.onWindowLoaded ', () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const basicConfig = {
        children: [
            {
                type: "column",
                children: [windowConfig]
            }
        ]
    }

    const duoSChildrenConfig = {
        children: [
            {
                type: "row",
                children: [windowConfig, windowConfig]
            }
        ]
    };

    let unSubFuncs = [];
    let timeout;
    let defaultFrame;
    let defaultWorkspace;

    before(() => coreReady);

    beforeEach((done) => {
        let unSub;
        const ready = gtf.waitFor(2, () => {
            unSub();
            done();
        });

        glue.workspaces.onWindowLoaded(ready)
            .then((un) => {
                unSub = un;
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then((wsp) => {
                defaultWorkspace = wsp;
                defaultFrame = wsp.frame;
                ready();
            });
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
        const windowLoadedPromise = defaultWorkspace.onWindowLoaded(() => { });

        expect(windowLoadedPromise.then).to.be.a("function");
        expect(windowLoadedPromise.catch).to.be.a("function");

        const windowLoadedResult = await windowLoadedPromise;

        expect(windowLoadedResult).to.be.a("function");

        unSubFuncs.push(windowLoadedResult);
    });

    it('should not notify when immediately unsubscribed', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onWindowLoaded(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribing after receiving notifications', (done) => {
        const ready = gtf.waitFor(3, done);

        let unSub;
        let called = false;

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onWindowLoaded(() => {
                if (!called) {
                    called = true;
                    unSub();
                    defaultWorkspace.addWindow(windowConfig).then(ready).catch(done);
                    return;
                }
                done("Should not have been called");
            })
            .then((un) => {
                unSub = un;
                return defaultWorkspace.addWindow(windowConfig);
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
            defaultWorkspace.onWindowLoaded(input)
                .then((unSub) => {
                    unSubFuncs.push(unSub);
                    done(`Should have resolved, because the provided parameter is not valid: ${JSON.stringify(input)}`);
                })
                .catch(() => {
                    done();
                });
        });
    });

    it('should notify when a window was loaded', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace.onWindowLoaded(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when a window was loaded by opening a new workspace in a new frame', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        defaultWorkspace.onWindowLoaded(() => done("Should have been called, because the added window is in a different frame"))
            .then((unSub) => {
                unSubFuncs.push(unSub);
                const newFrameCreateConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
                return glue.workspaces.createWorkspace(newFrameCreateConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when a window was loaded by opening a new workspace in the same frame', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        defaultWorkspace.onWindowLoaded(() => done("Should have been called, because the added window is in a different frame"))
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when a window was loaded by opening it in a different existing workspace in the same frame', (done) => {
        const ready = gtf.waitFor(2, done);
        let otherWorkspace;

        timeout = setTimeout(ready, 3000);

        const prepare = () => {
            return new Promise((resolve) => {
                let unSub;
                const r = gtf.waitFor(2, () => {
                    unSub();
                    resolve();
                })

                glue.workspaces.onWindowLoaded(r)
                    .then((un) => {
                        unSub = un;
                        const newFrameCreateConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
                        return glue.workspaces.createWorkspace(newFrameCreateConfig);
                    })
                    .then((wsp) => {
                        otherWorkspace = wsp;
                        r();
                    });
            })
        }

        prepare()
            .then(() => {
                return defaultWorkspace.onWindowLoaded(() => done("Should have been called, because the added window is in a different frame"));
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return otherWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify with a valid workspace window when a window was loaded', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace.onWindowLoaded((win) => {
            try {
                expect(win.id).to.be.a('string');
                expect(win.frameId).to.be.a('string');
                expect(win.appName).to.eql('dummyApp');
                expect(win.workspaceId).to.be.a('string');
                expect(win.isLoaded).to.be.true;
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('the provided workspace window should have correct workspace id and frame id', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace.onWindowLoaded((win) => {
            try {
                expect(win.frameId).to.eql(defaultWorkspace.frameId);
                expect(win.workspaceId).to.eql(defaultWorkspace.id);
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('the loaded window should exist in the windows collection', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace.onWindowLoaded((w) => {
            try {
                expect(glue.windows.list().some((win) => win.id === w.id)).to.be.true;
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('the loaded window should exist in the workspace windows collection by window id', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultWorkspace.onWindowLoaded(async (w) => {
            try {
                const found = await glue.workspaces.getWindow((win) => win.id === w.id);
                expect(found).to.not.be.undefined;
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once when a window was loaded', (done) => {
        const ready = gtf.waitFor(3, done);

        let called = false;

        timeout = setTimeout(ready, 3000);

        defaultWorkspace
            .onWindowLoaded(() => {
                if (!called) {
                    called = true;
                    ready();
                    return;
                }
                done("Should not have been called");
            })
            .then((un) => {
                unSubFuncs.push(un);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when adding two windows (parallel)', (done) => {
        const ready = gtf.waitFor(3, done);

        defaultWorkspace.onWindowLoaded(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return Promise.all([
                    defaultWorkspace.addWindow(windowConfig),
                    defaultWorkspace.addWindow(windowConfig)
                ])
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when adding two windows (sequential)', (done) => {
        const ready = gtf.waitFor(3, done);

        defaultWorkspace.onWindowLoaded(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(() => defaultWorkspace.addWindow(windowConfig))
            .then(ready)
            .catch(done);
    });

    it('should notify twice when adding two windows (on notify)', (done) => {
        const ready = gtf.waitFor(4, done);

        let called = false;

        defaultWorkspace
            .onWindowLoaded(() => {
                if (!called) {
                    called = true;
                    defaultWorkspace.addWindow(windowConfig).then(ready).catch(done);
                }
                ready();
            })
            .then((un) => {
                unSubFuncs.push(un);
                return defaultWorkspace.addWindow(windowConfig);
            })
            .then(ready)
            .catch(done);
    });

});
