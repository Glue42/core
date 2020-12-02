describe('push()', () => {
    let glueApplicationOne;
    let glueApplicationTwo;
    let glueApplicationThree;
    let methodDefinition;
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        const promisesToAwait = [await gtf.agm.unregisterMyStreams(myStreams)];

        if (glueApplicationOne) {
            promisesToAwait.push(glueApplicationOne.stop());
        }
        if (glueApplicationTwo) {
            promisesToAwait.push(glueApplicationTwo.stop());
        }
        if (glueApplicationThree) {
            promisesToAwait.push(glueApplicationThree.stop());
        }

        glueApplicationOne = null;
        glueApplicationTwo = null;
        glueApplicationThree = null;

        await Promise.all(promisesToAwait);

        myStreams = [];
    });

    describe('for single-server streams', () => {
        let subDefinition;
        let stream;

        const subscriptionRequestHandler = (request) => {
            if (request.arguments.branch) {
                request.acceptOnBranch(request.arguments.branch);
                return;
            }

            request.accept();
        };

        beforeEach(async () => {
            methodDefinition = {
                name: gtf.agm.getMethodName()
            };
            subDefinition = { ...methodDefinition };

            [glueApplicationOne, glueApplicationTwo, glueApplicationThree, stream] = await Promise.all([
                gtf.createApp(),
                gtf.createApp(),
                gtf.createApp(),
                glue.interop.createStream(methodDefinition, { subscriptionRequestHandler })
            ]);

            myStreams.push(stream);
        });

        it('A subscriber on a branch should receive data pushed on that branch', (done) => {
            const ready = gtf.waitFor(2, done);
            const branchAData = {
                test: 42
            };

            const branchBData = {
                test: 24
            };

            const streamOptionsBranchA = {
                arguments: {
                    branch: 'branchA'
                }
            };

            const streamOptionsBranchB = {
                arguments: {
                    branch: 'branchB'
                }
            };

            const validateData = (data) => {
                if (data.requestArguments.branch === 'branchA') {
                    expect(data.data).to.eql(branchAData);
                    ready();
                }

                if (data.requestArguments.branch === 'branchB') {
                    expect(data.data).to.eql(branchBData);
                    ready();
                }
            };

            Promise.all([
                glueApplicationOne.agm.subscribe(subDefinition, streamOptionsBranchA),
                glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsBranchB)
            ]).then((subs) => {
                subs.forEach(s => s.onData(validateData));

                stream.push(branchAData, ['branchA']);
                stream.push(branchBData, ['branchB']);
            }).catch((err) => {
                done(err);
            });
        });

        it('A subscriber on a branch should not receive data pushed on another branch', (done) => {
            const branchBData = {
                test: 24
            };

            const streamOptionsBranchA = {
                arguments: {
                    branch: 'branchA'
                }
            };

            const validateData = () => {
                done('Should not have received any data');
            };

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsBranchA)
                .then((sub) => {
                    sub.onData(validateData);

                    stream.push(branchBData, ['branchB']);

                    gtf.wait(1000, () => {
                        done();
                    });
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber on a branch should receive public (non-branch) data', (done) => {
            const publicData = {
                test: 24
            };

            const streamOptionsBranchA = {
                arguments: {
                    branch: 'branchA'
                }
            };

            const validateData = (data) => {
                expect(data.data).to.eql(publicData);
                done();
            };

            glueApplicationOne.agm.subscribe(subDefinition, streamOptionsBranchA)
                .then((sub) => {
                    sub.onData(validateData);

                    stream.push(publicData);
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('Pushing an object on a branch should go to all subscribers on that branch', (done) => {
            const ready = gtf.waitFor(2, done);
            const branchAData = {
                test: 42
            };

            const streamOptionsBranchA = {
                arguments: {
                    branch: 'branchA'
                }
            };

            const validateData = (data) => {
                if (data.requestArguments.branch === 'branchA') {
                    expect(data.data).to.eql(branchAData);
                    ready();
                }
            };

            Promise.all([
                glueApplicationOne.agm.subscribe(subDefinition, streamOptionsBranchA),
                glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsBranchA)
            ]).then(([sub1, sub2]) => {
                sub1.onData(validateData);
                sub2.onData(validateData);

                stream.push(branchAData, ['branchA']);
            });
        });

        it('Should push data to that branch only.', (done) => {
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

                    stream.branches().find(b => b.key === '1').push({
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
                        stream.branches().find(b => b.key === '1').push('string');
                    } catch (err) {
                        done();
                    }
                });
            });
        });

        it('Should not push to the subscriber which is on the main branch, when pushing to a specific branch', (done) => {
            const newMD = { name: gtf.agm.getMethodName() };

            const handlers = {
                subscriptionRequestHandler: (req) => {
                    if (req.arguments.branchKey) {
                        req.acceptOnBranch(req.arguments.branchKey);
                    } else {
                        req.accept();
                    }
                },
            };

            let stream;
            glue.interop.createStream(newMD, handlers)
                .then(s => {
                    stream = s;
                    myStreams.push(s);
                    return Promise.all([
                        glueApplicationOne.agm.subscribe(newMD),
                        glueApplicationTwo.agm.subscribe(newMD, { arguments: { branchKey: 'two' } }),
                    ]);
                })
                .then(([sub1, sub2]) => {
                    const ready = gtf.waitFor(2, () => done());
                    const fail = () => done('pushed to a wrong branch');

                    sub1.onData(fail);
                    sub2.onData(ready);

                    stream.push({ glue42: 'isAwesome' }, 'two');

                    gtf.wait(3000, ready);
                })
                .catch(done);
        });

        it('Should push only to the branches supplied in the branch array [existing, existing] branches', (done) => {
            const newMD = { name: gtf.agm.getMethodName() };

            const handlers = {
                subscriptionRequestHandler: (req) => {
                    req.acceptOnBranch(req.arguments.branchKey);
                },
            };

            let stream;
            glue.interop.createStream(newMD, handlers)
                .then(s => {
                    stream = s;
                    myStreams.push(s);
                    return Promise.all([
                        glueApplicationOne.agm.subscribe(newMD, { arguments: { branchKey: 'one' } }),
                        glueApplicationTwo.agm.subscribe(newMD, { arguments: { branchKey: 'two' } }),
                        glueApplicationThree.agm.subscribe(newMD, { arguments: { branchKey: 'nope' } }),
                    ]);
                })
                .then(([sub1, sub2, sub3]) => {
                    const ready = gtf.waitFor(3, () => done());

                    const fail = () => done('pushed to a wrong branch');

                    sub1.onData(ready);
                    sub2.onData(ready);
                    sub3.onData(fail);

                    stream.push({ tick42: 'eats' }, ['one', 'two']);

                    gtf.wait(3000, ready);
                });
        });

        it('Should push only to the branches supplied in the branch array [nonExisting, existing] branches', (done) => {
            const newMD = { name: gtf.agm.getMethodName() };

            const handlers = {
                subscriptionRequestHandler: (req) => {
                    req.acceptOnBranch(req.arguments.branchKey);
                },
            };

            let stream;
            glue.interop.createStream(newMD, handlers)
                .then(s => {
                    stream = s;
                    myStreams.push(s);
                    return Promise.all([
                        glueApplicationOne.agm.subscribe(newMD, { arguments: { branchKey: 'one' } }),
                        glueApplicationTwo.agm.subscribe(newMD, { arguments: { branchKey: 'two' } }),
                        glueApplicationThree.agm.subscribe(newMD, { arguments: { branchKey: 'nope' } }),
                    ]);
                })
                .then(([sub1, sub2, sub3]) => {
                    const ready = gtf.waitFor(2, () => done());

                    const fail = () => done('pushed to a wrong branch');

                    sub1.onData(ready);
                    sub2.onData(fail);
                    sub3.onData(fail);

                    stream.push({ tick42: 'eats' }, ['one', 'WRONG']);

                    gtf.wait(3000, ready);

                })
                .catch(done);
        });
    });

    describe('for multi-server streams', () => {
        beforeEach(async () => {
            methodDefinition = { name: gtf.agm.getMethodName() };

            [glueApplicationOne, glueApplicationTwo, glueApplicationThree] = await Promise.all([
                gtf.createApp(),
                gtf.createApp(),
                gtf.createApp()
            ]);
        });

        it('Should call onData for every server push on a single sub', (done) => {
            let stream1, stream2;
            Promise.all([glueApplicationOne.agm.createStream(methodDefinition), glueApplicationTwo.agm.createStream(methodDefinition)])
                .then(([s1, s2]) => {
                    stream1 = s1;
                    stream2 = s2;

                    return glue.interop.subscribe(methodDefinition, { arguments: { branchKey: 'one' }, target: 'all' });
                })
                .then((sub) => {
                    const ready = gtf.waitFor(2, () => done());

                    sub.onData(() => {
                        ready();
                    });

                    stream1.push({ glue42: 'agmRocks' }, 'one');
                    stream2.push({ glue42: 'rocks' }, 'one');
                });
        });

        it('Should push data to the specified branch\'s subscribers of all streams [contains, contains] which contain this branch.', (done) => {
            let stream1, stream2;
            Promise.all([glueApplicationOne.agm.createStream(methodDefinition), glueApplicationTwo.agm.createStream(methodDefinition)])
                .then(([s1, s2]) => {
                    stream1 = s1;
                    stream2 = s2;

                    return Promise.all([
                        glue.interop.subscribe(methodDefinition, { arguments: { branchKey: 'one' }, target: 'all' }),
                        glue.interop.subscribe(methodDefinition, {
                            arguments: { branchKey: 'two' },
                            target: 'all'
                        }),
                    ]);
                })
                .then(([sub1, sub2]) => {
                    const ready = gtf.waitFor(4, () => {
                        if (callCount1 === 2 && callCount2 === 2) {
                            done();
                        } else {
                            done(`Some were called more than others: 1 = ${callCount1}, 2 = ${callCount2}`);
                        }
                    });

                    let callCount1 = 0, callCount2 = 0;
                    sub1.onData(() => {
                        callCount1++;
                        ready();
                    });

                    sub2.onData(() => {
                        callCount2++;
                        ready();
                    });

                    stream1.push({ glue42: 'agmRocks' }, ['one', 'two']);
                    stream2.push({ glue42: 'rocks' }, ['one', 'two']);
                });
        });
    });
});
