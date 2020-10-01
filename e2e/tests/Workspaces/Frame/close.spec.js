describe("maximize() Should", () => {
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

    before(() => coreReady);

    let workspace;

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    it("close the frame", async () => {
        const frame = (await glue.workspaces.getAllFrames())[0];

        await frame.close();
        const allFrames = await glue.workspaces.getAllFrames();

        expect(allFrames.length).to.eql(0);
    });
});
