describe('properties', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('arguments', () => {
        it('Should contain the arguments passed with the subscription request.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                try {
                    request.accept();
                    expect(request.arguments).to.eql({
                        test: '123'
                    });
                    done();
                } catch (err) {
                    done(err);
                }
            };

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
            }).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                });
            });
        });
    });

    describe('instance', () => {
        it('Should contain the instance of the application that wants to subscribe to the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                try {
                    request.accept();
                    expect(request.instance.application.includes(RUNNER)).to.be.true;
                    done();
                } catch (err) {
                    done(err);
                }
            };

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
            }).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                });
            });
        });
    });
});
