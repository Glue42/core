describe('frame.onClosed() ', () => {
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
        const frameClosedPromise = defaultFrame.onClosed(() => { });

        expect(frameClosedPromise.then).to.be.a("function");
        expect(frameClosedPromise.catch).to.be.a("function");

        const frameClosedResult = await frameClosedPromise;

        expect(frameClosedResult).to.be.a("function");

        unSubFuncs.push(frameClosedResult);
    });

    it('should notify when the frame was closed', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame.onClosed(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);

    });

    it('should provide a valid object when notifying of the closed frame', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame.onClosed((closed) => {
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

    it('should provide the correct frame id when notifying of the closed frame', (done) => {
        const ready = gtf.waitFor(2, done);
        const defaultFrameId = defaultFrame.id;

        defaultFrame.onClosed((closed) => {
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

    it('should notify exactly once of the closed frame', (done) => {
        const ready = gtf.waitFor(3, done);
        let frameClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        defaultFrame.onClosed(() => {
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

    it('should notify once when two frames were closed at the same time, and we subscribed to one of them', (done) => {
        const ready = gtf.waitFor(3, done);
        let addedFrame;
        let frameClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return defaultFrame.onClosed(() => {
                    if (frameClosedCalled) {
                        done("Frame closed was already triggered!");
                        return;
                    }
                    frameClosedCalled = true;
                    ready();
                });
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

    it('should notify once when two frames were closed one after the other, but we subscribed to one of them', (done) => {
        const ready = gtf.waitFor(3, done);
        let addedFrame;

        let frameClosedCalled = false;

        timeout = setTimeout(ready, 3000);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return defaultFrame.onClosed(() => {
                    if (frameClosedCalled) {
                        done("Frame closed was already triggered!");
                        return;
                    }
                    frameClosedCalled = true;
                    ready();
                });
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return addedFrame.close();
            })
            .then(() => defaultFrame.close())
            .then(ready)
            .catch(done);
    });

    it('should notify once when two frames were closed one after the first (the once we subbed for) was heard', (done) => {
        const ready = gtf.waitFor(4, done);
        let addedFrame;

        timeout = setTimeout(ready, 3000);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces.createWorkspace(createConfig)
            .then((wsp) => {
                addedFrame = wsp.frame;
                return defaultFrame.onClosed((closed) => {
                    if (defaultFrame.id === closed.frameId) {
                        addedFrame.close().then(ready).catch(done);
                        ready();
                        return
                    }
                    done("Frame closed was already triggered!");
                });
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return defaultFrame.close();
            })
            .then(ready)
            .catch(done);
    });

    it('no frame windows should exist when notified that the only frame was closed', (done) => {
        const ready = gtf.waitFor(2, done);

        defaultFrame.onClosed(() => {
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

        defaultFrame.onClosed((closed) => {
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

        defaultFrame.onClosed(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
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
            defaultFrame.onClosed(input)
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
