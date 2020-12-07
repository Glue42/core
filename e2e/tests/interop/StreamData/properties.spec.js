describe('properties', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('data', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.data.data).to.not.be.undefined;
                            done();
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

        it('Should contain the data from the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.data.data).to.eql('data');
                            done();
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
    });

    describe('private', () => {
        it('Should target the data to us only if true.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler: (sub) => {
                    sub.push({
                        data: 'data'
                    });
                }
            }).then((stream) => {
                myStreams.push(stream);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.private).to.be.true;
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });
            });
        });

        it('Should target the data to everyone only if false.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.private).to.be.false;
                            done();
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
    });

    describe('server', () => {
        it('Should not be undefined.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler: () => {
                    stream.subscriptions()[0].push({
                        data: 'data'
                    });
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.server.application).to.not.be.undefined;
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });
            });
        });

        it('Should contain the instance of the application publishing the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler: () => {
                    stream.subscriptions()[0].push({
                        data: 'data'
                    });
                }
            }).then((str) => {
                stream = str;
                myStreams.push(str);

                glue.interop.subscribe(methodDefinition).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.server.application.includes(RUNNER)).to.be.true;
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });
                });
            });
        });
    });

    describe('requestArguments', () => {
        it('Should contain the request arguments that were used to open the subscription.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            let stream;

            glue.interop.createStream(methodDefinition, {
                subscriptionAddedHandler: () => {
                    stream.subscriptions()[0].push({
                        data: 'data'
                    });
                }
            }).then((str) => {
                stream = str;
                myStreams.push(stream);

                glue.interop.subscribe(methodDefinition, {
                    arguments: {
                        test: '123'
                    }
                }).then(sub1 => {
                    sub1.onData((data) => {
                        try {
                            expect(data.requestArguments).to.be.eql({
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
    });
});
