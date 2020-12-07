describe('subscriptions()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should return all active subscriptions to the stream on that branch.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name,
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        let stream;
        let subsCount = 0;

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
            subscriptionAddedHandler: () => {
                ++subsCount;
                if (subsCount === 3) {
                    try {
                        expect(stream.branches().find(b => b.key === '1').subscriptions().length).to.eql(2);
                        expect(stream.branches().find(b => b.key === '1').subscriptions()[0].instance.application.includes(RUNNER)).to.be.true;
                        expect(stream.branches().find(b => b.key === '1').subscriptions()[1].instance.application.includes(RUNNER)).to.be.true;
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }
        }).then(str => {
            stream = str;
            myStreams.push(stream);
            const promiseSub1 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '1'
                }
            });
            const promiseSub2 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '1'
                }
            });
            const promiseSub3 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '3'
                }
            });

            Promise.all([promiseSub1, promiseSub2, promiseSub3]).catch(done);
        });
    });
});
