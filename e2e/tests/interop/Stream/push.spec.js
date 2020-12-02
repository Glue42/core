describe('push()', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('for single-server', () => {
        it('Should push data to all subscribers of the stream.', (done) => {
            let subOneCalled = false,
                subTwoCalled = false,
                subThreeCalled = false;
            const ready = gtf.waitFor(3, () => {
                if (subOneCalled && subTwoCalled && subThreeCalled) {
                    done();
                } else {
                    done('A subscriber was called more than once !');
                }
            });

            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                const promiseSub1 = glue.interop.subscribe(methodDefinition);
                const promiseSub2 = glue.interop.subscribe(methodDefinition);
                const promiseSub3 = glue.interop.subscribe(methodDefinition);

                Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(([sub1, sub2, sub3]) => {
                    sub1.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            subOneCalled = true;
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });
                    sub2.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            subTwoCalled = true;
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });
                    sub3.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            subThreeCalled = true;
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });

                    stream.push({
                        data: 'data'
                    });
                });
            });
        });

        it('Should push data to the specified branch\'s subscribers of the stream.', (done) => {
            const ready = gtf.waitFor(3, done);

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

                Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(([sub1, sub2, sub3]) => {
                    sub1.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });
                    sub2.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });
                    sub3.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            ready();
                        } catch (err) {
                            done(err);
                        }
                    });

                    stream.push({
                        data: 'data'
                    });
                });
            });
        });

        it('Should throw an error when data is a string.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            const subscriptionRequestHandler = (request) => {
                request.accept();
            };

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
            }).then((stream) => {
                myStreams.push(stream);
                const promiseSub1 = glue.interop.subscribe(methodDefinition);
                const promiseSub2 = glue.interop.subscribe(methodDefinition);
                const promiseSub3 = glue.interop.subscribe(methodDefinition);

                Promise.all([promiseSub1, promiseSub2, promiseSub3]).then(() => {
                    try {
                        stream.push('data');
                    } catch (err) {
                        done();
                    }
                });
            });
        });
    });
});
