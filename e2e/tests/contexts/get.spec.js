describe("get() Should", () => {
    const contextsForTesting = [
        { type: "simple" },
        {
            type: "simpleWithArray",
            arr: [1, 2, 3]
        },
        {
            type: "arrayWithDifferentTypes",
            arr: [1, "2", {}]
        },
        {
            type: "nestedObjects",
            first: {
                second: {
                    third: {}
                }
            }
        },
        {
            type: "cubeRepresentation",
            cube: [[[1]], [[2]], [[3]]]
        }
    ]

    let contextName;
    let secondApp;
    before(async () => {
        await coreReady;
        secondApp = await gtf.createApp();
    });

    after(()=>{
        return secondApp.stop();
    });

    beforeEach(() => {
        contextName = gtf.getWindowName("gtfContext");
    });

    contextsForTesting.forEach((context) => {
        it(`get the context between 2 applications with ${context.type}`, async () => {
            await secondApp.setContext(contextName, context);

            const myContext = await glue.contexts.get(contextName);

            expect(myContext).to.eql(context);

        });

        it(`get the old context when the new context is ${context.type} and 2 applications are used`, async () => {
            const initialContext = {
                isSaved: true
            };

            await secondApp.setContext(contextName, initialContext);
            await secondApp.setContext(contextName, context);

            const myContext = await glue.contexts.get(contextName);

            expect(myContext.isSaved).to.be.undefined;
        });

        it(`update the context between 2 applications with ${context.type}`, async () => {
            await secondApp.updateContext(contextName, context);

            const myContext = await glue.contexts.get(contextName);

            expect(myContext).to.eql(context);

        });

        it(`get a merged context when the new context is ${context.type} and 2 applications are used`, async () => {
            const initialContext = {
                isSaved: true
            };

            await secondApp.updateContext(contextName, initialContext);
            await secondApp.updateContext(contextName, context);

            const myContext = await glue.contexts.get(contextName);

            expect(myContext.isSaved).to.be.true;
        });
    });
});