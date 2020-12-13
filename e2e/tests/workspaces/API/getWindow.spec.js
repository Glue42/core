describe("getWindow() Should", () => {
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
        const windowPromise = glue.workspaces.getWindow(w => w.parent.type === "column");

        expect(windowPromise.then).to.be.a("function");
        expect(windowPromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await glue.workspaces.getWindow(w => w.parent.type === "column");
    });

    it("return the correct window", async () => {
        const firstWindow = await glue.workspaces.getWindow(w => w.parent.type === "column");
        const secondWindow = await glue.workspaces.getWindow(w => w.parent.type === "row");
        const thirdWindow = await glue.workspaces.getWindow(w => w.parent.type === "group");

        expect(firstWindow.parent.type).to.eql("column");
        expect(secondWindow.parent.type).to.eql("row");
        expect(thirdWindow.parent.type).to.eql("group");
    });

    Array.from([null, undefined, 42, "42", [], {}]).forEach((input) => {
        it(`reject when the argument is ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.getWindow(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    });
});
