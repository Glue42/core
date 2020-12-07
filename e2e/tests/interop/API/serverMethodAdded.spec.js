describe('serverMethodAdded()', () => {
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
            name: '',
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

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method);
                        done();
                        un();
                    } catch (error) {
                        done(error);
                    }
                }
            });

            glue.interop.register(fullMethodOptions, callbackNeverCalled);
        });

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
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
                        done();
                    } catch (error) {
                        un();
                        done(error);
                    }
                }
            });

            glue.interop.registerAsync(fullMethodOptions, callbackNeverCalled);
        });

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method, true);
                        un();
                        ready();
                    } catch (error) {
                        un();
                        done(error);
                    }
                }
            });

            glue.interop.createStream(fullMethodOptions)
                .then((stream) => {
                    myStreams.push(stream);
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

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
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
                        done();
                    } catch (error) {
                        un();
                        done(error);
                    }
                }
            });

            glue.interop.register(methodName, callbackNeverCalled);
        });

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
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
                        done();
                    } catch (error) {
                        un();
                        done(error);
                    }
                }
            });

            glue.interop.registerAsync(methodName, callbackNeverCalled);
        });

        it('ServerMethodAdded should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {
                    try {
                        checkMethodDefinition(method, true);
                        un();
                        ready();
                    } catch (error) {
                        un();
                        done(error);
                    }
                }
            });

            glue.interop.createStream(methodName)
                .then((stream) => {
                    myStreams.push(stream);
                    ready();
                })
                .catch(done);
        });
    });

    describe('serverMethodAdded()', () => {
        let glueApplication;

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplication = app;
            }));

        afterEach(async () => {
            await glueApplication.stop();
            glueApplication = null;
        });

        it('Should return a working unsubscribe function when triggered.', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.serverMethodAdded(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            if (typeof un === 'function') {
                un();
            }
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should replay all beforehand registered methods.', (done) => {
            const ready = gtf.waitFor(3, done);
            const name1 = gtf.agm.getMethodName();
            const name2 = gtf.agm.getMethodName();
            const name3 = gtf.agm.getMethodName();
            const promise1 = glueApplication.agm.register(name1, callbackNeverCalled);
            const promise2 = glueApplication.agm.register(name2, callbackNeverCalled);
            const promise3 = glueApplication.agm.register(name3, callbackNeverCalled);
            Promise.all([promise1, promise2, promise3]).then(() => {
                const un = glue.interop.serverMethodAdded((info) => {
                    if (info.method.name === name1) {
                        ready();
                    }
                    if (info.method.name === name2) {
                        ready();
                    }
                    if (info.method.name === name3) {
                        ready();
                    }
                });
                gtf.addWindowHook(un);
            });
        });

        it('Should not be triggered when a method with the same name and signature is registered.', (done) => {
            let calledCounter = 0;
            gtf.wait(3000, () => {
                if (calledCounter === 1) {
                    done();
                } else {
                    done('Called methodAdded too many times with the same method name.');
                }
            }).catch(done);
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.serverMethodAdded((info) => {
                if (info.method.name === newName) {
                    calledCounter++;
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should call the callback with the correct MethodDefinition.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.serverMethodAdded((info) => {
                if (info.method.name === newName) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should call the callback with the correct Instance.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.serverMethodAdded(info => {
                if (newMethodDefinition.name !== info.method.name) {
                    return;
                }
                if (info.server.application === glueApplication.agm.instance.application) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should verify that the action really took place.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.serverMethodAdded(info => {
                if (info.method.name === newName) {
                    try {
                        expect(glue.interop.methods().filter(m => m.name === newName).length).to.eql(1);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const newName = gtf.agm.getMethodName();
            const un = glue.interop.serverMethodAdded(info => {
                if (info.method.name === newName) {
                    timeout.cancel();
                    done('Should not be called.');
                }
            });
            gtf.addWindowHook(un);
        });

        it('Should return the unsubscribe function BEFORE calling the methods replaying callback.', (done) => {
            const un = glue.interop.serverMethodAdded(() => {
                try {
                    expect(typeof un).to.eql('function');
                    un();
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });
});
