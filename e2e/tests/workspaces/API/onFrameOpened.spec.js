describe('onFrameOpened() ', () => {

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
        const frameOpenedPromise = glue.workspaces.onFrameOpened(() => { });

        expect(frameOpenedPromise.then).to.be.a("function");
        expect(frameOpenedPromise.catch).to.be.a("function");

        const frameOpenedResult = await frameOpenedPromise;

        expect(frameOpenedResult).to.be.a("function");

        unSubFuncs.push(frameOpenedResult);
    });

    it('should notify when a new frame was opened', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces.onFrameOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig)
            })
            .then(ready)
            .catch(done);
    });

    it('should notify with a valid frame id when a new frame was opened', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameOpened((frame) => {
                try {
                    expect(frame.id).to.be.a('string')
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

    it('should notify just once when one frame was opened', (done) => {
        const ready = gtf.waitFor(3, done);
        let frameOpenedCalled = false;

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onFrameOpened(() => {
                if (frameOpenedCalled) {
                    done("Frame opened was already triggered!");
                    return;
                }
                frameOpenedCalled = true;
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two frames were opened at the same time', (done) => {
        const ready = gtf.waitFor(3, done);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces
            .onFrameOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return Promise.all([
                    glue.workspaces.createWorkspace(createConfig),
                    glue.workspaces.createWorkspace(createConfig)
                ])
            })
            .then(ready)
            .catch(done);

    });

    it('should notify twice when two frames were opened one after the other', (done) => {
        const ready = gtf.waitFor(3, done);

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces
            .onFrameOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(createConfig);
            })
            .then(() => glue.workspaces.createWorkspace(createConfig))
            .then(ready)
            .catch(done);
    });

    it('should notify twice when two frames were opened one after the other was heard', (done) => {
        const ready = gtf.waitFor(3, done);
        let secondFrameStarted = false;

        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        glue.workspaces
            .onFrameOpened(() => {
                if (!secondFrameStarted) {
                    glue.workspaces.createWorkspace(createConfig).then(() => ready()).catch(done);
                    secondFrameStarted = true;
                }
                ready();
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(createConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should notify once when a second workspace was opened but in the same frame', (done) => {
        const ready = gtf.waitFor(3, done);

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onFrameOpened(ready)
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(() => glue.workspaces.createWorkspace(basicConfig))
            .then(ready)
            .catch(done);

    });

    it('a new frame should exist when notified of a new frame', (done) => {
        const ready = gtf.waitFor(2, done);

        let initialFramesCount;

        glue.workspaces.getAllFrames()
            .then((frames) => {
                initialFramesCount = frames.length;

                return glue.workspaces.onFrameOpened(async () => {
                    try {
                        const allFrames = await glue.workspaces.getAllFrames();
                        expect(allFrames.length).to.eql(initialFramesCount + 1);
                        ready();
                    } catch (error) {
                        done(error);
                    }
                })
            })
            .then((unSub) => {
                unSubFuncs.push(unSub);
                return glue.workspaces.createWorkspace(basicConfig)
            })
            .then(ready)
            .catch(done);
    });

    it('the frame should exist in the frames collection when notified of its opening', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.workspaces
            .onFrameOpened(async (frame) => {
                try {
                    const hasFrameWindow = await glue.workspaces.getFrame((fr) => fr.id === frame.id);
                    expect(hasFrameWindow).to.not.be.undefined;
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
            .onFrameOpened(() => {
                done("Should not have been called.");
            })
            .then((unSub) => {
                unSub();
                return glue.workspaces.createWorkspace(basicConfig);
            })
            .then(ready)
            .catch(done);
    });

    it('should not notify when unsubscribed after receiving notifications', (done) => {
        const ready = gtf.waitFor(3, done);

        let unSub;
        let frameOpenedCalled = false;
        const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

        timeout = setTimeout(ready, 3000);

        glue.workspaces
            .onFrameOpened(() => {
                if (!frameOpenedCalled) {
                    frameOpenedCalled = true;
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
            glue.workspaces.onFrameOpened(input)
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