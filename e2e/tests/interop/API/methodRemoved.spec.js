describe('methodRemoved()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
    });

    describe('AGM events about my actions: ', () => {
        let methodDefinition
        let myStreams = [];

        beforeEach(() => {
            methodDefinition = {
                name: gtf.agm.getMethodName()
            };
        });

        afterEach(async () => {
            await gtf.agm.unregisterMyStreams(myStreams);

            myStreams = [];
        });

        it('Should receive method removed event when I unregister a method', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const unSubscribe = glue.interop.serverMethodRemoved((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    if (unSubscribe) {
                        unSubscribe();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                }
            });

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    const m = glue.interop.methods().find(x => x.name === methodDefinition.name);
                    glue.interop.unregister(m);

                }
            });

            glue.interop.register(methodDefinition.name, callbackNeverCalled);
        });

        it('Should receive method removed event when I unregister a stream', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodRemoved((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                }
            });

            glue.interop.createStream(methodDefinition)
                .then((stream) => {
                    stream.close();
                });
        });
    });

    describe('AGM events about other servers\' actions: ', () => {
        let methodDefinition;

        let glueApplication;

        beforeEach(async () => {
            glueApplication = await gtf.createApp();

            methodDefinition = {
                name: gtf.agm.getMethodName()
            };
        });

        afterEach(async () => {
            await glueApplication.stop();
            glueApplication = null;
        });

        it('Should receive methodRemoved and serverMethodRemoved events when a server un-registers an async method', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glueApplication.agm.instance)) {
                    if (un) {
                        un();
                    }
                    glueApplication.agm.unregister(methodDefinition);
                    return;
                }
            });

            const unSub = glue.interop.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                }
            });

            const unSubscribe = glue.interop.serverMethodRemoved((removal) => {
                const server = removal.server || {};
                const method = removal.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glueApplication.agm.instance)) {
                    if (unSubscribe) {
                        unSubscribe();
                    }
                    callDone();
                    return;
                }
            });

            glueApplication.agm.registerAsync(methodDefinition, (_, __, success) => {
                success();
            });

        });

        it('Should receive methodRemoved and serverMethodRemoved events when a server un-registers a method', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glueApplication.agm.instance)) {
                    if (un) {
                        un();
                    }

                    glueApplication.agm.unregister(methodDefinition);
                }
            });

            const unSub = glue.interop.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (unSub) {
                        unSub();
                    }

                    callDone();
                }
            });

            const unSubscribe = glue.interop.serverMethodRemoved((removal) => {
                const server = removal.server || {};
                const method = removal.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glueApplication.agm.instance)) {
                    if (unSubscribe) {
                        unSubscribe();
                    }

                    callDone();
                }
            });

            glueApplication.agm.register(methodDefinition, callbackNeverCalled);
        });

        it('Should receive method removed event when a server un-registers a stream', (done) => {

            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodRemoved((removal) => {
                const server = removal.server || {};
                const method = removal.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glueApplication.agm.instance)) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                    return;
                }
            });

            glueApplication.agm.createStream(methodDefinition)
                .then((stream) => {
                    stream.close();
                })
                .catch(done);
        });
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
            'flags',
            'returns',
            'supportsStreaming',
        ];

        const fullMethodOptions = {
            name: '',
            objectTypes: ['otherApp'],
            flags: { a: 'test', b: true, c: 42, d: ['43'], e: { f: 44 }, g: { h: { i: '45' } } },
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

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {
                    glue.interop.unregister(fullMethodOptions);
                }
            });

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
                    try {
                        checkMethodDefinition(method);
                        done();
                        un();
                        unTwo();
                    } catch (error) {
                        done(error);
                    }
                }
            });

            glue.interop.register(fullMethodOptions, callbackNeverCalled);
        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {

                    const m = glue.interop.methods().find(x => x.name === fullMethodOptions.name);
                    glue.interop.unregister(m);
                }
            });

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
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

            glue.interop.registerAsync(fullMethodOptions, callbackNeverCalled);
        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
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
                .then((s) => {
                    s.close();
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
            'flags',
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

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodName) {
                    glue.interop.unregister(method);
                }
            });

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === methodName) {
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

            glue.interop.register(methodName, callbackNeverCalled);
        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === methodName) {
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
                .then((s) => {
                    s.close();
                    ready();
                })
                .catch(done);
        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodName) {
                    glue.interop.unregister(method);
                }
            });

            const unTwo = glue.interop.methodRemoved((method) => {
                if (method.name === methodName) {
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

            glue.interop.registerAsync(methodName, callbackNeverCalled);
        });
    });

    describe('methodRemoved()', () => {
        let glueApplication;
        let name;
        let methodDefinition;

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
            const un = glue.interop.methodRemoved(() => {
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
            const un = glue.interop.methodRemoved((methodDef) => {
                try {
                    expect(methodDef.name).to.eql(methodDefinition.name);
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
            const un = glue.interop.methodRemoved(() => {
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
            const un = glue.interop.methodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(methodDefinition, callbackNeverCalled);
        });

        it('Should not be triggered when the first application that registered a method unregisters it and there is another application that has registered the same method.', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.interop.methodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                return glue.interop.register(methodDefinition, callbackNeverCalled);
            }).then(() => glueApplication.agm.unregister(methodDefinition)).catch(done);
        });
    });
});
