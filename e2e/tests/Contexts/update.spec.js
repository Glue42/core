describe("update() Should", () => {

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
    })

    contextsForTesting.forEach((context) => {
        it(`update the context between 2 applications with ${context.type}`, async () => {
            await glue.contexts.update(contextName, context);

            const contextFromSecondApp = await secondApp.getContext(contextName);

            expect(contextFromSecondApp).to.eql(context);

        });

        it(`not replace the old context when the new context is ${context.type} and 2 applications are used`, async () => {
            const initialContext = {
                isSaved: true
            };

            await glue.contexts.update(contextName, initialContext);
            await glue.contexts.update(contextName, context);

            const contextFromSecondApp = await secondApp.getContext(contextName);

            expect(contextFromSecondApp.isSaved).to.be.true;
        });
    });

    it("merge the contexts when top level properties are the same", async () => {
        const firstContext = {
            a: 1,
            b: 2
        };

        const secondContext = {
            b: 0,
            c: 3
        };

        await glue.contexts.update(contextName, firstContext);
        await glue.contexts.update(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp.a).to.eql(firstContext.a);
        expect(contextFromSecondApp.b).to.eql(secondContext.b);
        expect(contextFromSecondApp.c).to.eql(secondContext.c);

    });

    it.skip("merge the contexts when inner properties are affected", async () => {
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

        await glue.contexts.update(contextName, firstContext);
        await glue.contexts.update(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp.first.a).to.eql(firstContext.first.a);
        expect(contextFromSecondApp.first.b).to.eql(secondContext.first.b);
        expect(contextFromSecondApp.first.c).to.eql(secondContext.first.c);
    });

    it.skip("merge the contexts when top level array is affected", async () => {
        const firstContext = {
            a: [1],
            b: [2]
        };

        const secondContext = {
            b: [0],
            c: [3]
        };

        await glue.contexts.update(contextName, firstContext);
        await glue.contexts.update(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp.a).to.eql(firstContext.a);
        expect(contextFromSecondApp.b).to.eql([...secondContext.b, ...firstContext.b]);
        expect(contextFromSecondApp.c).to.eql(secondContext.c);
    });

    it.skip("merge the contexts when an inner array is affected", async () => {
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

        await glue.contexts.update(contextName, firstContext);
        await glue.contexts.update(contextName, secondContext);

        const contextFromSecondApp = await secondApp.getContext(contextName);

        expect(contextFromSecondApp.first.a).to.eql(firstContext.first.a);
        expect(contextFromSecondApp.first.b).to.eql([...secondContext.first.b, ...firstContext.first.b]);
        expect(contextFromSecondApp.first.c).to.eql(secondContext.first.c);
    });

    [42, "42", []].forEach((invalidInput) => {
        it.skip(`Reject the promise when the input is ${JSON.stringify(invalidInput)}`, (done) => {
            glue.contexts.update(contextName, invalidInput).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });

});