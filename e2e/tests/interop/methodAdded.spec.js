/* eslint-disable no-console, no-unused-vars */
'use strict';
describe('methodAdded()', function () {

    let currentStream;

    before(() => coreReady);

    before(() => window.methodDefinition = {
        name: gtf.agm.getMethodName()
    });

    const cleanUp = () => {
        return new Promise((resolve, reject) => {

            const method = glue.agm.methods().find(m => m.name === methodDefinition.name);

            if (method && !method.supportsStreaming) {

                gtf.agm.clearMethod(methodDefinition.name, glue.agm.instance)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            } else if (method && method.supportsStreaming) {

                gtf.agm.clearStream(currentStream, glue.agm.instance)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            } else {
                resolve();
            }
        });
    };

    afterEach(() => {
        return cleanUp();
    });

    it('Should receive method added event when I register a stream', (done) => {

        const callDone = gtf.waitFor(3, done);

        methodDefinition.name = gtf.agm.getMethodName();

        let un = glue.agm.methodAdded((method) => {
            if (method.name === methodDefinition.name) {
                if (un) {
                    un();
                }
                callDone();
            }
        });

        let unSub = glue.agm.serverMethodAdded((data) => {

            var server = data.server || {};
            var method = data.method || {};

            if (method.name !== methodDefinition.name) {
                return;
            }

            if (gtf.agm.isValidServer(server, glue.agm.instance)) {
                if (unSub) {
                    unSub();
                }
                callDone();
            }
        });

        glue.agm.createStream(methodDefinition.name)
            .then((server) => {
                currentStream = server;
                callDone();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('Should receive method added event when I register a method', (done) => {
        const callDone = gtf.waitFor(2, done);

        methodDefinition.name = gtf.agm.getMethodName();

        glue.agm.register(methodDefinition.name, () => {
        });

        let un = glue.agm.methodAdded((method) => {
            if (method.name === methodDefinition.name) {
                if (un) {
                    un();
                }
                callDone();
            }
        });

        let unSub = glue.agm.serverMethodAdded((data) => {
            const server = data.server || {};
            const method = data.method || {};

            if (method.name !== methodDefinition.name) {
                return;
            }

            if (gtf.agm.isValidServer(server, glue.agm.instance)) {
                if (unSub) {
                    unSub();
                }
                callDone();
            }
        });

    });


    describe('AGM events about other servers\' actions: ', function () {
        this.timeout(5000);

        before(() => window.methodDefinition = {
            name: gtf.agm.getMethodName()
        });

        beforeEach(() => {
            return gtf.createApp()
                .then((glueApplication) => {
                    window.glueApplicationOne = glueApplication;
                });
        });

        afterEach(() => {
            return glueApplicationOne.stop();
        });

        it('Should receive methodAdded and serverMethodAdded events when a server registers a method async', (done) => {

            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            let un = glue.agm.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            let unSub = glue.agm.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                    return;
                }
            });

            glueApplicationOne.agm.registerAsync(methodDefinition, (args, caller, success) => {
                success();
            });
        });

        it('Should receive methodAdded and serverMethodAdded events when a server registers a method', (done) => {

            const callDone = gtf.waitFor(2, done);
            methodDefinition.name = gtf.agm.getMethodName();

            let un = glue.agm.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            let unSub = glue.agm.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                    return;
                }
            });

            glueApplicationOne.agm.register(methodDefinition, () => {
            });
        });

        it('Should receive method added event when a server registers a stream', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            let un = glue.agm.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            let unSub = glue.agm.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                    return;
                }

            });

            glueApplicationOne.agm.createStream(methodDefinition.name);

        });

    });

    describe('Registering with full method options', () => {
        let stream;

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

        afterEach(() => {
            const method = glue.agm.methods().find(x => x.name === fullMethodOptions.name);

            if (method && method.supportsStreaming) {
                return gtf.agm.clearStream(stream, glue.agm.instance);
            }

            if (method && !method.supportsStreaming) {
                return gtf.agm.clearMethod(method.name, glue.agm.instance);
            }

        });

        it('MethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.agm.methodAdded((method) => {
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
            glue.agm.register(fullMethodOptions, () => {
            });
        });

        it('MethodAdded should pass a valid methodDefinition object | Ticket: https://jira.tick42.com/browse/GLUE_D-1609', (done) => {
            const un = glue.agm.methodAdded((method) => {
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

            glue.agm.registerAsync(fullMethodOptions, () => {
            });
        });

        it('MethodAdded should pass a valid methodDefinition object', (done) => {

            const ready = gtf.waitFor(2, done);

            const un = glue.agm.methodAdded((method) => {
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

            glue.agm.createStream(fullMethodOptions)
                .then((s) => {
                    stream = s;
                    ready();
                })
                .catch(done);
        });
    });


    describe('Registering with only name', () => {
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

        let methodName;
        let stream;

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

        afterEach(() => {
            const method = glue.agm.methods().find(x => x.name === methodName);

            if (method && method.supportsStreaming) {
                return gtf.agm.clearStream(stream, glue.agm.instance);
            }

            if (method && !method.supportsStreaming) {
                return gtf.agm.clearMethod(methodName, glue.agm.instance);
            }

        });

        it('MethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.agm.methodAdded((method) => {
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

            glue.agm.register(methodName, () => {
            });
        });

        it('MethodAdded should pass a valid methodDefinition object', (done) => {
            const un = glue.agm.methodAdded((method) => {
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

            glue.agm.registerAsync(methodName, () => {
            });
        });

        it('MethodAdded should pass a valid methodDefinition object', (done) => {

            const ready = gtf.waitFor(2, done);

            const un = glue.agm.methodAdded((method) => {
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

            glue.agm.createStream(methodName)
                .then((s) => {
                    stream = s;
                    ready();
                })
                .catch(done);
        });
    });


    describe('methodAdded()', function () {

        before(() => {
            window.name = gtf.agm.getMethodName();
            window.methodDefinition = {
                name,
            };
            window.callbackNeverCalled = () => {
            };
            gtf.createApp()
                .then((glueApplication) => {
                    window.glueApplicationOne = glueApplication;
                });
        });

        after(() => {
            return glueApplicationOne.stop();
        });

        afterEach(() => {
            gtf.clearWindowActiveHooks();
        });

        it('Should return a working unsubscribe function when triggered.', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.agm.methodAdded(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            if (typeof un === 'function') {
                un();
            }
            glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled);
        });

        it('Should replay all beforehand registered methods.', (done) => {
            const ready = gtf.waitFor(3, done);
            const name1 = gtf.agm.getMethodName();
            const name2 = gtf.agm.getMethodName();
            const name3 = gtf.agm.getMethodName();
            const promise1 = glueApplicationOne.agm.register(name1, callbackNeverCalled);
            const promise2 = glueApplicationOne.agm.register(name2, callbackNeverCalled);
            const promise3 = glueApplicationOne.agm.register(name3, callbackNeverCalled);
            Promise.all([promise1, promise2, promise3]).then(() => {
                const un = glue.agm.methodAdded((newMethodDef) => {
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
            const un = glue.agm.methodAdded((m) => {
                if (m.name === newName) {
                    calledCounter++;
                }
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);
            glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        // I think that this test detects a bug
        // it('Should be triggered when a method with the same name and signature is registered as a method that was registered but then was unregistered.', (done) => {
        //     const newName = gtf.agm.getMethodName();
        //     const newMethodDefinition = {
        //         name: newName,
        //         accepts: 'String test1, String test2'
        //     };
        //     let callCount = 0;

        //     gtf.wait(5000, () => {
        //         try {
        //             expect(callCount).to.eql(1);
        //             done();
        //         } catch (err) {
        //             done(err);
        //         }
        //     }).catch(done);

        //     const mRemoved = () => {
        //         return new Promise((resolve) => {
        //             const un = glue.agm.methodRemoved((m) => {
        //                 if (m.name === newName) {
        //                     if (un) {
        //                         un();
        //                     }
        //                     resolve();
        //                 }
        //             });
        //         });
        //     };

        //     glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled)
        //         .then(() => {
        //             glueApplicationOne.agm.unregister(newMethodDefinition);
        //             return mRemoved();
        //         })
        //         .then(() => {
        //             const un = glue.agm.methodAdded((m) => {
        //                 if (m.name === newName) {
        //                     ++callCount;
        //                 }
        //             });
        //             gtf.addWindowHook(un);
        //             glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);
        //         });
        // });

        it('Should call the callback with the correct MethodDefinition.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            const un = glue.agm.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should verify that the action really took place.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };
            let callCount = 0;
            const un = glue.agm.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    ++callCount;
                    if (callCount > 1) {
                        return;
                    }
                    try {
                        expect(glue.agm.methods().find(m => m.name === newName)).not.to.be.undefined;
                        done();
                    } catch (error) {
                        done(error);
                    }
                }
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);
        });

        it('Should be called only once when registering one method.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDefinition = {
                name: newName,
            };

            const un = glue.agm.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(newMethodDefinition, callbackNeverCalled);

        });

        it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const newName = gtf.agm.getMethodName();
            const un = glue.agm.methodAdded((methodDef) => {
                if (methodDef.name === newName) {
                    timeout.cancel();
                    done('Should not be called.');
                }
            });
            gtf.addWindowHook(un);
        });

        it('Should return the unsubscribe function BEFORE calling the methods replaying callback.', (done) => {
            const un = glue.agm.methodAdded(() => {
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
