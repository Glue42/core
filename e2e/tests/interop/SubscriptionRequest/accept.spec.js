describe('accept()', () => {
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
            request.accept();
        };

        const subscriptionAddedHandler = () => {
            try {
                expect(stream.subscriptions()[0]).to.not.be.undefined;
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
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            });
        });
    });
});
