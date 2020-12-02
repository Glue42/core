describe('close()', () => {
    let glueApplicationOne;
    let glueApplicationTwo;
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        const promisesToAwait = [gtf.agm.unregisterMyStreams(myStreams)];

        if (glueApplicationOne) {
            promisesToAwait.push(glueApplicationOne.stop());

            glueApplicationOne = null;
        }
        if (glueApplicationTwo) {
            promisesToAwait.push(glueApplicationTwo.stop());

            glueApplicationTwo = null;
        }

        await Promise.all(promisesToAwait);

        myStreams = [];
    });

    it('Should close the stream and all active subscriptions.', (done) => {
        const ready = gtf.waitFor(4, done);

        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name,
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
            const promiseSub1 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '1'
                }
            });
            const promiseSub2 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '2'
                }
            });
            const promiseSub3 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '3'
                }
            });

            Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(([sub1, sub2, sub3]) => {
                sub1.onClosed(() => ready());
                sub2.onClosed(() => ready());
                sub3.onClosed(() => ready());

                const un = glue.interop.methodRemoved(m => {
                    if (m.name === name) {
                        try {
                            expect(glue.interop.methods({
                                name,
                            }).length).to.eql(0);
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    }
                });
                gtf.addWindowHook(un);

                stream.close();
            });
        });
    });

    it('Should subscribe to all streams and hear onData even [when the server has more than 1 method]', (done) => {
        const methodDefinition = {
            name: gtf.agm.getMethodName()
        };

        Promise.all([gtf.createApp(), gtf.createApp()])
            .then(([appOne, appTwo]) => {
                glueApplicationOne = appOne;
                glueApplicationTwo = appTwo;

                const unUsedName = gtf.agm.getMethodName();
                return glue.interop.createStream(unUsedName)
                    .then((stream) => {
                        myStreams.push(stream);

                        return Promise.all([
                            glue.interop.createStream(methodDefinition),
                            glueApplicationOne.agm.createStream(methodDefinition)
                        ]);
                    })
                    .then(([streamOne, streamTwo]) => {
                        myStreams.push(streamOne);
                        const called = gtf.waitFor(2, () => done());

                        glueApplicationTwo.agm.subscribe(methodDefinition, { target: 'all' })
                            .then((sub) => {
                                sub.onData(() => called());

                                streamOne.push({ a: 5 });
                                streamTwo.push({ b: 5 });
                            });
                    });
            });
    });
});
