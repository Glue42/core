describe('properties', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('requestArguments', () => {
        it('Should contain the arguments used to open the subscription.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    try {
                        expect(sub1.requestArguments).to.eql({
                            test: '123'
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });
    });

    describe('serverInstance', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    try {
                        expect(sub1.serverInstance).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('Should contain the instance of the application providing the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    try {
                        expect(sub1.serverInstance.application.includes(RUNNER)).to.be.true;
                        done();
                    } catch (err) {
                        done(err);
                    }
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

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    try {
                        expect(sub1.stream).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });

        it('Should contain the stream\'s definition.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    try {
                        expect(sub1.stream.name).to.eql(name);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });
        });
    });
});
