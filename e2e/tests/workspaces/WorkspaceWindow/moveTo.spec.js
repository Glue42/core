describe("moveTo() Should", async () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const threeContainersConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: [

                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    windowConfig
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [

                        ]
                    }
                ]
            }
        ]
    }

    const threeContainersConfigNewFrame = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: [

                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    windowConfig
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [

                        ]
                    }
                ]
            }
        ],
        frame: {
            newFrame: true
        }
    }

    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("move the window from one row to another when the target is a row in the same frame", async () => {
        const firstWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);
        const secondWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);

        const immediateChildren = firstWorkspace.children;
        const firstRow = immediateChildren[0];
        const columnWithRow = firstRow.children.find(c => c.children.some(cc => cc.type === "row"));
        const rowInColumn = columnWithRow.children[0];
        await rowInColumn.addWindow(windowConfig);

        await firstWorkspace.refreshReference();

        const newlyAddedWindow = firstWorkspace.getAllWindows().find(w => w.parent && w.parent.type === "row");

        const immediateChildrenSecond = secondWorkspace.children;
        const firstRowSecond = immediateChildrenSecond[0];
        const columnWithRowSecond = firstRowSecond.children.find(c => c.children.some(cc => cc.type === "row"));
        const rowInColumnSecond = columnWithRowSecond.children[0];

        await newlyAddedWindow.moveTo(rowInColumnSecond);

        await firstWorkspace.refreshReference();
        await secondWorkspace.refreshReference();

        const firstWindows = firstWorkspace.getAllWindows();
        const secondWindows = secondWorkspace.getAllWindows();

        expect(firstWindows.length).to.eql(1);
        expect(secondWindows.length).to.eql(2);
    });

    it("move the window from one column to another when the target is a column in the same frame", async () => {
        const firstWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);
        const secondWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);

        const immediateChildren = firstWorkspace.children;
        const firstRow = immediateChildren[0];
        const columnWithNoChildren = firstRow.children.find(c => c.children.length === 0);
        await columnWithNoChildren.addWindow(windowConfig);

        await firstWorkspace.refreshReference();

        const newlyAddedWindow = firstWorkspace.getAllWindows().find(w => w.parent && w.parent.type === "column");

        const immediateChildrenSecond = secondWorkspace.children;
        const firstRowSecond = immediateChildrenSecond[0];
        const columnWithNoChildrenSecond = firstRowSecond.children.find(c => c.children.length === 0);

        await newlyAddedWindow.moveTo(columnWithNoChildrenSecond);

        // await firstWorkspace.refreshReference();
        // await secondWorkspace.refreshReference();

        // const firstWindows = firstWorkspace.getAllWindows();
        // const secondWindows = secondWorkspace.getAllWindows();

        // expect(firstWindows.length).to.eql(1);
        // expect(secondWindows.length).to.eql(2);
    });

    it("move the window from one group to another when the target is a group in the same frame", async () => {
        const firstWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);
        const secondWorkspace = await glue.workspaces.createWorkspace(threeContainersConfig);

        const immediateChildren = firstWorkspace.children;
        const firstRow = immediateChildren[0];
        const columnWithGroup = firstRow.children.find(c => c.children.some(cc => cc.type === "group"));
        const groupInColumn = columnWithGroup.children[0];
        await groupInColumn.addWindow(windowConfig);

        await firstWorkspace.refreshReference();

        const newlyAddedWindow = firstWorkspace.getAllWindows().find(w => w.parent && w.parent.type === "group");

        const immediateChildrenSecond = secondWorkspace.children;
        const firstRowSecond = immediateChildrenSecond[0];
        const columnWithGroupSecond = firstRowSecond.children.find(c => c.children.some(cc => cc.type === "group"));
        const groupInColumnSecond = columnWithGroupSecond.children[0];

        await newlyAddedWindow.moveTo(groupInColumnSecond);

        await firstWorkspace.refreshReference();
        await secondWorkspace.refreshReference();

        const firstWindows = firstWorkspace.getAllWindows();
        const secondWindows = secondWorkspace.getAllWindows();

        expect(firstWindows.length).to.eql(1);
        expect(secondWindows.length).to.eql(2);
    });

    // it.skip("move the window from one row to another when the target is a row in the same workspace", () => {
    //     // TODO
    // });

    // it.skip("move the window from one column to another when the target is a column in the same workspace", () => {
    //     // TODO
    // });

    // it.skip("move the window from one group to another when the target is a group in the same workspace", () => {
    //     // TODO
    // });
});
