describe('close()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should close the branch and all active subscriptions on that branch.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
            myStreams.push(stream);

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
                sub1.onClosed(() => {
                    try {
                        expect(stream.branches().find(b => b.key === '1')).to.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                sub2.onClosed(() => {
                    done('Should not be closed.');
                });
                sub3.onClosed(() => {
                    done('Should not be closed.');
                });

                stream.branches().find(b => b.key === '1').close();
            });
        });
    });
});
