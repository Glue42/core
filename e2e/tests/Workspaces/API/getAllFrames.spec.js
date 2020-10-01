describe('getAllFrames() Should ', function () {
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
        ],
        frame: {
            newFrame: true
        }
    }
    // TODO check the close() case
    // TODO predicate tests
    before(() => coreReady);

    beforeEach(async () => {
        await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    it('return a promise', async () => {
        const getAllFramesPromise = glue.workspaces.getAllFrames();
        expect(getAllFramesPromise.then).to.be.a("function");
        expect(getAllFramesPromise.catch).to.be.a("function");
    });

    it('resolve', async () => {
        await glue.workspaces.getAllFrames();
    });

    it('resolve with an array of frame instances', async () => {
        const frames = await glue.workspaces.getAllFrames();

        frames.forEach((frame) => {
            expect(frame.constructor.name).to.eql("Frame");
        });
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`return an array with ${i + 1} frame instances with correct ids`, async () => {
            const frameIds = await Promise.all(Array.from({ length: i }).map(async () => {
                const workspace = await glue.workspaces.createWorkspace(basicConfig);

                return workspace.frameId;
            }));
            const allFrames = await glue.workspaces.getAllFrames();

            frameIds.forEach((frameId) => {
                expect(allFrames.some((frame) => frameId === frame.id)).to.be.true;
            });
        });
    })

    it("return an empty array when the single opened frame has just been closed", async () => {
        const allFrames = await glue.workspaces.getAllFrames();
        await Promise.all(allFrames.map((f) => f.close()));

        const allFramesAfterClosing = await glue.workspaces.getAllFrames();

        expect(allFramesAfterClosing.length).to.eql(0);
    });
});
