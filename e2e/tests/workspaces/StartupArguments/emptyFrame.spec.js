// incorrect tests
describe.skip("Argument emptyFrame Should", () => {

    let windowsForClosing = [];

    before(() => coreReady);

    beforeEach(() => {
        windowsForClosing = [];
    });

    afterEach(async () => {
        await Promise.all(windowsForClosing.map(w => w.close()));

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map(f => f.close()));
    });

    it("open a glue window without workspaces in it", async () => {
        const name = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(name, "/glue/workspaces?emptyFrame=true");
        windowsForClosing.push(win);
        const worksapcesCount = (await glue.workspaces.getAllWorkspaces()).length;

        expect(win).to.not.be.undefined;
        expect(worksapcesCount).to.eql(0);
    });

    it("have a workspace in it without opening new frames when createWorkspace is invoked", async () => {
        const name = gtf.getWindowName("workspaces");
        const win = await glue.windows.open(name, "/glue/workspaces?emptyFrame=true");
        windowsForClosing.push(win);

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
        await glue.workspaces.createWorkspace(basicConfig);

        const workspacesCount = (await glue.workspaces.getAllWorkspaces()).length;

        // TODO check the window count without taking into consideration the popup window
        expect(workspacesCount).to.eql(1);
    });
});
