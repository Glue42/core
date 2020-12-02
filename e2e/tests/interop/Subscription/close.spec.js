describe('close()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('handlers', () => {
        it('Should call the subscription\'s stream\'s subscriptionRemovedHandler.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRemovedHandler = () => done();

            glue.interop.createStream(methodDefinition, {
                subscriptionRemovedHandler,
            }).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.close();
                });
            });
        });

        it('Should call subscription\'s onClose() on subscription self-close.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition)
                .then((stream) => {
                    myStreams.push(stream);
                    return glue.interop.subscribe(methodDefinition);
                })
                .then(sub1 => {
                    sub1.onClosed(() => done());
                    sub1.close();
                })
                .catch(done);
        });

        it('Should remove the subscription from the stream\'s subscriber list.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRemovedHandler = (streamSub) => {
                try {
                    expect(streamSub.stream.subscriptions.length).to.eql(0);
                    done();
                } catch (error) {
                    done(error);
                }
            };

            glue.interop.createStream(methodDefinition, { subscriptionRemovedHandler })
                .then((stream) => {
                    myStreams.push(stream);
                    return glue.interop.subscribe(methodDefinition);
                })
                .then(sub1 => {
                    sub1.close();
                })
                .catch(done);
        });
    });
});
