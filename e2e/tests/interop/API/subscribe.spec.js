describe('subscribe()', () => {
    let glueApplicationOne;
    let glueApplicationTwo;

    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        const promisesToAwait = [gtf.agm.unregisterMyStreams(myStreams), gtf.clearWindowActiveHooks()];

        if (glueApplicationOne) {
            promisesToAwait.push(glueApplicationOne.stop());
        }
        if (glueApplicationTwo) {
            promisesToAwait.push(glueApplicationTwo.stop());
        }
        glueApplicationOne = null;
        glueApplicationTwo = null;

        myStreams = [];

        await Promise.all(promisesToAwait);
    });

    describe('for single-server-stream', () => {
        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplicationOne = app;
            }));

        it('Should subscribe to a stream (string).', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };
            let stream;

            const streamCreatedPromise = gtf.agm.waitForMethodAdded(methodDefinition, glueApplicationOne.agm.instance.instance);

            glueApplicationOne.agm.createStream(methodDefinition).then((str) => {
                stream = str;

                return streamCreatedPromise;
            }).then(() => {
                glue.interop.subscribe(stream.name).then((subscription) => {
                    try {
                        expect(subscription.serverInstance.application).to.eql(glueApplicationOne.agm.instance.application);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('Should subscribe to a stream (methodDefinition).', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };
            let stream;

            const streamCreatedPromise = gtf.agm.waitForMethodAdded(methodDefinition, glueApplicationOne.agm.instance.instance);

            glueApplicationOne.agm.createStream(methodDefinition).then((str) => {
                stream = str;

                return streamCreatedPromise;
            }).then(() => {
                glue.interop.subscribe(stream).then((subscription) => {
                    try {
                        expect(subscription.serverInstance.application).to.eql(glueApplicationOne.agm.instance.application);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('Should trigger the provided on registration subscriptionAddedHandler.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };
            const subscriptionAddedHandler = () => done();

            const streamCreatedPromise = glueApplicationOne.agm.waitForMethodAdded(methodDefinition);

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler
            }).then((stream) => {
                myStreams.push(stream);

                return streamCreatedPromise;
            }).then(() => {
                glueApplicationOne.agm.subscribe(methodDefinition);
            });
        });

        it('Should trigger the provided on registration subscriptionRequestHandler.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };
            const subscriptionRequestHandler = (request) => {
                request.accept();
                done();
            };

            const streamCreatedPromise = glueApplicationOne.agm.waitForMethodAdded(methodDefinition);

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler
            }).then((stream) => {
                myStreams.push(stream);

                return streamCreatedPromise;
            }).then(() => {
                glueApplicationOne.agm.subscribe(name);
            });
        });

        it('Should resolve with the correct Subscription.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };
            let stream;

            const streamCreatedPromise = gtf.agm.waitForMethodAdded(methodDefinition, glueApplicationOne.agm.instance.instance);

            glueApplicationOne.agm.createStream(methodDefinition).then((str) => {
                stream = str;

                return streamCreatedPromise;
            }).then(() => {
                glue.interop.subscribe(stream.name).then((subscription) => {
                    try {
                        expect(subscription.serverInstance.application).to.eql(glueApplicationOne.agm.instance.application);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('Should take into account the waitTimeoutMs inside the SubscriptionParams.', (done) => {
            const name = 'non-existing-stream';
            const methodDefinition = {
                name
            };

            glue.interop.subscribe(methodDefinition, { waitTimeoutMs: 3000 })
                .then(() => {
                    done();
                })
                .catch(() => done('waitTimeoutMs wasn\'t taken into account.'));

            glueApplicationOne.agm.createStream(methodDefinition);
        });

        it('Should take into account the arguments inside the SubscriptionParams.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                try {
                    expect(request.arguments.password).to.eql(42);
                    request.accept();
                    done();
                } catch (err) {
                    done(err);
                }
            };

            const streamCreatedPromise = glueApplicationOne.agm.waitForMethodAdded(methodDefinition);

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler
            }).then((stream) => {
                myStreams.push(stream);

                return streamCreatedPromise;
            }).then(() => {
                glueApplicationOne.agm.subscribe(name, {
                    arguments: {
                        password: 42
                    }
                });
            });
        });

        it('Should take into account the target inside the SubscriptionParams.', async () => {
            let stream;
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            [glueApplicationTwo, stream] = await Promise.all([
                gtf.createApp(),
                glue.interop.createStream(methodDefinition),
                glueApplicationOne.agm.createStream(methodDefinition),
            ]);
            myStreams.push(stream);

            await gtf.agm.waitForMethodAdded(methodDefinition, glueApplicationOne.agm.instance.instance);
            const subscription = await glue.interop.subscribe(name, { target: glueApplicationOne.agm.instance });

            expect(subscription.serverInstance.application).to.eql(glueApplicationOne.agm.instance.application);
        });

        it('Should reject when the methodDefinition is undefined.', (done) => {
            glue.interop.subscribe(undefined).then(() => {
                done('Should not be called.');
            }).catch(() => done());
        });

        it('Should reject when the methodDefinition is undefined.', (done) => {
            glue.interop.subscribe({
                name: undefined
            }).then(() => {
                done('Should not be called.');
            }).catch(() => done());
        });

        it('Should reject when the arguments inside the SubscriptionParams is a string.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const streamCreatedPromise = gtf.agm.waitForMethodAdded(methodDefinition, glueApplicationOne.agm.instance.instance);

            glueApplicationOne.agm.createStream(methodDefinition).then(() => {
                return streamCreatedPromise;
            }).then(() => {
                glue.interop.subscribe(name, 'string').then(() => {
                    done('Should not be called.');
                }).catch(() => done());
            });
        });
    });
});
