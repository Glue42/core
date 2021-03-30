describe('onWindowRemoved ', () => {
    const windowConfig = {
        type: "window",
        appName: "noGlueApp"
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

    before(() => coreReady);

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        unSubFuncs.forEach((unSub) => {
            if (typeof unSub === "function") {
                unSub();
            }
        });
        unSubFuncs = [];

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));

    });

    describe('basic ', () => {
        let defaultFrame;
        let defaultWorkspace;

        before(() => coreReady);

        beforeEach(async () => {
            const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });
            defaultWorkspace = await glue.workspaces.createWorkspace(createConfig);
            defaultFrame = defaultWorkspace.frame;
        });

        it('should return a promise, which resolves with a function', async () => {
            const windowRemovedPromise = glue.workspaces.onWindowRemoved(() => { });

            expect(windowRemovedPromise.then).to.be.a("function");
            expect(windowRemovedPromise.catch).to.be.a("function");

            const windowRemovedResult = await windowRemovedPromise;

            expect(windowRemovedResult).to.be.a("function");

            unSubFuncs.push(windowRemovedResult);
        });

        it('should provide valid argument', (done) => {

            const ready = gtf.waitFor(2, done);

            glue.workspaces
                .onWindowRemoved((removed) => {
                    try {
                        expect(removed.workspaceId).to.be.a('string');
                        expect(removed.frameId).to.be.a('string');
                        ready();
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

        it('should provide correct window id, frame id and workspace id', (done) => {

            const ready = gtf.waitFor(2, done);

            glue.workspaces
                .onWindowRemoved((removed) => {
                    try {
                        expect(removed.workspaceId).to.eql(defaultWorkspace.id);
                        expect(removed.frameId).to.eql(defaultFrame.id);
                        ready();
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

        Array.from({ length: 5 }).forEach((_, i) => {
            it(`invoke the callback ${i + 1} time/s when the workspace is closed`, (done) => {
                const ready = gtf.waitFor(i + 1, () => done());

                glue.workspaces.onWindowRemoved((window) => {
                    ready();
                }).then((unsub) => {
                    gtf.addWindowHook(unsub);

                    return Promise.all(Array.from({ length: i }).map(() => defaultWorkspace.addWindow(windowConfig)));
                }).then(() => {
                    return defaultWorkspace.frame.createWorkspace(basicConfig);
                }).then(() => {
                    return defaultWorkspace.close();
                }).catch(done);
            });

            it(`invoke the callback ${i + 1} time/s when the workspace is closed and is hibernated`, (done) => {
                const ready = gtf.waitFor(i + 1, () => done());

                glue.workspaces.onWindowRemoved((window) => {
                    ready();
                }).then((unsub) => {
                    gtf.addWindowHook(unsub);

                    return Promise.all(Array.from({ length: i }).map(() => defaultWorkspace.addWindow(windowConfig)));
                }).then(() => {
                    return defaultWorkspace.frame.createWorkspace(basicConfig);
                }).then(() => {
                    return defaultWorkspace.hibernate();
                }).then(() => {
                    return defaultWorkspace.close();
                }).catch(done);
            });

            it(`invoke the callback ${i + 1} time/s when the frame is closed`, (done) => {
                const ready = gtf.waitFor(i + 1, () => done());

                glue.workspaces.onWindowRemoved((window) => {
                    ready();
                }).then((unsub) => {
                    gtf.addWindowHook(unsub);

                    return Promise.all(Array.from({ length: i }).map(() => defaultWorkspace.addWindow(windowConfig)));
                }).then(() => {
                    return defaultWorkspace.frame.createWorkspace(basicConfig);
                }).then(() => {
                    return defaultWorkspace.frame.close();
                }).catch(done);
            });

            it(`invoke the callback ${i + 1} time/s when the frame is closed and the workspace is hibernated`, (done) => {
                const ready = gtf.waitFor(i + 2, () => done());

                glue.workspaces.onWindowRemoved((window) => {
                    ready();
                }).then((unsub) => {
                    gtf.addWindowHook(unsub);

                    return Promise.all(Array.from({ length: i }).map(() => defaultWorkspace.addWindow(windowConfig)));
                }).then(() => {
                    return defaultWorkspace.frame.createWorkspace(basicConfig);
                }).then(() => {
                    return defaultWorkspace.hibernate();
                }).then(() => {
                    return defaultWorkspace.frame.close();
                }).catch(done);
            });
        });

        it('should not notify when immediately unsubscribed', (done) => {
            const ready = gtf.waitFor(2, done);

            timeout = setTimeout(ready, 3000);

            glue.workspaces
                .onWindowRemoved(() => {
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
            let called = false;
            let unSub;

            timeout = setTimeout(ready, 3000);

            defaultWorkspace.addWindow(windowConfig)
                .then(() => {
                    return glue.workspaces.onWindowRemoved(() => {
                        if (!called) {
                            called = true;
                            unSub();
                            ready();
                            return;
                        }
                        done("Should not have been called.");
                    })
                })
                .then((un) => {
                    unSub = un;
                    return defaultFrame.close();
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
                glue.workspaces.onWindowRemoved(input)
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

    // describe('action: closing frame ', () => {
    //     // should notify once when a window was removed when the closed frame had one workspace with one window
    //     // should provide valid argument
    //     // should provide correct window id, frame id and workspace id
    //     // should notify twice when the frame had two workspaces with one window each
    //     // should notify four times when the frame had two workspaces with two windows each
    //     // should notify eight times when closing two frames each has two workspaces with two windows
    //     // the window should not be present in the workspace windows collection
    // });

    // describe('action: closing workspace ', () => {
    //     // should notify once when a window was removed when the workspace had one window
    //     // should notify twice when the workspace had two windows
    //     // should provide valid argument
    //     // should provide correct window id, frame id and workspace id
    //     // the window should not be present in the workspace windows collection
    // });

    // describe('action: closing window ', () => {
    //     // should notify once when a window was removed from an existing workspace
    //     // should provide valid argument
    //     // should provide correct window id, frame id and workspace id
    //     // the window should not be present in the workspace windows collection
    // });

    // describe('action, ejecting window ', () => {
    //     // should notify once when a window was removed from an existing workspace
    //     // should provide valid argument
    //     // should provide correct window id, frame id and workspace id
    //     // the window should not be present in the workspace windows collection
    // });
});
