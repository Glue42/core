describe("getFrame() Should", () => {
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

    let workspaceOne = undefined;
    let workspaceTwo = undefined;
    let workspaceThree = undefined;

    before(async () => {
        await coreReady;
        workspaceOne = await glue.workspaces.createWorkspace(basicConfig);
        workspaceTwo = await glue.workspaces.createWorkspace(basicConfig);
        workspaceThree = await glue.workspaces.createWorkspace(basicConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const framePromise = glue.workspaces.getFrame(f => f.id === workspaceOne.frameId);

        expect(framePromise.then).to.be.a("function");
        expect(framePromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await glue.workspaces.getFrame(f => f.id === workspaceOne.frameId);
    });

    it("return the correct frame", async () => {
        const firstFrame = await glue.workspaces.getFrame(f => f.id === workspaceOne.frameId);
        const secondFrame = await glue.workspaces.getFrame(f => f.id === workspaceTwo.frameId);
        const thirdFrame = await glue.workspaces.getFrame(f => f.id === workspaceThree.frameId);

        expect(firstFrame.id).to.eql(workspaceOne.frameId);
        expect(secondFrame.id).to.eql(workspaceTwo.frameId);
        expect(thirdFrame.id).to.eql(workspaceThree.frameId);
    });

    Array.from([null, undefined, 42, "42", [], {}]).forEach((input) => {
        it(`reject when the argument is ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.getFrame(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    });
});
