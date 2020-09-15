describe("getWorkspace() Should", () => {
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
        const workspacePromise = glue.workspaces.getWorkspace(w => w.id === workspaceOne.id);

        expect(workspacePromise.then).to.be.a("function");
        expect(workspacePromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await glue.workspaces.getWorkspace(w => w.id === workspaceOne.id);
    });

    it("return the correct workspace", async () => {
        const firstWorkspace = await glue.workspaces.getWorkspace(w => w.id === workspaceOne.id);
        const secondWorkspace = await glue.workspaces.getWorkspace(w => w.id === workspaceTwo.id);
        const thirdWorkspace = await glue.workspaces.getWorkspace(w => w.id === workspaceThree.id);

        expect(firstWorkspace.id).to.eql(workspaceOne.id);
        expect(secondWorkspace.id).to.eql(workspaceTwo.id);
        expect(thirdWorkspace.id).to.eql(workspaceThree.id);
    });

    Array.from([null, undefined, 42, "42", [], {}]).forEach((input) => {
        it(`reject when the argument is ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.getWorkspace(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    });
});
