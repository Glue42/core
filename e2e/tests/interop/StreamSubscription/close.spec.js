describe('close()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should close the subscription.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        let streamHeard = false;
        let onStreamHeard;

        glue.interop.createStream(methodDefinition, {
            subscriptionAddedHandler: () => {
                streamHeard = true;
                if (onStreamHeard) {
                    onStreamHeard();
                }
            }
        }).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            }).then(sub1 => {
                sub1.onClosed(() => done());

                if (streamHeard) {
                    stream.subscriptions()[0].close();
                } else {
                    onStreamHeard = () => stream.subscriptions()[0].close();
                }

            });
        }).catch(done);
    });

    it('Should not close the stream.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        let streamHeard = false;
        let onStreamHeard;

        glue.interop.createStream(methodDefinition, {
            subscriptionAddedHandler: () => {
                streamHeard = true;
                if (onStreamHeard) {
                    onStreamHeard();
                }
            }
        }).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            }).then(sub1 => {
                sub1.onClosed(() => {
                    try {
                        expect(glue.interop.methods().find(s => s.name === name)).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                if (streamHeard) {
                    stream.subscriptions()[0].close();
                } else {
                    onStreamHeard = () => stream.subscriptions()[0].close();
                }
            }).catch(done);
        });
    });

    it('Should trigger the provided on registration subscriptionRemovedHandler.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRemovedHandler = () => done();

        let streamHeard = false;
        let onStreamHeard;

        glue.interop.createStream(methodDefinition, {
            subscriptionRemovedHandler,
            subscriptionAddedHandler: () => {
                streamHeard = true;
                if (onStreamHeard) {
                    onStreamHeard();
                }
            }
        }).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition, {
                arguments: {
                    test: '123'
                }
            }).then(() => {
                if (streamHeard) {
                    stream.subscriptions()[0].close();
                } else {
                    onStreamHeard = () => stream.subscriptions()[0].close();
                }
            }).catch(done);
        });
    });
});
