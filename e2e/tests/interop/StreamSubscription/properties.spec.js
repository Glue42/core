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
        it('Should contain the arguments used to subscribe to the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].arguments).to.eql({
                            test: '123'
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).catch(done);
            });
        });
    });

    describe('branchKey', () => {
        it('Should contain the key of the subscription\'s branch.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].branchKey).to.eql('1');
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        reqBranchKey: '1'
                    }
                }).catch(done);
            });
        });
    });

    describe('instance', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].instance).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        reqBranchKey: '1'
                    }
                }).catch(done);
            });
        });

        it('Should contain the instance of the subscriber.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].instance.application.includes(RUNNER)).to.be.true;
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        reqBranchKey: '1'
                    }
                }).then(() => {

                });
            });
        });
    });

    describe('stream', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].stream).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        reqBranchKey: '1'
                    }
                }).catch(done);
            });
        });

        it('Should contain the stream this subscription is for.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    try {
                        expect(stream.subscriptions()[0].stream.name).to.eql(name);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        reqBranchKey: '1'
                    }
                }).catch(done);
            });
        });
    });
});
