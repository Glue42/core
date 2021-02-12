// validated V2
describe('layouts.onSaved ', () => {

    const defaultLayout = {
        name: "default",
        type: "Workspace",
        metadata: {},
        components: [
            {
                type: "Workspace",
                state: {
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
                                                    config: {
                                                        appName: "dummyApp"
                                                    }
                                                }
                                            ],
                                            config: {}
                                        }
                                    ],
                                    config: {}
                                }
                            ],
                            config: {}
                        }
                    ],
                    config: {
                        name: "default",
                        title: "Untitled 1"
                    },
                    context: {}
                }
            }
        ]
    }

    const defaultLayoutModified = {
        name: "default",
        type: "Workspace",
        metadata: {},
        components: [
            {
                type: "Workspace",
                state: {
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
                                                    config: {
                                                        appName: "dummyApp"
                                                    }
                                                },
                                                {
                                                    type: "window",
                                                    config: {
                                                        appName: "dummyApp"
                                                    }
                                                }
                                            ],
                                            config: {}
                                        }
                                    ],
                                    config: {}
                                }
                            ],
                            config: {}
                        }
                    ],
                    config: {
                        name: "default",
                        title: "Untitled 1"
                    },
                    context: {}
                }
            }
        ]
    }

    const secondLayout = {
        name: "second",
        type: "Workspace",
        metadata: {},
        components: [
            {
                type: "Workspace",
                state: {
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
                                                    config: {
                                                        appName: "dummyApp"
                                                    }
                                                }
                                            ],
                                            config: {}
                                        }
                                    ],
                                    config: {}
                                }
                            ],
                            config: {}
                        }
                    ],
                    config: {
                        name: "second",
                        title: "Untitled 1"
                    },
                    context: {}
                }
            }
        ]
    }

    const testLayoutsNames = [defaultLayout.name, secondLayout.name];

    let unSubFuncs = [];
    let timeout;

    before(() => coreReady);

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        await Promise.all(testLayoutsNames.map((name) => glue.workspaces.layouts.delete(name)));

        unSubFuncs.forEach((unSub) => {
            if (typeof unSub === "function") {
                unSub();
            }
        });
        unSubFuncs = [];
    });

    it('should return a promise, which resolves with a function', async () => {
        const layoutSavedPromise = glue.workspaces.layouts.onSaved(() => { });

        expect(layoutSavedPromise.then).to.be.a("function");
        expect(layoutSavedPromise.catch).to.be.a("function");

        const layoutSavedResult = await layoutSavedPromise;

        expect(layoutSavedResult).to.be.a("function");

        unSubFuncs.push(layoutSavedResult);
    });

    it('should notify when a new layout is imported', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.layouts.onSaved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should notify when an existing layout is imported', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.onSaved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(() => glue.workspaces.layouts.import([defaultLayoutModified], "merge"))
            .then(ready)
            .catch(done);
    });

    it('the provided object should be a complete layout', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.layouts.onSaved(async (layout) => {
            if (layout.name !== defaultLayout.name) {
                return;
            }

            try {
                const processed = (await glue.workspaces.layouts.export()).find((l) => l.name === layout.name);
                expect(layout).to.eql(processed);
                ready();
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once when a layout is imported', (done) => {
        const ready = gtf.waitFor(3, done);
        let called = false;
        timeout = setTimeout(ready, 3000);

        glue.workspaces.layouts.onSaved(() => {
            if (called) {
                done("Should not have been called twice");
                return;
            }
            called = true;
            ready();
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layouts are imported (sequentially)', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.onSaved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(() => glue.workspaces.layouts.import([secondLayout], "merge"))
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layouts are imported (parallel - promise.all)', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.onSaved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return Promise.all([
                    glue.workspaces.layouts.import([secondLayout], "merge"),
                    glue.workspaces.layouts.import([defaultLayout], "merge")
                ]);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layouts are imported (parallel - same array)', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.onSaved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout, secondLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layouts are imported (on notify)', (done) => {
        const ready = gtf.waitFor(4, done);
        let called = false;

        glue.workspaces.layouts.onSaved(() => {
            if (!called) {
                called = true;
                glue.workspaces.layouts.import([secondLayout], "merge").then(ready).catch(done);
            }
            ready();
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when immediately unsubscribed', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        glue.workspaces.layouts.onSaved(() => {
            done("Should not have been called.");
        })
            .then((unSub) => {
                unSub();
                return glue.workspaces.layouts.import([defaultLayout], "merge");
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribing after receiving notifications', (done) => {
        const ready = gtf.waitFor(4, done);
        let called = false;
        timeout = setTimeout(ready, 3000);
        let unSub;

        glue.workspaces.layouts.onSaved(() => {
            if (!called) {
                called = true;
                unSub();
                glue.workspaces.layouts.import([secondLayout], "merge").then(ready).catch(done);
                ready();
                return;
            }
            done("Should have been called, because the unsub function was called");
        })
            .then((un) => {
                unSub = un;
                return glue.workspaces.layouts.import([defaultLayout], "merge");
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
            glue.workspaces.layouts.onSaved(input)
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