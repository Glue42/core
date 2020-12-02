describe('serverMethodRemoved()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
    });

    describe('Registering with full method options', () => {
        let myStreams = [];

        const expectedProperties = [
            'accepts',
            'description',
            'displayName',
            'getServers',
            'name',
            'objectTypes',
            'returns',
            'supportsStreaming',
        ];

        const fullMethodOptions = {
            objectTypes: ['otherApp'],
            description: 'same description',
            displayName: 'awesome display name',
            accepts: 'String name',
            returns: 'String name'
        };

        const checkMethodDefinition = (method, isStream) => {
            const shouldSupportStreaming = isStream ? isStream : false;

            for (let prop of expectedProperties) {

                if (method.hasOwnProperty(prop)) {
                    if (prop === 'supportsStreaming') {
                        expect(method[prop]).to.be.a('Boolean');
                        expect(method[prop]).to.eql(shouldSupportStreaming);
                        continue;
                    }
                    if (prop === 'getServers') {
                        expect(method[prop]).to.be.a('Function');
                        continue;
                    }

                    expect(method[prop]).to.eql(fullMethodOptions[prop]);
                    continue;
                }
                throw new Error(`${method.name} is missing property ${prop}`);
            }
        };

        beforeEach(() => {
            fullMethodOptions.name = gtf.agm.getMethodName();
        });

        afterEach(async () => {
            await gtf.agm.unregisterMyStreams(myStreams);

            myStreams = [];
        });

        it('ServerMethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    const m = glue.interop.methods().find(x => x.name === fullMethodOptions.name);
                    glue.interop.unregister(m);
                }
            });

            const unTwo = glue.interop.serverMethodRemoved(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.interop.registerAsync(fullMethodOptions, () => { });
        });

        it('ServerMethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.interop.serverMethodRemoved(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method, true);
                        unTwo();
                        ready();
                    } catch (error) {
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.interop.createStream(fullMethodOptions)
                .then((stream) => {
                    stream.close();
                    ready();
                })
                .catch(done);
        });
    });

    describe('Registering with only name', () => {
        let myStreams = [];
        let methodName;

        const expectedProperties = [
            'accepts',
            'description',
            'displayName',
            'getServers',
            'name',
            'objectTypes',
            'returns',
            'supportsStreaming',
        ];

        const checkMethodDefinition = (method, isStream) => {
            const shouldSupportStreaming = isStream ? isStream : false;

            for (let prop of expectedProperties) {

                if (method.hasOwnProperty(prop)) {
                    if (prop === 'supportsStreaming') {
                        expect(method[prop]).to.be.a('Boolean');
                        expect(method[prop]).to.eql(shouldSupportStreaming);
                        continue;
                    }
                    if (prop === 'getServers') {
                        expect(method[prop]).to.be.a('Function');
                        continue;
                    }
                    if (prop === 'name') {
                        expect(method[prop]).to.eql(methodName);
                        continue;
                    }
                    continue;
                }
                throw new Error(`${method.name} is missing property ${prop}`);
            }
        };

        beforeEach(() => {
            methodName = gtf.agm.getMethodName();
        });

        afterEach(async () => {
            await gtf.agm.unregisterMyStreams(myStreams);

            myStreams = [];
        });

        it('ServerMethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    glue.interop.unregister(method);
                }
            });

            const unTwo = glue.interop.serverMethodRemoved(({
                server,
                method
            }) => {

                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.interop.register(methodName, () => { });
        });

        it('ServerMethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.interop.serverMethodRemoved(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method, true);
                        unTwo();
                        ready();
                    } catch (error) {
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.interop.createStream(methodName)
                .then((stream) => {
                    stream.close();
                    ready();
                })
                .catch(done);
        });

        it('ServerMethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    glue.interop.unregister(method);
                }
            });

            const unTwo = glue.interop.serverMethodRemoved(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.interop.registerAsync(methodName, () => { });
        });
    });

    describe('serverMethodRemoved()', () => {
        let name;
        let methodDefinition;

        let glueApplication;

        beforeEach(async () => {
            glueApplication = await gtf.createApp();

            name = gtf.agm.getMethodName();
            methodDefinition = {
                name
            };
        });

        afterEach(async () => {
            await glueApplication.stop();
            glueApplication = null;
        });

        it('Should return a working unsubscribe function when triggered.', (done) => {
            const timeout = gtf.wait(3000, () => done());

            const un = glue.interop.serverMethodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            if (un) {
                un();
            }
            glueApplication.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                glueApplication.agm.unregister(methodDefinition);
            });
        });

        it('Should call the callback with the correct MethodDefinition.', (done) => {
            glueApplication.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                const un = glue.interop.serverMethodRemoved((info) => {
                    try {
                        expect(info.method.name).to.eql(methodDefinition.name);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                gtf.addWindowHook(un);
                glueApplication.agm.unregister(methodDefinition);
            });
        });

        it('Should call the callback with the correct Instance.', (done) => {
            const un = glue.interop.serverMethodRemoved((info) => {
                try {
                    expect(info.method.name).to.eql(methodDefinition.name);
                    done();
                } catch (err) {
                    done(err);
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                glueApplication.agm.unregister(methodDefinition);
            });
        });

        it('Should verify that the action really took place.', (done) => {
            const un = glue.interop.serverMethodRemoved(() => {
                try {
                    expect(glue.interop.methods().filter(m => m.name === methodDefinition.name).length).to.eql(0);
                    done();
                } catch (err) {
                    done(err);
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                glueApplication.agm.unregister(methodDefinition);
            });
        });

        it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.interop.serverMethodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(methodDefinition, callbackNeverCalled);
        });
    });
});
