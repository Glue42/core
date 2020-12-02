describe('properties', () => {
    let glueApplication;
    let name;
    let methodDefinition;

    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        name = gtf.agm.getMethodName();
        methodDefinition = {
            name,
        };

        glueApplication = await gtf.createApp();

        await glueApplication.agm.register(methodDefinition, callbackNeverCalled);
    });

    afterEach(async () => {
        await Promise.all([glueApplication.stop(), gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
        glueApplication = null;
    });

    describe('all_errors', () => {
        it('Should not be undefined.', (done) => {
            glue.interop.invoke(name).then(invokeRes => {
                try {
                    expect(invokeRes.all_errors).to.not.be.undefined;
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    describe('all_return_values', () => {
        it('Should not be undefined.', (done) => {
            glue.interop.invoke(name).then(invokeRes => {
                try {
                    expect(invokeRes.all_return_values).to.not.be.undefined;
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(err => done(err));
        });

        it('Should contain a single value (InvocationResult) when executed on a single server.', (done) => {
            glue.interop.invoke(name, {
                test: 42
            }, 'all').then(invokeRes => {
                try {
                    expect(invokeRes.all_return_values[0].returned).to.eql({
                        test: 42
                    });
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });

        it('Should contain all values (InvocationResult) when executed on multiple servers.', (done) => {
            const un = glue.interop.methodAdded((m) => {
                if (m.name === name && m.accepts === 'String test') {
                    glue.interop.invoke(name, {
                        test: 42
                    }, 'all').then(invokeRes => {
                        try {
                            const returnValue1 = invokeRes.all_return_values[0].returned.test;
                            const returnValue2 = invokeRes.all_return_values[1].returned.test;
                            expect([
                                [24, 42],
                                [42, 24]
                            ]).to.deep.include([returnValue1, returnValue2]);
                            done();
                        } catch (err) {
                            done(err);
                        }
                    }).catch(done);
                }
            });
            gtf.addWindowHook(un);
            glue.interop.register({
                name,
                accepts: 'String test'
            }, () => {
                return {
                    test: 24
                };
            });
        });
    });

    describe('called_with', () => {
        it('Should contain the arguments of the invocation.', (done) => {
            const newName = gtf.agm.getMethodName();

            glue.interop.methodAdded((m) => {
                if (m.name === newName) {
                    glue.interop.invoke(newName, {
                        test: 42
                    }, 'all').then(invokeRes => {
                        try {
                            expect(invokeRes.called_with).to.eql({
                                test: 42
                            });
                            done();
                        } catch (err) {
                            done(err);
                        }
                    }).catch(done);
                }
            });

            glue.interop.register({
                name: newName
            }, () => {
                return {
                    test: 24
                };
            });
        });
    });

    describe('executed_by', () => {
        it('Should contain the instance of the application that executed the method.', (done) => {
            const newName = gtf.agm.getMethodName();

            glue.interop.methodAdded((m) => {
                if (m.name === newName) {
                    glue.interop.invoke(newName, {
                        test: 42
                    }, 'all').then(invokeRes => {
                        try {
                            const agmInstanceCopy = Object.assign({}, glue.interop.instance);
                            const executedByCopy = Object.assign({}, invokeRes.executed_by);
                            agmInstanceCopy.getStreams = undefined;
                            agmInstanceCopy.getMethods = undefined;

                            executedByCopy.getStreams = undefined;
                            executedByCopy.getMethods = undefined;

                            expect(executedByCopy).to.eql(agmInstanceCopy);
                            done();
                        } catch (err) {
                            done(err);
                        }
                    }).catch(done);
                }
            });

            glue.interop.register({
                name: newName
            }, () => {
                return {
                    test: 24
                };
            });
        });
    });

    describe('returned', () => {
        it('Should contain the returned object.', (done) => {
            const newName = gtf.agm.getMethodName();

            glue.interop.methodAdded((m) => {
                if (m.name === newName) {
                    glue.interop.invoke(newName, {
                        test: 42
                    }, 'all').then(invokeRes => {
                        try {
                            expect(invokeRes.returned).to.eql({
                                test: 24
                            });
                            done();
                        } catch (err) {
                            done(err);
                        }
                    }).catch(done);
                }
            });

            glue.interop.register({
                name: newName
            }, () => {
                return {
                    test: 24
                };
            });
        });
    });
});
