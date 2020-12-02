describe('push()', () => {
    let myStreams = [];
    let methodDefinition;
    let subDefinition;

    let glueApplicationOne;
    let glueApplicationTwo;
    let stream;

    const onSubscriptionRequest = (request) => {
        if (request.arguments.branch) {
            request.acceptOnBranch(request.arguments.branch);
            return;
        }

        request.accept();
    };

    let onAddedCheck;
    let onSubsEnough;

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        methodDefinition = {
            name: gtf.agm.getMethodName()
        };
        subDefinition = { ...methodDefinition };

        [glueApplicationOne, glueApplicationTwo, stream] = await Promise.all([
            gtf.createApp(),
            gtf.createApp(),
            glue.interop.createStream(methodDefinition,
                {
                    subscriptionRequestHandler: onSubscriptionRequest,
                    subscriptionAddedHandler: () => {
                        if (onAddedCheck) {
                            onAddedCheck();
                        }
                        if (onSubsEnough) {
                            onSubsEnough();
                        }
                    }
                })
        ]);
        myStreams.push(stream);

        onAddedCheck = null;
    });

    afterEach(async () => {
        await Promise.all([glueApplicationOne.stop(), glueApplicationTwo.stop(), gtf.agm.unregisterMyStreams(myStreams)])
        glueApplicationOne = null;
        glueApplicationTwo = null;

        myStreams = [];
    });

    it('The server should keep correct list of branches and subscriptions', (done) => {
        const streamOptionsBranch = {
            arguments: {
                branch: 'branchA'
            }
        };

        const streamOptionsNoBranch = {};

        Promise.all([
            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsBranch),
            glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsNoBranch)
        ]).then(() => {
            expect(stream.branches().length).to.be.equal(2);
            expect(stream.branches().some(b => b.key === 'branchA')).to.be.equal(true);
            expect(stream.branches().some(b => b.key === '')).to.be.equal(true);
            expect(stream.subscriptions().length).to.be.equal(2);
            done();
        }).catch(done);
    });

    it('The server should push data to all subscribers', (done) => {
        let subOneCalled = false, subTwoCalled = false;

        const ready = gtf.waitFor(2, () => {
            if (subOneCalled && subTwoCalled) {
                done();
            } else {
                done('One of the two subscribers was called twice');
            }
        });

        const sentData = {
            test: 42
        };

        const validateData = (args) => {
            expect(args.data).to.eql(sentData);
            ready();
        };

        Promise.all([
            glueApplicationOne.agm.subscribe(subDefinition, {}),
            glueApplicationTwo.agm.subscribe(subDefinition, {})
        ]).then(([sub1, sub2]) => {
            sub1.onData((data) => {
                subOneCalled = true;
                validateData(data);
            });
            sub2.onData((data) => {
                subTwoCalled = true;
                validateData(data);
            });

            stream.push(sentData);
        });
    });

    it('The server should push to specific subscribers', (done) => {
        const sentData = {
            test: 42
        };

        const streamOptionsShouldReceiveData = {
            arguments: {
                sendData: 'please'
            }
        };

        const act = () => stream.subscriptions()
            .filter(s => s.arguments.sendData)
            .forEach((s) => {
                s.push(sentData);
            });

        Promise.all([
            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsShouldReceiveData),
            glueApplicationTwo.agm.subscribe(subDefinition, {})
        ]).then(([sub1, sub2]) => {
            let callCount = 0;

            sub1.onData((args) => {
                expect(args.data).to.eql(sentData);
                callCount++;
            });

            sub2.onData(() => callCount++);

            setTimeout(() => {
                if (callCount === 1) {
                    done();
                } else if (callCount === 2) {
                    done('Pushed to all subscribers when trying only a specific !');
                } else if (callCount === 0) {
                    done('Didn\'t push to any subsciber');
                }
            }, 2000);

            act();
        });
    });

    it('The server stream should have all properties defined in the API', (done) => {
        expect(stream.definition).to.not.be.undefined;
        expect(stream.name).to.not.be.undefined;
        expect(typeof stream.branches).to.eql('function');
        expect(typeof stream.close).to.eql('function');
        expect(typeof stream.push).to.eql('function');
        expect(typeof stream.subscriptions).to.eql('function');
        done();
    });

    it('Should push data to this subscription only.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name,
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        let subsCount = 0;
        let onSubsEnough;

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
            subscriptionAddedHandler: () => {
                ++subsCount;
                if (onSubsEnough) {
                    onSubsEnough();
                }
            }
        }).then(stream => {
            const promiseSub1 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '1'
                }
            });
            const promiseSub2 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '2'
                }
            });
            const promiseSub3 = glue.interop.subscribe(methodDefinition, {
                arguments: {
                    reqBranchKey: '3'
                }
            });

            const act = () => stream.subscriptions().find(s => s.branchKey === '1').push({
                data: 'data'
            });

            Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(([sub1, sub2, sub3]) => {
                sub1.onData((data) => {
                    try {
                        expect(data.data.data).to.eql('data');
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                sub2.onData(() => {
                    done('Should not receive data.');
                });
                sub3.onData(() => {
                    done('Should not receive data.');
                });

                if (subsCount === 3) {
                    act();
                } else {
                    onSubsEnough = act;
                }

            });
        });
    });
});
