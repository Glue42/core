describe('reject()', function () {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should reject the request.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRequestHandler = (request) => {
            request.reject();
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            }).then(() => done('The subscription should not be accepted.')).catch(() => done());
        });
    });
});
