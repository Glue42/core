// validated V2
describe('layouts.onRemoved ', () => {

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
    };

    let processedLayout;

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
    };

    const testLayoutsNames = [defaultLayout.name, secondLayout.name];

    let unSubFuncs = [];
    let timeout;

    before(() => coreReady);

    beforeEach(async () => {
        await glue.workspaces.layouts.import([defaultLayout]);
        processedLayout = (await glue.workspaces.layouts.export()).find((layout) => layout.name === defaultLayout.name);
    });

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

        await Promise.all(testLayoutsNames.map((name) => glue.workspaces.layouts.delete(name)));
    });

    it('should return a promise, which resolves with a function', async () => {
        const layoutRemovedPromise = glue.workspaces.layouts.onRemoved(() => { });

        expect(layoutRemovedPromise.then).to.be.a("function");
        expect(layoutRemovedPromise.catch).to.be.a("function");

        const layoutRemovedResult = await layoutRemovedPromise;

        expect(layoutRemovedResult).to.be.a("function");

        unSubFuncs.push(layoutRemovedResult);
    });

    it('should notify when a layout is removed', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.layouts.onRemoved(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when trying to remove an non-existing layout', (done) => {
        const ready = gtf.waitFor(2, done);
        timeout = setTimeout(ready, 3000);

        glue.workspaces.layouts.onRemoved(() => done("Should not have been invoked, because the layout does not exist"))
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete("non-existing");
            })
            .then(ready)
            .catch(done);
    });

    it('the provided object should be a complete layout', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.layouts.onRemoved((layout) => {
            try {
                expect(layout).to.eql(processedLayout);
                ready()
            } catch (error) {
                done(error);
            }
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify exactly once when a layout is removed', (done) => {
        const ready = gtf.waitFor(3, done);
        timeout = setTimeout(ready, 3000);
        let called = false;

        glue.workspaces.layouts.onRemoved(() => {
            if (called) {
                done("Should not have been called, because this layout was already announced");
                return;
            }
            called = true;
            ready();
        })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layouts are removed (sequentially)', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.import([secondLayout], "merge")
            .then(() => {
                return glue.workspaces.layouts.onRemoved(ready)
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(() => glue.workspaces.layouts.delete(secondLayout.name))
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layout are removed (parallel)', (done) => {
        const ready = gtf.waitFor(3, done);

        glue.workspaces.layouts.import([secondLayout], "merge")
            .then(() => {
                return glue.workspaces.layouts.onRemoved(ready)
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return Promise.all([
                    glue.workspaces.layouts.delete(defaultLayout.name),
                    glue.workspaces.layouts.delete(secondLayout.name)
                ]);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two layout are removed (on notify)', (done) => {
        const ready = gtf.waitFor(3, done);
        let called = false;

        glue.workspaces.layouts.import([secondLayout], "merge")
            .then(() => {
                return glue.workspaces.layouts.onRemoved(() => {
                    if (!called) {
                        called = true;
                        glue.workspaces.layouts.delete(secondLayout.name).then(ready).catch(done);
                    }
                    ready();
                })
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when immediately unsubscribed', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        glue.workspaces.layouts.onRemoved(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
                return glue.workspaces.layouts.delete(defaultLayout.name);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribing after receiving notifications', (done) => {
        const ready = gtf.waitFor(4, done);
        let called = false;
        let unSub;
        timeout = setTimeout(ready, 3000);

        glue.workspaces.layouts.import([secondLayout], "merge")
            .then(() => {
                return glue.workspaces.layouts.onRemoved(() => {
                    if (!called) {
                        called = true;
                        unSub();
                        glue.workspaces.layouts.delete(secondLayout.name).then(ready).catch(done);
                        ready();
                        return;
                    }
                    done("Should not have been called, because unsub was invoked");
                })
            })
            .then((un) => {
                unSub = un;
                return glue.workspaces.layouts.delete(defaultLayout.name);
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
            glue.workspaces.layouts.onRemoved(input)
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