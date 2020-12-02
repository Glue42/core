describe('properties', () => {
    let methodDefinition;
    let subDefinition;

    let glueApplicationOne;
    let glueApplicationTwo;
    let stream;
    let myStreams = [];

    let currentRequest;
    let shouldAcceptRequest = true;

    let requestHandlerCalled = false;
    let requestHandlerCallCount = 0;

    let currentSub;
    let currentRemovedSub;

    let subAddedHandlers = [];
    let subRemovedHandlers = [];

    const onSubscriptionRequest = (request) => {
        ++requestHandlerCallCount;
        requestHandlerCalled = true;
        currentRequest = request;

        if (request.arguments && request.arguments.reject) {
            request.reject();
            return;
        }

        if (shouldAcceptRequest) {
            request.accept();
            return;
        }

        request.reject();
    };

    const onSubscriptionAdded = (sub) => {
        currentSub = sub;

        if (sub.arguments && sub.arguments.closeMe) {
            sub.close();
            return;
        }

        subAddedHandlers.forEach(h => h(sub));
    };

    const onSubscriptionRemoved = (sub) => {
        currentRemovedSub = sub;
        subRemovedHandlers.forEach(h => h(sub));
    };

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        methodDefinition = {
            name: gtf.agm.getMethodName()
        };

        subDefinition = { ...methodDefinition };
        stream = await glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler: onSubscriptionRequest,
            subscriptionAddedHandler: onSubscriptionAdded,
            subscriptionRemovedHandler: onSubscriptionRemoved
        });
        myStreams.push(stream);

        [glueApplicationOne, glueApplicationTwo] = await Promise.all([gtf.createApp(), gtf.createApp()]);
    });

    afterEach(async () => {
        shouldAcceptRequest = true;
        requestHandlerCallCount = 0;
        requestHandlerCalled = false;
        subAddedHandlers = [];
        subRemovedHandlers = [];

        await Promise.all([glueApplicationOne.stop(), glueApplicationTwo.stop(), gtf.agm.unregisterMyStreams(myStreams)]);

        glueApplicationOne = null;
        glueApplicationTwo = null;
        myStreams = [];
    });

    describe('subscriptionRequestHandler()', () => {
        it('Should call request handler for every request', (done) => {
            const streamOptionsNoBranch = {};

            Promise.all([glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch),
            glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranch)
            ])
                .then(() => {
                    expect(requestHandlerCalled).to.eql(true);
                    expect(requestHandlerCallCount).to.eql(2);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('Request handler request object should contain all properties defined in the API', (done) => {
            const streamOptionsNoBranch = {};

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch)
                .then(() => {
                    expect(currentRequest.arguments).to.not.be.undefined;
                    expect(currentRequest.instance).to.not.be.undefined;
                    expect(typeof currentRequest.accept).to.eql('function');
                    expect(typeof currentRequest.acceptOnBranch).to.eql('function');
                    expect(typeof currentRequest.reject).to.eql('function');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('subscriptionAddedHandler()', () => {
        it('Should call subscription added handler for every added sub', (done) => {
            const calledSubs = [];

            const verify = () => {
                expect(calledSubs.length).to.eql(2);
                expect(calledSubs.some(sub => sub.instance.application === glueApplicationOne.agm.instance.application)).to.eql(true);
                expect(calledSubs.some(sub => sub.instance.application === glueApplicationTwo.agm.instance.application)).to.eql(true);
                done();
            };

            const ready = gtf.waitFor(2, verify);

            subAddedHandlers.push((sub) => {
                calledSubs.push(sub);
                ready();
            });

            const streamOptionsNoBranch = {};

            Promise.all([glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch),
            glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranch)
            ]);
        });

        it('Should not call subscription added handler when all subs are rejected', (done) => {
            shouldAcceptRequest = false;

            subAddedHandlers.push(() => {
                done('Should not have been called.');
            });

            const streamOptionsNoBranch = {};

            Promise.all([
                glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch),
                glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranch)
            ])
                .then(() => {
                    done('Should not have resolved.');
                })
                .catch(() => {
                    gtf.wait(3000, () => {
                        done();
                    });
                });
        });

        it('Should not call subscription added handler when one of the subs is rejected', (done) => {
            const calledSubs = [];

            subAddedHandlers.push((sub) => {
                calledSubs.push(sub);
            });

            const streamOptionsNoBranch = {};
            const streamOptionsNoBranchReject = {
                arguments: {
                    reject: true
                }
            };

            Promise.all([glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch),
            glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranchReject)
            ])
                .then(() => {
                    done('Should not have resolved');
                })
                .catch(() => {
                    gtf.wait(3000, () => {
                        try {

                            expect(calledSubs.length).to.eql(1);
                            expect(calledSubs[0].instance.application).to.eql(glueApplicationOne.agm.instance.application);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    }).catch(done);
                });
        });

        it('Subscription added handler sub object should contain all properties defined in the API', (done) => {
            const verify = () => {
                expect(currentSub).to.not.be.undefined;
                expect(typeof currentSub.push).to.eql('function');
                expect(typeof currentSub.close).to.eql('function');
                expect(currentSub.arguments).to.not.be.undefined;
                expect(currentSub.branchKey).to.not.be.undefined;
                expect(currentSub.instance).to.not.be.undefined;
                expect(currentSub.stream).to.not.be.undefined;
                done();
            };

            subAddedHandlers.push(() => {
                verify();
            });

            const streamOptionsNoBranch = {};

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch);
        });

        it('The stream should push immediately after accepting new sub in the sub added handler', (done) => {
            const pushedData = {
                test: 42
            };

            subAddedHandlers.push(() => {
                currentSub.push(pushedData);
            });

            const streamOptionsNoBranch = {};

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranch)
                .then((sub) => {
                    sub.onData((receivedData) => {
                        const {
                            data
                        } = receivedData;

                        expect(data.test).to.not.be.undefined;
                        expect(data).to.eql(pushedData);
                        done();
                    });
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('subscriptionRemovedHandler()', () => {
        it('Should Call removed handler for every removed sub', (done) => {
            const removedSubs = [];

            const verify = () => {
                expect(removedSubs.length).to.eql(2);
                expect(removedSubs.some(sub => sub.instance.application === glueApplicationOne.agm.instance.application)).to.eql(true);
                expect(removedSubs.some(sub => sub.instance.application === glueApplicationTwo.agm.instance.application)).to.eql(true);
                done();
            };

            const ready = gtf.waitFor(2, verify);

            subRemovedHandlers.push((sub) => {
                removedSubs.push(sub);
                ready();
            });

            const streamOptionsNoBranchCloseMe = {
                arguments: {
                    closeMe: true
                }
            };

            Promise.all([glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranchCloseMe),
            glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranchCloseMe)
            ])
                .then(() => {

                })
                .catch((err) => {
                    done(err);
                });
        });

        it('Subscription removed sub object should contain all properties defined in the API', (done) => {
            const verify = () => {
                expect(currentRemovedSub).to.not.be.undefined;
                expect(typeof currentRemovedSub.push).to.eql('function');
                expect(typeof currentRemovedSub.close).to.eql('function');
                expect(currentRemovedSub.arguments).to.not.be.undefined;
                expect(currentRemovedSub.branchKey).to.not.be.undefined;
                expect(currentRemovedSub.instance).to.not.be.undefined;
                expect(currentRemovedSub.stream).to.not.be.undefined;
                done();
            };

            subRemovedHandlers.push(() => {
                verify();
            });

            const streamOptionsNoBranchCloseMe = {
                arguments: {
                    closeMe: true
                }
            };

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsNoBranchCloseMe)
                .catch((err) => {
                    done(err);
                });
        });
    });
});
