describe('onFrameClosed() ', () => {
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
        const frameClosedPromise = glue.workspaces.onFrameClosed(() => { });

        expect(frameClosedPromise.then).to.be.a("function");
        expect(frameClosedPromise.catch).to.be.a("function");

        const frameClosedResult = await frameClosedPromise;

        expect(frameClosedResult).to.be.a("function");

        unSubFuncs.push(frameClosedResult);
    });

    it('should notify when a frame was closed', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameClosed(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);

    });

    it('should provide a valid object when notifying of a closed frame', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameClosed((closed) => {
                try {
                    expect(closed).to.be.an("object");
                    expect(closed.frameId).to.be.a("string");
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

    it('should provide the correct frame id when notifying of a closed frame', (done) => {
        const ready = gtf.waitFor(2, done);
        const defaultFrameId = defaultFrame.id;

        glue.workspaces
            .onFrameClosed((closed) => {
                try {
                    expect(defaultFrameId).to.eql(closed.frameId);
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

    it('should notify exactly once of a closed frame', (done) => {
        const ready = gtf.waitFor(3, done);
        let frameClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onFrameClosed(() => {
                if (frameClosedCalled) {
                    done("Frame closed was already triggered!");
                    return;
                }
                frameClosedCalled = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two frames were closed at the same time', (done) => {
        const ready = gtf.waitFor(3, done);
        let addedFrame;

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return glue.workspaces.onFrameClosed(ready)
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return Promise.all([
                    defaultFrame.close(),
                    addedFrame.close()
                ]);
            })
            .then(ready)
            .catch(done);

    });

    it('should notify twice when two frames were closed one after the other', (done) => {
        const ready = gtf.waitFor(3, done);
        let addedFrame;

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return glue.workspaces.onFrameClosed(ready)
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return addedFrame.close();
            })
            .then(() => defaultFrame.close())
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two frames were closed one after the first was heard', (done) => {
        const ready = gtf.waitFor(4, done);
        let addedFrame;

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return glue.workspaces.onFrameClosed((closed) => {
                    if (addedFrame.id === closed.frameId) {
                        defaultFrame.close().then(ready).catch(done);
                    }
                    ready();
                });
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return addedFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('no frame windows should exist when notified that the only frame was closed', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameClosed(() => {
                glue.workspaces.getAllFrames()
                    .then((frames) => {
                        expect(frames.length).to.eql(0);
                        ready();
                    })
                    .catch(done);
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('the frame should not exist in the frames collection when notified of its closing', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameClosed((closed) => {
                glue.workspaces.getAllFrames()
                    .then((frames) => {
                        expect(frames.some((fr) => fr.id === closed.frameId)).to.be.false;
                        ready();
                    })
                    .catch(done);
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

        glue.workspaces
            .onFrameClosed(() => {
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
        let addedFrame;
        let frameClosedCalled = false;
        let unSub;

        timeout = setTimeout(ready, 3000);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return glue.workspaces.onFrameClosed((closed) => {

                    if (!frameClosedCalled) {
                        frameClosedCalled = true;
                        unSub();
                        defaultFrame.close().then(ready).catch(done);
                        return;
                    }

                    done("Should not have been called");
                });
            })
            .then((un) => {
                unSub = un;
                return addedFrame.close();
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
            glue.workspaces.onFrameClosed(input)
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
