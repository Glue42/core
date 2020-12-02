describe('branches()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should return an empty array when there are no stream branches.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition).then((stream) => {
            myStreams.push(stream);
            try {
                expect(stream.branches().length).to.eql(0);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('Should return all available when no key is specified.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
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
                    expect(stream.branches().length).to.eql(3);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    it('Should return the corresponding branch when a key is specified and the branch exists.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
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
                    expect(stream.branches('1').key).to.eql('1');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    it('Should return null when a key is specified and the branch does not exist.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const subscriptionRequestHandler = (request) => {
            request.acceptOnBranch(request.arguments.reqBranchKey);
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler,
        }).then((stream) => {
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
                    expect(stream.branches('4')).to.be.undefined;
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});
