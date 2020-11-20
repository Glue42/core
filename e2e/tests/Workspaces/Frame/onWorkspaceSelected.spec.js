describe('frame.onWorkspaceSelected() Should ', () => {
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

    it('return a promise, which resolves with a function', async () => {
        const workspaceSelectedPromise = defaultFrame.onWorkspaceSelected(() => { });

        expect(workspaceSelectedPromise.then).to.be.a("function");
        expect(workspaceSelectedPromise.catch).to.be.a("function");

        const workspaceSelectedResult = await workspaceSelectedPromise;

        expect(workspaceSelectedResult).to.be.a("function");

        unSubFuncs.push(workspaceSelectedResult);
    });

    it('be invoked when a new workspace is opened', (done) => {
        let newWorkspace = undefined;
        defaultFrame.onWorkspaceSelected((w) => {
            if (newWorkspace && w.id === newWorkspace.id) {
                done();
            }
        }).then(unsub => {
            unSubFuncs.push(unsub);
            return defaultFrame.createWorkspace(basicConfig);
        }).then((w) => {
            newWorkspace = w;
        }).catch(done);
    });

    it('be invoked when a workspace is focused', (done) => {
        let firstWorkspace = undefined;
        const ready = gtf.waitFor(2, done);
        defaultFrame.workspaces().then((wsps) => {
            firstWorkspace = wsps[0];

            return defaultFrame.createWorkspace(basicConfig);
        }).then(() => {
            return defaultFrame.onWorkspaceSelected((w) => {
                if (w.id === firstWorkspace.id) {
                    ready();
                }
            });
        }).then(unsub => {
            unSubFuncs.push(unsub);

            return firstWorkspace.focus();
        }).then(ready).catch(done);
    });

    it('not be invoked when a workspace with noTabHeader:true is opened', (done) => {
        const ready = gtf.waitFor(2, done);
        defaultFrame.onWorkspaceSelected((w) => {
            done("Should not be invoked");
        }).then(unsub => {
            unSubFuncs.push(unsub);
            gtf.wait(3000, ready);
            return defaultFrame.createWorkspace(Object.assign(basicConfig, { config: { noTabHeader: true } }));
        }).then(ready).catch(done);
    });

    it('not be invoked when a workspace with noTabHeader:true is restored', (done) => {
        const layoutName = gtf.getWindowName("workspaceLayout");
        const ready = gtf.waitFor(2, done);
        defaultFrame.workspaces().then((wsps) => {
            const first = wsps[0];
            return first.saveLayout(layoutName);
        }).then(() => {
            return defaultFrame.onWorkspaceSelected((w) => {
                done("Should not be invoked");
            });
        }).then(unsub => {
            unSubFuncs.push(unsub);
            gtf.wait(3000, ready);
            return defaultFrame.restoreWorkspace(layoutName, { noTabHeader: true });
        }).then(ready).catch(done);
    });

    it('not be invoked when the unsub function is invoked and a workspace is focused', (done) => {
        let firstWorkspace = undefined;
        const ready = gtf.waitFor(2, done);
        defaultFrame.workspaces().then((wsps) => {
            firstWorkspace = wsps[0];

            return defaultFrame.createWorkspace(basicConfig)

        }).then(() => {
            gtf.wait(3000, ready);

            return defaultFrame.onWorkspaceSelected((w) => {
                done("Should not resolve");
            }).then(unsub => {
                unsub();
                return firstWorkspace.focus();
            }).then(ready).catch(done);
        });
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
            defaultFrame.onWorkspaceSelected(input)
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