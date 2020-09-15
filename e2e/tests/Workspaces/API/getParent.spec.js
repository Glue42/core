describe("getBox() Should", () => {
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "window",
                            appName: "dummyApp"
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "window",
                                appName: "dummyApp"
                            }]
                        }]
                    },
                ]
            }
        ],
        frame: {
            newFrame: true
        }
    }

    let workspace = undefined;

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const boxPromise = glue.workspaces.getBox(p => p.type === "column");

        expect(boxPromise.then).to.be.a("function");
        expect(boxPromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await glue.workspaces.getBox(p => p.type === "column");
    });

    it("return the correct box", async () => {
        const firstBox = await glue.workspaces.getBox(p => p.type === "column");
        const secondBox = await glue.workspaces.getBox(p => p.type === "row");
        const thirdBox = await glue.workspaces.getBox(p => p.type === "group");

        expect(firstBox.type).to.eql("column");
        expect(secondBox.type).to.eql("row");
        expect(thirdBox.type).to.eql("group");
    });

    Array.from([null, undefined, 42, "42", [], {}]).forEach((input) => {
        it(`reject when the argument is ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.getBox(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    });
});
