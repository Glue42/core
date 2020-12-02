describe('acceptOnBranch()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should accept the request.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        let stream;

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch('1');
        };

        const subscriptionAddedHandler = () => {
            try {
                expect(stream.subscriptions()[0].branchKey).to.eql('1');
                done();
            } catch (err) {
                done(err);
            }
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionAddedHandler,
            subscriptionRequestHandler,
        }).then(s => {
            stream = s;
            myStreams.push(s);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            });
        });
    });
});
