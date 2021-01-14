describe('methodAdded()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
    });

    describe('AGM events about my actions: ', () => {
        let methodDefinition;
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

        it('Should receive method added event when I register a stream', (done) => {
            const callDone = gtf.waitFor(3, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodAdded((data) => {
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

            glue.interop.createStream(methodDefinition.name)
                .then((stream) => {
                    myStreams.push(stream);
                    callDone();
                })
                .catch(done);
        });

        it('Should receive method added event when I register a method', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodAdded((data) => {
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

            glue.interop.register(methodDefinition.name, callbackNeverCalled);
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

        it('Should receive methodAdded and serverMethodAdded events when a server registers a method async', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

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

            glueApplication.agm.registerAsync(methodDefinition, (_, __, success) => {
                success();
            });
        });

        it('Should receive methodAdded and serverMethodAdded events when a server registers a method', (done) => {
            const callDone = gtf.waitFor(2, done);
            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

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

            glueApplication.agm.register(methodDefinition, callbackNeverCalled);
        });

        it('Should receive method added event when a server registers a stream', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            const unSub = glue.interop.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

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

            glueApplication.agm.createStream(methodDefinition);
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
            objectTypes: ['otherApp'],
            flags: { a: 'test', b: true, c: 42, d: ['43'], e: { f: 44 }, g: { h: { i: '45' } } },
            description: 'same description',
            displayName: 'awesome display name',
            accepts: 'String name',
            returns: 'String name'
        };

        const checkMethodDefinition = (method, isStream) => {
            const shouldSupportStreaming = isStream ? isStream : false;

            for (const prop of expectedProperties) {
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

        it('MethodAdded should pass a valid methodDefinition object (register)', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {
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
            glue.interop.register(fullMethodOptions, callbackNeverCalled);
        });


        it('MethodAdded should pass a valid methodDefinition object  (registerAsync)', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {
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

        it('MethodAdded should pass a valid methodDefinition object (createStreamr)', (done) => {

            const ready = gtf.waitFor(2, done);

            const un = glue.interop.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {
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

        it('MethodAdded should pass a valid methodDefinition object (register)', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodName) {
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

        it('MethodAdded should pass a valid methodDefinition object (registerAsync)', (done) => {
            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodName) {
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

        it('MethodAdded should pass a valid methodDefinition object (createStream)', (done) => {

            const ready = gtf.waitFor(2, done);

            const un = glue.interop.methodAdded((method) => {
                if (method.name === methodName) {
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

    describe('methodAdded()', () => {
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
            const un = glue.interop.methodAdded(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            if (typeof un === 'function') {
                un();
            }
            glueApplication.agm.register(methodDefinition, callbackNeverCalled);
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
                const un = glue.interop.methodAdded((newMethodDef) => {
                    if (newMethodDef.name === name1) {
                        ready();
                    }
                    if (newMethodDef.name === name2) {
                        ready();
                    }
                    if (newMethodDef.name === name3) {
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
            const un = glue.interop.methodAdded((m) => {
                if (m.name === newName) {
                    calledCounter++;
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should be triggered when a method with the same name and signature is registered as a method that was registered but then was unregistered.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
                accepts: 'String test1, String test2'
            };
            let callCount = 0;

            gtf.wait(5000, () => {
                try {
                    expect(callCount).to.eql(1);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);

            const mRemoved = () => {
                return new Promise((resolve) => {
                    const un = glue.interop.methodRemoved((m) => {
                        if (m.name === newName) {
                            if (un) {
                                un();
                            }
                            resolve();
                        }
                    });
                });
            };

            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled)
                .then(() => {

                    glueApplication.agm.unregister(newMethodDefinition);
                    return mRemoved();
                })
                .then(() => {
                    const un = glue.interop.methodAdded((m) => {
                        if (m.name === newName) {
                            ++callCount;
                        }
                    });
                    gtf.addWindowHook(un);
                    glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
                });
        });

        it('Should call the callback with the correct MethodDefinition.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.interop.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
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
            const un = glue.interop.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    try {
                        expect(glue.interop.methods().find(m => m.name === newName)).not.to.be.undefined;
                        done();
                    } catch (error) {
                        done(error);
                    }
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should be called only once when registering one method.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };

            const un = glue.interop.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(newMethodDefinition, callbackNeverCalled);

        });

        it('Should not be triggered when the setup was there but the corresponding method wasn\'t registered (3k ms).', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const newName = gtf.agm.getMethodName();
            const un = glue.interop.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    timeout.cancel();
                    done('Should not be called.');
                }
            });
            gtf.addWindowHook(un);
        });

        it('Should return the unsubscribe function BEFORE calling the methods replaying callback.', (done) => {
            const un = glue.interop.methodAdded(() => {
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
