describe('properties', () => {
    let methodDefinition;
    let subDefinition;

    let glueApplication;
    let myStreams = [];
    let stream;

    const onSubscriptionRequest = (request) => {
        if (request.arguments.branch) {
            request.acceptOnBranch(request.arguments.branch);
            return;
        }

        request.accept();
    };

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        methodDefinition = {
            name: gtf.agm.getMethodName()
        };
        subDefinition = { ...methodDefinition };
        const str = await glue.interop.createStream(methodDefinition,
            {
                subscriptionRequestHandler: onSubscriptionRequest
            });

        myStreams.push(str);
        stream = str;
    });

    afterEach(async () => {
        if (glueApplication) {
            await glueApplication.stop();
            glueApplication = null;
        }

        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('key', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.acceptOnBranch(request.arguments.reqBranchKey);
            };

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
            }).then(stream => {
                myStreams.push(stream);
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

                Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(() => {
                    try {
                        stream.branches().forEach(b => {
                            expect(b.key).to.not.be.undefined;
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('A branch should have all properties defined in the API', async () => {
            const streamOptionsBranchA = {
                arguments: {
                    branch: 'branchA'
                }
            };

            glueApplication = await gtf.createApp();

            await glueApplication.agm.subscribe(subDefinition, streamOptionsBranchA);

            const branch = stream.branches()[0];

            expect(branch.key).to.not.be.undefined;
            expect(typeof branch.close).to.eql('function');
            expect(typeof branch.push).to.eql('function');
            expect(typeof branch.subscriptions).to.eql('function');
        });
    });
});
