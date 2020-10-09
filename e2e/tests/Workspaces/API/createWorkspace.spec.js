describe('createWorkspace() ', function () {

    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    // this should be iterated with different complexities configs
    describe('basic Should ', () => {
        // BASIC
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

        const context = {
            test: "window context"
        };

        const basicConfigWithContext = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "window",
                            context,
                            appName: "dummyApp"
                        }
                    ]
                }
            ]
        };

        it('return a promise', async () => {
            const openPromise = glue.workspaces.createWorkspace(basicConfig);
            expect(openPromise.then).to.be.a("function");
            expect(openPromise.catch).to.be.a("function");
            const workspace = await openPromise;
            await workspace.close();
        });

        it('resolve when valid data is provided', async () => {
            const workspace = await glue.workspaces.createWorkspace(basicConfig);
            await workspace.close();
        });

        it('resolve with a Workspace instance when data is valid', async () => {
            const workspace = await glue.workspaces.createWorkspace(basicConfig);
            expect(workspace.constructor.name).to.eql("Workspace");
            await workspace.close();
        });

        it('be a new workspace with correct id in the summaries collection after resolve', async () => {
            const workspace = await glue.workspaces.createWorkspace(basicConfig);
            const allWorkspaces = await glue.workspaces.getAllWorkspacesSummaries();

            expect(allWorkspaces.some((wsp) => wsp.id === workspace.id)).to.be.true;
            await workspace.close();
        });

        it('update the window contexts of the windows with a context property when the context property is set', async () => {
            const workspace = await glue.workspaces.createWorkspace(basicConfigWithContext);
            const window = workspace.getAllWindows()[0];

            await window.forceLoad();
            await workspace.refreshReference();
            const wait = new Promise((r) => setTimeout(r, 3000));
            await wait;

            const glueWin = window.getGdWindow();
            const winContext = await glueWin.getContext();

            expect(winContext).to.eql(context);
        });

        it('reject and not open a workspace when called with no data', (done) => {
            glue.workspaces.createWorkspace()
                .then(() => {
                    done('Should not have resolved, because the method is called with no arguments');
                })
                .catch(() => {
                    return glue.workspaces.getAllWorkspacesSummaries();
                })
                .then((summaries) => {
                    expect(summaries.length).to.eql(0);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        [undefined, null, 42, [], [{ test: 42 }], true, 'works'].forEach((incorrectData) => {
            it(`reject and not open a workspace when called with incorrect data type: ${JSON.stringify(incorrectData)}`, (done) => {
                glue.workspaces.createWorkspace(incorrectData)
                    .then(() => {
                        done(`Should not have resolved, because the method is called with incorrect data type: ${JSON.stringify(incorrectData)}`);
                    })
                    .catch(() => {
                        return glue.workspaces.getAllWorkspacesSummaries();
                    })
                    .then((summaries) => {
                        expect(summaries.length).to.eql(0);
                        done();
                    })
                    .catch(done);
            });
        })

        // Config
        // Title
        it("resolve with a default workspace title when title is not specified", async () => {
            const workspace = await glue.workspaces.createWorkspace(basicConfig);

            expect(workspace.title).to.be.a("string");
        });

        it("resolve with correct title when it is specified and valid", async () => {
            const testTitle = "myTestTitle";
            const workspace = await glue.workspaces.createWorkspace(
                Object.assign(JSON.parse(JSON.stringify(basicConfig)), { config: { title: testTitle } })
            );

            expect(workspace.title).to.eql(testTitle);
        });


        // Frame
        it("open a new frame a put the workspace in it, when no frames are available and no frame is specified", async () => {
            await glue.workspaces.createWorkspace(basicConfig);

            const allFrames = await glue.workspaces.getAllFrames();

            expect(allFrames.length).to.eql(1);
        });

        it("put the new workspace in that frame when there is already an open frame and no frame property is specified", async () => {
            await glue.workspaces.createWorkspace(basicConfig);
            await glue.workspaces.createWorkspace(basicConfig);

            const allFrames = await glue.workspaces.getAllFrames();

            expect(allFrames.length).to.eql(1);
        });

        it("put the new workspace in the last opened frame when there are two frames open and no frame property is specified", async () => {
            const firstWorkspace = await glue.workspaces.createWorkspace(basicConfig);
            const secondWorkspace = await glue.workspaces.createWorkspace(
                Object.assign(
                    JSON.parse(JSON.stringify(basicConfig)),
                    { frame: { newFrame: true } })
            );

            const thirdWorkspace = await glue.workspaces.createWorkspace(basicConfig);

            const allFrames = await glue.workspaces.getAllFrames();

            expect(allFrames.length).to.eql(2);
            expect(thirdWorkspace.frameId).to.eql(secondWorkspace.frameId);
        });

        it("put the new workspace in the correct frame when reuseFrameId is specified and there are 2 or more frames already opened", async () => {
            // I am using three workspaces/frames in order to avoid naive implementations like always the first or always the last
            const firstWorkspace = await glue.workspaces.createWorkspace(basicConfig);
            const secondWorkspace = await glue.workspaces.createWorkspace(basicConfig);
            const thirdWorkspace = await glue.workspaces.createWorkspace(basicConfig);

            const reuseFrameConfig = Object.assign(JSON.parse(JSON.stringify(basicConfig)), {
                frame: {
                    newFrame: false,
                    reuseFrameId: secondWorkspace.frameId
                }
            });

            const reuseFrameWorkspace = await glue.workspaces.createWorkspace(reuseFrameConfig);

            expect(reuseFrameWorkspace.frameId).to.eql(secondWorkspace.frameId);
        });

        it("reject when reuseFrameId is specified, but it is not valid", (done) => {
            glue.workspaces.createWorkspace(basicConfig).then(() => {
                const reuseFrameConfig = Object.assign(JSON.parse(JSON.stringify(basicConfig)), {
                    frame: {
                        newFrame: false,
                        reuseFrameId: { a: "invalid" }
                    }
                });

                glue.workspaces.createWorkspace(reuseFrameConfig)
                    .then(() => done("Should not resolve"))
                    .catch(() => done());
            }).catch(done);

        });

        it("reject when reuseFrameId is specified and it is a valid string, but there isn't a frame with that id", (done) => {
            glue.workspaces.createWorkspace(basicConfig).then((wsp) => {
                const reuseFrameConfig = Object.assign(JSON.parse(JSON.stringify(basicConfig)), {
                    frame: {
                        newFrame: false,
                        reuseFrameId: wsp.frameId
                    }
                });
                return wsp.frame.close().then(() => {
                    glue.workspaces.createWorkspace(reuseFrameConfig).then(() => done("Should not resolve")).catch(() => done());
                });
            }).catch(done);
        });
    });

    describe('stability ', () => {
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

        it('should resolve when 10 workspaces are opened immediately one after the other with default frame settings and there should be 1 frame', async () => {

            for (const _ of Array.from({ length: 10 })) {
                await glue.workspaces.createWorkspace(basicConfig);
            }

            const framesCount = (await glue.workspaces.getAllFrames()).length;

            expect(framesCount).to.eql(1);
        });

        it('should resolve when 10 workspaces are opened immediately in promise.all with default frame settings', async () => {
            await Promise.all(Array.from({ length: 10 }).map(() => glue.workspaces.createWorkspace(basicConfig)));
        });

        it('should resolve when 10 workspaces are opened immediately in promise.all with newFrame setting and there should be 10 frames', async () => {
            const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

            await Promise.all(Array.from({ length: 10 }).map(() => glue.workspaces.createWorkspace(createConfig)));

            const framesCount = (await glue.workspaces.getAllFrames()).length;

            expect(framesCount).to.eql(10);
        });

        [
            0,
            20,
            30,
            40,
            70,
            100,
            125,
            150
        ].forEach((interval) => {
            it(`should resolve when 10 workspaces are opened in ${interval}ms intervals with default frame settings`, async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

                const createPromises = [];
                
                for (const _ of Array.from({ length: 10 })) {
                    const createPromise = glue.workspaces.createWorkspace(basicConfig);
                    createPromises.push(createPromise);
                    await wait(interval);
                }

                await Promise.all(createPromises);
            });
    
            it(`should resolve when 10 workspaces are opened in ${interval}ms intervals with newFrame setting and there should be 10 frames`, async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const createConfig = Object.assign({}, basicConfig, { frame: { newFrame: true } });

                const createPromises = [];
                
                for (const _ of Array.from({ length: 10 })) {
                    const createPromise = glue.workspaces.createWorkspace(createConfig);
                    createPromises.push(createPromise);
                    await wait(interval);
                }

                await Promise.all(createPromises);

                const framesCount = (await glue.workspaces.getAllFrames()).length;

                expect(framesCount).to.eql(10);
            });

        });

    });
    // SAVE CONFIG
    // after resolve the layout should be present in the layouts collection when specified in the save config
    // after resolve the layout should NOT be present in the layouts collection when there is no save config
    // should reject and NOT open a workspace when there is a save config, but it is not valid (multiple test inputs)

    // CONFIG
    // -> TITLE
    // should resolve with a default workspace title when title is not specified - done for basic
    // should resolve with correct title, when it is specified and valid - done for basic
    // should reject and not open a workspace when the title is not valid (multiple inputs)
    // -> POSITION
    // should resolve with a workspace at position 0 when nothing is specified and this is the only workspace in the frame
    // should resolve with a workspace at position 0 even when a position is provided and it is a number, but this is the only workspace in the frame
    // should resolve with a workspace at the specified position when specified and there are already 3 workspace in the frame beforehand (inputs 0, 1, 2, 3)
    // should resolve with a workspace at the last position when an out-of-range position is specified and the frame as 3 workspaces beforehand
    // should reject when a position is specified but it is not a valid (multiple inputs)
    // -> isFocused
    // should always resolve with focused workspace when this is the only workspace in the frame when the provided data is valid (true/false inputs)
    // should resolve with focused workspace when this is NOT specified, because this is the default behaviour and there are 2 other workspaces in the frame beforehand
    // should resolve with focused workspace when this is specified and there are 2 other workspaces in the frame beforehand
    // should resolve without focusing the workspace when this is specified and there are 2 other workspaces in the frame beforehand
    // should reject and not open a workspace when isActive is specified, but it not valid

    // FRAME
    // should open a new frame a put the workspace in it, when no frames are available and no frame is specified - done for basic
    // when there is already an open frame and no frame property is specified, should put the new workspace in that frame - done for basic
    // when there are two frames open and no frame property is specified, should put the new workspace in the last opened frame - done for basic
    // should put the new workspace in the correct frame, when reuseFrameId is specified and there are 2 frames already opened - done for basic
    // should reject when reuseFrameId is specified, but it is not valid - done for basic
    // should reject when reuseFrameId is specified and it is a valid string, but there isn't a frame with that id - done for basic

    // this should be iterated with different complexities configs
    // CHILDREN COMPOSITION (this should be iterated with varying workspace complexity)
    // the returned workspace instance should contain the correct parents and windows
    // the returned workspace instance should contain the correct parents and windows in the correct arrangement

    // CONTEXT (skip until it is decided how the user will access workspace-specific context)

    // this should be iterated with different complexities configs
    // PARALLEL
    // there should be 3 workspaces in the summaries collection after resolve
    // there should be 3 workspaces in the summaries collection with correct ids
    // when all resolved there should be 3 workspaces objects with correct titles
    // when all resolved there should be 3 workspaces objects with correct children (multiple inputs)
    // when all resolved there should be exactly one frame when there was no frame specified in any config and there was no frame opened already
    // when all resolved there should be exactly one frame when there was no frame specified in any config and there was a frame opened already with one workspace
    // when all resolved there should be exactly one frame when that frame was specified for reuse in any config and there were a total of 2 frames opened already with one workspace each
    // when all resolved there should be 3 different frames when a new frame was specified in each config
    // context check TODO WHEN READY
});
