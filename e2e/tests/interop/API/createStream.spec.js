describe('createStream()', () => {
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

    it('Should create a stream.', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        const agmStream = glue.interop.methods({ name });

        expect(stream).to.not.be.undefined;
        expect(agmStream).to.not.be.undefined;
        expect(typeof stream.definition).to.equal('object');
        expect(typeof stream.name).to.equal('string');
        expect(typeof stream.push).to.equal('function');
        expect(typeof stream.close).to.equal('function');
        expect(typeof stream.branches).to.equal('function');
        expect(typeof stream.subscriptions).to.equal('function');
    });

    it('Should create a stream with correct accepts when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const accepts = 'String test';
        const methodDefinition = {
            name,
            accepts
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).accepts).to.eql(accepts);
    });

    it('Should create a stream with correct description when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const description = 'Random description.';
        const methodDefinition = {
            name,
            description
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).description).to.eql(description);
    });

    it('Should create a stream with correct display name when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const displayName = 'Display Name';
        const methodDefinition = {
            name,
            displayName
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).displayName).to.eql(displayName);
    });

    it('Should create a stream with correct name when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).name).to.eql(name);
    });

    it('Should create a stream with correct objectTypes when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const objectTypes = ['Object type 1', 'Object type 2'];

        const methodDefinition = {
            name,
            objectTypes
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).objectTypes[0]).to.eql('Object type 1');
        expect(glue.interop.methods().find(m => m.name === name).objectTypes[1]).to.eql('Object type 2');
    });

    it('Should create a stream with correct returns when provided (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const returns = 'String test1, String test2';
        const methodDefinition = {
            name,
            returns
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).returns).to.eql(returns);
    });

    it('Should create a stream that has supportsStreaming true inside of it\'s definition property.', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(glue.interop.methods().find(m => m.name === name).supportsStreaming).to.be.true;
    });

    it('Should create a stream with a working subscriptionAddedHandler (streamOptions).', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionAddedHandler: () => done()
        }).then((stream) => {
            myStreams.push(stream);

            glueApplication.agm.subscribe(name);
        }).catch(done);
    });

    it('Should create a stream with a working subscriptionRemovedHandler (streamOptions).', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRemovedHandler: () => done()
        }).then((stream) => {
            myStreams.push(stream);

            return glueApplication.agm.subscribe(name);
        }).then(() => {
            glueApplication.agm.unsubscribe(name);
        }).catch(done);
    });

    it('Should create a stream with a working subscriptionRequestHandler (streamOptions).', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition, {
            subscriptionRequestHandler: (request) => {
                expect(typeof request.instance).to.equal('object');
                expect(typeof request.accept).to.equal('function');
                expect(typeof request.acceptOnBranch).to.equal('function');
                expect(typeof request.reject).to.equal('function');

                done();
            }
        }).then((stream) => {
            myStreams.push(stream);

            glueApplication.agm.subscribe(name);
        }).catch(done);
    });

    it('Should invoke the callback with the correct stream (string).', (done) => {
        const name = gtf.agm.getMethodName();

        glue.interop.createStream(name, {}, (stream) => {
            myStreams.push(stream);

            try {
                expect(stream.definition.name).to.equal(name);
                expect(stream.name).to.equal(name);
                expect(stream.definition.supportsStreaming).to.be.true;

                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('Should invoke the callback with the correct stream (methodDefinition).', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition, {}, (stream) => {
            myStreams.push(stream);

            try {
                expect(stream.definition.name).to.equal(name);
                expect(stream.name).to.equal(name);
                expect(stream.definition.supportsStreaming).to.be.true;

                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('Should resolve with the correct stream (string).', async () => {
        const name = gtf.agm.getMethodName();

        const stream = await glue.interop.createStream(name);
        myStreams.push(stream);

        expect(stream.definition.name).to.equal(name);
        expect(stream.name).to.equal(name);
        expect(stream.definition.supportsStreaming).to.be.true;
    });

    it('Should resolve with the correct stream (methodDefinition).', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(stream.definition.name).to.eql(name);
        expect(stream.name).to.eql(name);
        expect(stream.definition.supportsStreaming).to.be.true;
    });

    it('Should return a stream that has 0 branches.', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(stream.branches().length).to.equal(0);
    });

    it('Should return a stream that has 0 subscriptions.', async () => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        const stream = await glue.interop.createStream(methodDefinition);
        myStreams.push(stream);

        expect(stream.subscriptions.length).to.eql(0);
    });

    it('Should invoke the error handler when the method/methodDefinition is undefined.', (done) => {
        glue.interop.createStream(undefined, {}, () => done('Should not be called.'), () => done());
    });

    it('Should reject when the method/methodDefinition is undefined.', (done) => {
        glue.interop.createStream(undefined)
            .then(() => done('Should not be called.'))
            .catch(() => done());
    });

    it('Should invoke the error handler when the name inside the MethodDefinition is undefined.', (done) => {
        const methodDefinition = {
            name: undefined
        };

        glue.interop.createStream(methodDefinition, {}, () => done('Should not be called.'), () => done());
    });

    it('Should reject when the name inside the MethodDefinition is undefined.', (done) => {
        const methodDefinition = {
            name: undefined
        };

        glue.interop.createStream(methodDefinition).then(() => done('Should not be called.')).catch(() => done());
    });

    it('Should invoke the error handler when a stream with the same name (string) is already present.', (done) => {
        const name = gtf.agm.getMethodName();

        glue.interop.createStream(name, {}, (stream) => {
            myStreams.push(stream);

            glue.interop.createStream(name, {}, () => done('Should not be called.'), () => done());
        });
    });

    it('Should reject when a stream with the same name (string) is already present.', (done) => {
        const name = gtf.agm.getMethodName();

        glue.interop.createStream(name)
            .then((stream) => {
                myStreams.push(stream);

                return glue.interop.createStream(name);
            })
            .then(() => done('Should not be called.'))
            .catch(() => done());
    });

    it('Should invoke the error handler when a stream with the same MethodDefinition is already present.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition, {}, (stream) => {
            myStreams.push(stream);

            glue.interop.createStream(methodDefinition, {}, () => done('Should not be called.'), () => done());
        });
    });

    it('Should reject when a stream with the same MethodDefinition is already present.', (done) => {
        const name = gtf.agm.getMethodName();
        const methodDefinition = {
            name
        };

        glue.interop.createStream(methodDefinition)
            .then((stream) => {
                myStreams.push(stream);

                return glue.interop.createStream(methodDefinition);
            })
            .then(() => done('Should not be called.'))
            .catch(() => done());
    });
});
