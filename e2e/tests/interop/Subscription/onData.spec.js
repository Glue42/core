describe('onData()', () => {
    let glueApplication;
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        glueApplication = await gtf.createApp();
    });

    afterEach(async () => {
        await glueApplication.stop();
        glueApplication = null;

        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    it('Should be triggered when data is received.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition).then(sub1 => {
                sub1.onData(() => done());

                stream.push({
                    test: 123
                });
            });
        });
    });

    it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
        const timeout = gtf.wait(3000, () => done());
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition).then(sub1 => {
                sub1.onData(() => {
                    timeout.cancel();
                    done('Should not be triggered.');
                });
            });
        });
    });

    it('Should be triggered with the correct StreamData.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition).then((stream) => {
            myStreams.push(stream);
            glue.interop.subscribe(methodDefinition).then(sub1 => {
                sub1.onData((data) => {
                    try {
                        expect(data.data).to.eql({
                            test: 123
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                stream.push({
                    test: 123
                });
            });
        });
    });

    it('Should replay all data pushed in subscriptionRequestHandler', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const dataArray = [false, false, false, false];

        const stream = await glue.interop.createStream(methodDefinition,
            {
                subscriptionRequestHandler: (request) => {
                    request.accept();

                    dataArray.forEach((_, index) => stream.push({ index }));
                }
            }
        );
        myStreams.push(stream);

        const subscription = await glueApplication.agm.subscribe(methodDefinition);

        subscription.onData((args) => {
            dataArray[args.data.index] = true;
        });

        await gtf.wait(500);

        expect(dataArray.every(v => v)).to.be.true;
    });
});
