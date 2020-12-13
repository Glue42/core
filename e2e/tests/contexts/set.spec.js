describe("set() Should", () => {
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

    after(() => {
        return secondApp.stop();
    });

    beforeEach(() => {
        contextName = gtf.getWindowName("gtfContext");
    });


    contextsForTesting.forEach((context) => {
        it(`set the context between 2 applications with ${context.type}`, async () => {
            await glue.contexts.set(contextName, context);

            const contextFromSecondApp = await secondApp.getContext(contextName);

            expect(contextFromSecondApp).to.eql(context);

        });

        it(`replace the old context when the new context is ${context.type} and 2 applications are used`, async () => {
            const initialContext = {
                isSaved: true
            };

            await glue.contexts.set(contextName, initialContext);
            await glue.contexts.set(contextName, context);

            const contextFromSecondApp = await secondApp.getContext(contextName);

            expect(contextFromSecondApp.isSaved).to.be.undefined;
        });
    });

    it("replace the context when top level properties are the same", async () => {
        const firstContext = {
            a: 1,
            b: 2
        };

        const secondContext = {
            b: 0,
            c: 3
        };

        await glue.contexts.set(contextName, firstContext);
        await glue.contexts.set(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp).to.eql(secondContext);
    });

    it("replace the context when inner properties are affected", async () => {
        const firstContext = {
            first: {
                a: 1,
                b: 2
            }
        };

        const secondContext = {
            first: {
                b: 0,
                c: 3
            }
        };
        await glue.contexts.set(contextName, firstContext);
        await glue.contexts.set(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp).to.eql(secondContext);
    });

    it("replace the context when top level array is affected", async () => {
        const firstContext = {
            a: [1],
            b: [2]
        };

        const secondContext = {
            b: [0],
            c: [3]
        };
        await glue.contexts.set(contextName, firstContext);
        await glue.contexts.set(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp).to.eql(secondContext);
    });

    it("replace the context when an inner array is affected", async () => {
        const firstContext = {
            first: {
                a: [1],
                b: [2]
            }
        };

        const secondContext = {
            first: {
                b: [0],
                c: [3]
            }
        };
        await glue.contexts.set(contextName, firstContext);
        await glue.contexts.set(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp).to.eql(secondContext);
    });

    [42, "42", []].forEach((invalidInput) => {
        it.skip(`Reject the promise when the input is ${JSON.stringify(invalidInput)}`, (done) => {
            glue.contexts.set(contextName, invalidInput).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});
