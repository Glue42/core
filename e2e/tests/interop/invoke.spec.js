// add second glue support app

// NEEDS TWO APPLICATIONS
// missing test cases
describe('invoke()', function () {

    before(() => coreReady);

    describe('sync method invoke', function () {

        before(() => window.methodDefinition = gtf.agm.getMethodName());

        let glueApplicationOne;

        before(async () => {
            const callbackNeverCalled = () => {
            };

            [glueApplicationOne] = await Promise.all([gtf.createApp()]);
            const sup = glue.appManager.application("coreSupport").instances;
            await Promise.all([
                glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled)
            ]);
        });

        after(() => Promise.all([glueApplicationOne.stop()]));

        it('Should reach only one of the servers when invoking a SYNC method with "best"', (done) => {

            glue.agm.invoke(methodDefinition, { t: 42 }, 'best')
                .then((res) => {
                    expect(res.all_return_values.length).to.equal(1);
                    expect(res.returned).to.eql({
                        t: 42
                    });

                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        // it('Should reach all servers when invoking an sync method with "all"', (done) => {
        //     glue.agm.invoke(methodDefinition, { t: 42 }, 'all')
        //         .then((res) => {
        //             expect(res.all_return_values).to.not.be.undefined;
        //             expect(res.all_return_values.length).to.eql(2);
        //             done();
        //         })
        //         .catch((err) => {
        //             done(err);
        //         });
        // });

        // it('Should only call a specific instance when only that instance\'s sync method is called.', (done) => {
        //     const targetInst = glueApplicationOne.instance.agm;

        //     glue.agm.invoke(methodDefinition, { t: 42 }, targetInst)
        //         .then((res) => {
        //             expect(res.all_return_values.length).to.eql(1);

        //             const calledApplication = res.all_return_values[0].executed_by.application;
        //             const expectedApplication = targetInst.application;

        //             expect(calledApplication).to.eql(expectedApplication);
        //             done();
        //         })
        //         .catch((err) => {
        //             done(err);
        //         });
        // });


    });

    describe('async method invoke', function () {
        before(() => window.methodDefinition = gtf.agm.getMethodName());
    });

    describe('invoke()', function () {

        before(() => {
            window.name = gtf.agm.getMethodName();
            window.methodDefinition = {
                name,
            };
            gtf.createApp()
                .then((glueApplication) => {
                    const callbackNeverCalled = () => {
                    };

                    window.glueApplicationOne = glueApplication;
                    return glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled);
                });
        });

        // when fixing the same ID problem with the app manager, comment out the above code and uncomment the one below
        // note: you may have to change some of the tests
        // before(async () => {
        //     const callbackNeverCalled = () => {
        //     };

        //     // debugger;
        //     [glueApplicationOne, glueApplicationTwo] = await Promise.all([gtf.agm.createGlueApplication(), gtf.agm.createGlueApplication()]);
        //     // console.log('Both Apps were started ! ');

        //     // glueApplicationOne = await gtf.agm.createGlueApplication();
        //     // console.log('App 1 started');
        //     // glueApplicationTwo = await gtf.agm.createGlueApplication();
        //     // console.log('App 2 started');

        //     await Promise.all([
        //         glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled),
        //         glueApplicationTwo.agm.register(methodDefinition, callbackNeverCalled)
        //     ]);
        // });


        // after(() => Promise.all([glueApplicationOne.stop(), glueApplicationTwo.stop()]));

        // beforeEach(() => {
        //     methodCallCount = 0;
        //     isFirstAppCalled = false;
        //     isSecondAppCalled = false;
        // });

        after(() => glueApplicationOne.stop());

        it('Should contain the correct method inside of the InvocationResult. | Ticket: https://jira.tick42.com/browse/GLUE_D-1857', (done) => {
            glue.agm.invoke(name).then((invRes) => {
                try {
                    expect(invRes.method.name).to.eql(name);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('Should contain the correct called_with arguments inside of the InvocationResult.', (done) => {
            const args = {
                test: 123
            };

            glue.agm.invoke(name, args).then((invRes) => {
                try {
                    expect(invRes.called_with).to.eql(args);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('Should contain the correct all_return_values object inside of the InvocationResult when invoked with \'best\'. | Ticket: https://jira.tick42.com/browse/GLUE_D-1838, https://jira.tick42.com/browse/GLUE_D-1857', (done) => {
            const args = {
                test: 123
            };

            glue.agm.invoke(name, args, 'best').then((invRes) => {
                try {
                    expect(invRes.all_return_values[0].returned).to.eql(args);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('Should contain the correct all_return_values object inside of the InvocationResult when invoked with \'all\'.', (done) => {
            const args = {
                test: 123
            };

            glue.agm.invoke(name, args, 'all').then((invRes) => {
                try {
                    expect(invRes.all_return_values[0].returned).to.eql(args);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        // ATTENTION !!!!!!
        it('Should contain the correct application that includes \'GTF_Tests_Support\' inside of the executed_by Instance inside of the InvocationResult.', (done) => {
            glue.agm.invoke(name).then((invRes) => {
                try {
                    // we are using the name coreSupport instead of the name GTF_Tests_Support
                    expect(invRes.executed_by.application.includes('coreSupport')).to.be.true;
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('Should take into account the methodResponseTimeoutMs.', (done) => {
            const newName = 'existing-method-that-takes-a-lot-of-time';

            const wait6kMs = (success) => {
                return new Promise((resolve, reject) => {
                    gtf.wait(6000, () => {
                        success();
                        resolve();
                    }).catch(reject);
                });
            };

            glue.agm.registerAsync(newName, (args, caller, success) => {
                wait6kMs(success);
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    return glue.agm.invoke(newName, {}, 'best', {
                        methodResponseTimeoutMs: 3000
                    });
                })
                .then(() => {
                    done('Should not be called');
                })
                .catch(() => {
                    done();
                });
        });

        it('Should take into account the waitTimeoutMs.', (done) => {
            let waitTimeoutTriggered = false;

            const timeout = gtf.wait(4000, () => {
                if (waitTimeoutTriggered) {
                    done();
                } else {
                    done('waitTimeoutMs wasn\'t taken into account.');
                }
            });
            timeout.catch(done);

            glue.agm.invoke('non-existing-method', {}, 'best', {
                waitTimeoutMs: 3000
            }).then(() => {
                timeout.cancel();
                done('Should not be called');
            }).catch(() => {
                waitTimeoutTriggered = true;
            });
        });

        it('Should invoke the error handler when the method is undefined (string, 15k ms). | Ticket: https://jira.tick42.com/browse/GLUE_D-1865', function (done) {
            this.timeout(15000);

            glue.agm.invoke(undefined, {}, 'best', {}, () => {
                done('Should not be called');
            }, () => {
                done();
            });
        });

        it('Should invoke the error handler when the method is undefined (MethodDefinition, 15k ms).', function (done) {
            this.timeout(15000);

            glue.agm.invoke({
                name: undefined
            }, {}, 'best', {}, () => {
                done('Should not be called');
            }, () => {
                done();
            });
        });

        it('Should reject when the method is undefined (string, 15k ms). | Ticket: https://jira.tick42.com/browse/GLUE_D-1865', function (done) {
            this.timeout(15000);

            glue.agm.invoke(undefined).then(() => {
                done('Should not be called');
            }).catch(() => done());
        });

        it('Should reject when the method is undefined (MethodDefinition, 15k ms).', function (done) {
            this.timeout(15000);

            glue.agm.invoke({
                name: undefined
            }).then(() => {
                done('Should not be called');
            }).catch(() => done());
        });

        it('Should contain the correct MethodDefinition inside of the InvokeErrorHandler when called with unexisting method.', function (done) {
            const newName = gtf.agm.getMethodName();
            const newMethodDef = {
                name: newName,
            };

            glue.agm.registerAsync(newMethodDef, (args, caller, success, error) => {
                error('broken-method-is-broken');
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke({
                        name: newName
                    }, {}, 'best', {}, () => {
                        done('Should not be called');
                    }, (errorObj) => {
                        try {
                            expect(errorObj.method.name).to.equal(newMethodDef.name);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                });
        });

        it('Should contain the correct called_with arguments inside of the InvokeErrorHandler.', function (done) {
            const newName = gtf.agm.getMethodName();
            const newMethodDef = {
                name: newName,
            };
            const newArgs = {
                test: 'test'
            };

            glue.agm.registerAsync(newMethodDef, (args, caller, success, error) => { //    | Ticket: https://jira.tick42.com/browse/GLUE_D-1875
                error('broken-method-is-broken');
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke({
                        name: newName
                    }, newArgs, 'best', {}, () => {
                        done('Should not be called');
                    }, (invokeErrorHandler) => {
                        try {
                            expect(invokeErrorHandler.called_with).to.eql(newArgs);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                });
        });

        it('Should contain the correct application that includes \'GTF_Tests_Runner\' inside of the executed_by Instance inside of the InvokeErrorHandler.', function (done) {
            const newName = gtf.agm.getMethodName();
            const newMethodDef = {
                name: newName,
            };

            glue.agm.registerAsync(newMethodDef, (args, caller, success, error) => { //    | Ticket: https://jira.tick42.com/browse/GLUE_D-1875
                error('broken-method-is-broken');
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke({
                        name: newName
                    }, {}, 'best', {}, () => {
                        done('Should not be called');
                    }, (invokeErrorHandler) => {
                        try {
                            expect(invokeErrorHandler.executed_by.application.includes('TestRunner')).to.be.true;
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                });
        });

        it('Should invoke the error handler when the target isn\'t \'best\' or \'all\'.', function (done) {
            const newName = gtf.agm.getMethodName();

            glue.agm.registerAsync(newName, (args, caller, success) => {
                success(42);
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke(newName, {}, 'non-existing-target', {}, () => {
                        done('Should not be called');
                    }, () => {
                        done();
                    });
                });
        });

        it('Should reject when when the target isn\'t \'best\' or \'all\'.', (done) => {
            const newName = gtf.agm.getMethodName();

            glue.agm.registerAsync(newName, (args, caller, success) => {
                success(42);
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    return glue.agm.invoke(newName, {}, 'non-existing-target');
                })
                .then(() => done('Should not be called.'))
                .catch(() => done());
        });

        it('Should invoke the error handler when argumentObj is string.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDef = {
                name: newName,
            };

            glue.agm.registerAsync(newMethodDef, (args, caller, success) => {
                success(42);
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke(newName, 'string-argumentObj', 'best', {}, () => done('Should not be called.'), () => done());
                });
        });

        it('Should reject when argumentObj is string.', (done) => {
            const newName = gtf.agm.getMethodName();
            const newMethodDef = {
                name: newName,
            };

            glue.agm.registerAsync(newMethodDef, (args, caller, success) => {
                success(42);
            });

            gtf.agm.waitForMethod(glue, newName, glue.agm.instance)
                .then(() => {
                    glue.agm.invoke(newName, 'string-argumentObj', 'best').then(() => done('Should not be called.')).catch(() => done());
                });
        });

        it('Should wait the default (3000ms) of time for the method to appear after invoke', (done) => {
            const newName = gtf.agm.getMethodName();
            const args = { data: 'shoulBeReceived' };

            // invoke before register
            glue.agm.invoke(newName, args, 'best', {}).then((result) => {
                // debugger;
                expect(result.returned).to.eql(args);
                done();
            }).catch(done);

            glue.agm.register(newName, (args) => args);
        });

        it('Should reject when the supplied target object isn\'t an instance', (done) => {
            glue.agm.register(methodDefinition, (args) => args);

            glue.agm.invoke(methodDefinition, {}, { target: 'best' }, { waitTimeoutMs: 5000 })
                .then((result) => done('Should not resolve', result))
                .catch(() => done());
        });

        it('Should reject when async method calls error callback with no error message', (done) => {
            const newMethodDefinition = { name: gtf.agm.getMethodName() };

            glue.agm.registerAsync(newMethodDefinition, (args, caller, success, error) => error());

            glue.agm.invoke(newMethodDefinition)
                .then(done)
                .catch(() => done());
        });

        it('Should reject when sync method throws error with no message', (done) => {
            const newMethodDefinition = { name: gtf.agm.getMethodName() };


            glue.agm.register(newMethodDefinition, () => {
                throw new Error();
            });

            glue.agm.invoke(newMethodDefinition)
                .then(done)
                .catch(() => done());
        });

        // IMPORTANT: this is valid only when you make the proper gd setup
        it.skip('Should choose the local machine when using the "mesh" gateway with "best" filter', (done) => {
            const newMethodDefinition = { name: 'MeshTest' };

            glueApplicationOne.agm.register(newMethodDefinition, () => {
                done();
            });

            glue.agm.invoke(newMethodDefinition);
        });
    });

    describe('Methods Results: ', function () {
        // let glueAppOne;
        // let glueAppTwo;

        // describe('Async methods: ', () => {
        //     const methodDefinitionSingleServer = { name: gtf.agm.getMethodName() };

        //     const methodDefinition = { name: gtf.agm.getMethodName() };
        //     const callbackNeverCalled = () => {
        //     };

        //     before(async () => {
        //         [glueAppOne, glueAppTwo] = await Promise.all([
        //             gtf.agm.createGlueApplication(),
        //             gtf.agm.createGlueApplication(),
        //         ]);

        //         await Promise.all([
        //             glueAppOne.agm.registerAsync(methodDefinitionSingleServer, callbackNeverCalled),
        //             glueAppOne.agm.registerAsync(methodDefinition, callbackNeverCalled),
        //             glueAppTwo.agm.registerAsync(methodDefinition, callbackNeverCalled),
        //         ]);

        //     });

        //     after(() => {
        //         return Promise.all([
        //             glueAppOne.stop(),
        //             glueAppTwo.stop(),
        //         ]);
        //     });

        //     it('The result of invoking a method on a server should have correct structure.', (done) => {
        //         glue.agm.invoke(methodDefinitionSingleServer)
        //             .then((result) => {
        //                 expect(typeof result.called_with).to.eql('object');
        //                 expect(typeof result.executed_by).to.eql('object');
        //                 expect(typeof result.returned).to.eql('object');

        //                 // missing
        //                 expect(typeof result.status).to.eql('number');
        //                 expect(typeof result.method).to.eql('object');
        //                 expect(typeof result.message).to.eql('string');
        //                 done();
        //             })
        //             .catch((err) => {
        //                 done(err);
        //             });
        //     });

        //     it('Multiple servers - when one fails, invoke should resolve and have correct structure.', (done) => {

        //         glue.agm.invoke(methodDefinition, { shouldFail: [glueAppOne.instance.agm] }, 'all')
        //             .then((result) => {
        //                 expect(typeof result.called_with).to.eql('object');
        //                 expect(typeof result.executed_by).to.eql('object');
        //                 expect(typeof result.all_return_values).to.not.be.undefined;
        //                 expect(result.all_return_values.length).to.eql(1);
        //                 expect(typeof result.message).to.eql('string');
        //                 expect(typeof result.all_return_values[0].returned).to.eql('object');
        //                 expect(typeof result.status).to.eql('number');
        //                 expect(typeof result.method).to.eql('object');
        //                 expect(typeof result.all_errors).to.not.be.undefined;
        //                 expect(result.all_errors.length).to.eql(1);
        //                 done();
        //             })
        //             .catch(done);
        //     });

        //     it('Multiple servers - when all fail, invoke should reject and have the correct structure.', (done) => {
        //         glue.agm.invoke(methodDefinition, { shouldFail: true }, 'all')
        //             .then((res) => {
        //                 done('Should not resolve!', res);
        //             })
        //             .catch((err) => {
        //                 expect(typeof err.called_with).to.eql('object');
        //                 expect(typeof err.executed_by).to.eql('object');
        //                 expect(typeof err.all_return_values).to.not.be.undefined;
        //                 expect(err.all_return_values.length).to.eql(0);
        //                 expect(typeof err.message).to.eql('string');

        //                 expect(typeof err.status).to.eql('number');
        //                 expect(typeof err.method).to.eql('object');
        //                 expect(typeof err.all_errors).to.not.be.undefined;
        //                 expect(err.all_errors.length).to.eql(2);
        //                 done();
        //             });
        //     });

        //     it('Multiple servers - the result should have correct structure.', (done) => {
        //         glue.agm.invoke(methodDefinition, { shouldFail: false }, 'all')
        //             .then((result) => {
        //                 expect(typeof result.called_with).to.eql('object');
        //                 expect(typeof result.executed_by).to.eql('object');
        //                 expect(typeof result.returned).to.eql('object');
        //                 expect(typeof result.all_return_values).to.not.be.undefined;
        //                 expect(result.all_return_values.length).to.eql(2);
        //                 expect(typeof result.message).to.eql('string');

        //                 // missing
        //                 expect(typeof result.status).to.eql('number');
        //                 expect(typeof result.method).to.eql('object');
        //                 expect(typeof result.all_errors).to.not.be.undefined;
        //                 expect(result.all_errors.length).to.eql(0);
        //                 done();
        //             })
        //             .catch((err) => {
        //                 done(err);
        //             });
        //     });
        // });
    });

    describe('Sync methods: ', () => {
        // const methodDefinitionSingleServer = { name: gtf.agm.getMethodName() };

        // const methodDefinition = { name: gtf.agm.getMethodName() };

        // const callbackNeverCalled = () => {
        // };

        // before(async () => {
        //     [glueAppOne, glueAppTwo] = await Promise.all([
        //         gtf.agm.createGlueApplication(),
        //         gtf.agm.createGlueApplication(),
        //     ]);


        //     await Promise.all([
        //         glueAppOne.agm.register(methodDefinitionSingleServer, callbackNeverCalled),
        //         glueAppOne.agm.register(methodDefinition, callbackNeverCalled),
        //         glueAppTwo.agm.register(methodDefinition, callbackNeverCalled),
        //     ]);

        // });

        // after(() => {
        //     return Promise.all([
        //         glueAppOne.stop(),
        //         glueAppTwo.stop(),
        //     ]);
        // });

        // it('The result of invoking a method on a server should have correct structure | Ticket: https://jira.tick42.com/browse/GLUE_D-1296', (done) => {
        //     glue.agm.invoke(methodDefinitionSingleServer)
        //         .then((result) => {
        //             expect(typeof result.called_with).to.eql('object');
        //             expect(typeof result.executed_by).to.eql('object');
        //             expect(typeof result.returned).to.eql('object');

        //             expect(typeof result.status).to.eql('number');
        //             expect(typeof result.method).to.eql('object');
        //             expect(typeof result.message).to.eql('string');
        //             expect(typeof result.all_return_values).to.not.be.undefined;
        //             expect(typeof result.all_return_values.length).to.eql('number');
        //             expect(typeof result.all_errors).to.not.be.undefined;
        //             expect(typeof result.all_errors.length).to.eql('number');
        //             done();
        //         })
        //         .catch((err) => {
        //             done(err);
        //         });
        // });

        // it('Multiple servers - when one fails, invoke should resolve and have correct structure.', (done) => {
        //     glue.agm.invoke(methodDefinition, { shouldFail: glueAppOne.instance.agm }, 'all')
        //         .then((result) => {
        //             expect(typeof result.called_with).to.eql('object');
        //             expect(typeof result.executed_by).to.eql('object');
        //             expect(typeof result.returned).to.eql('object');
        //             expect(typeof result.all_return_values).to.not.be.undefined;
        //             expect(result.all_return_values.length).to.eql(1);
        //             expect(typeof result.message).to.eql('string');

        //             expect(typeof result.status).to.eql('number');
        //             expect(typeof result.method).to.eql('object');
        //             expect(typeof result.all_errors).to.not.be.undefined;
        //             expect(result.all_errors.length).to.eql(1);
        //             done();
        //         })
        //         .catch((err) => {
        //             done('Should not get rejected!' + err);
        //         });
        // });

        // it('Multiple servers - when all fail, invoke should reject and have the correct structure.', (done) => {
        //     glue.agm.invoke(methodDefinition, { shouldFail: true }, 'all')
        //         .then((res) => {
        //             done('Should not resolve!', res);
        //         })
        //         .catch((err) => {
        //             expect(typeof err.called_with).to.eql('object');
        //             expect(typeof err.executed_by).to.eql('object');
        //             expect(typeof err.all_return_values).to.not.be.undefined;
        //             expect(err.all_return_values.length).to.eql(0);
        //             expect(typeof err.message).to.eql('string');

        //             // missing
        //             expect(typeof err.status).to.eql('number');
        //             expect(typeof err.method).to.eql('object');
        //             expect(typeof err.all_errors).to.not.be.undefined;
        //             expect(err.all_errors.length).to.eql(2);
        //             done();
        //         });
        // });

        // it('Multiple servers - the result should have correct structure.', (done) => {
        //     glue.agm.invoke(methodDefinition, { shouldFail: false }, 'all')
        //         .then((result) => {
        //             expect(typeof result.called_with).to.eql('object');
        //             expect(typeof result.executed_by).to.eql('object');
        //             expect(typeof result.returned).to.eql('object');
        //             expect(typeof result.all_return_values).to.not.be.undefined;
        //             expect(result.all_return_values.length).to.eql(2);
        //             result.all_return_values.forEach(val => expect(typeof val).to.eql('object'));
        //             expect(typeof result.message).to.eql('string');
        //             // missing
        //             expect(typeof result.status).to.eql('number');
        //             expect(typeof result.method).to.eql('object');
        //             expect(typeof result.all_errors).to.not.be.undefined;
        //             expect(result.all_errors.length).to.eql(0);
        //             done();
        //         })
        //         .catch((err) => {
        //             done(err);
        //         });
        // });
    });

    describe('Complex AGM objects: ', function () {
        this.timeout(5000);

        before(() => {
            window.methodDefinition = {
                name: gtf.agm.getMethodName()
            };
        })

        window.dataStore = [
            {
                value: null
            },
            {},
            {
                a: 1,
                b: '2asd',
                c: Date(),
                d: true
            },
            {
                value: {
                    inner: null
                }
            },
            {
                value: {
                    inner1: null
                }
            },
            {
                value: 1
            },
            {
                value: {
                    inner: 1
                }
            },
            {
                value: 'test'
            },
            {
                value: '2003-01-05T21:32:44.945Z'
            },
            {
                strValue: 'test',
                emptyValue: {}
            },
            {
                strValue: 'test',
                notEmptyValue: {
                    test: 'test'
                }
            },
            {
                test: {
                    nullValue: null,
                    notEmptyValue: {
                        test: ''
                    },
                    intValue: -1,
                    strValue: 'test',
                    dateValue: '2003-01-05T21:32:44.945Z',
                    boolValue: true
                }
            },
            {
                nested1: {
                    nested2: {
                        nested3: {
                            nested4: {
                                nested5: {
                                    number: 11,
                                    nested6: {
                                        nested7: {
                                            intValue: -1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                arr: []
            },
            {
                arr: ['test1', 'test2', 'test3']
            },
            {
                a: [
                    ['array-item-1'],
                    ['array-item-1', 'array-item-2']
                ]
            },
            {
                arr: [null, null, null]
            },
            {
                arr: [
                    [null],
                    [
                        []
                    ],
                    [
                        [1, 2, 3]
                    ]
                ]
            },
            {
                arr: [{
                    strValue: 'test'
                }, {}, {
                    intValue: 1,
                    dateValue: new Date()
                }, {
                    value: null
                }]
            },
            {
                arr: [
                    [1, 2, 3],
                    [1, '2', 3],
                    [],
                    [true, false],
                    [
                        [1, 2],
                        [3, 4]
                    ]
                ]
            },
            {
                arr: [
                    -1, 10.22, 10.111111111111, 'test', true, false, '2003-01-05T21:32:44.945Z', null, {}, { test: null }, { test: 'test' }, [], [[]], [{}, []]
                ]
            },
            {
                snapshot: [{
                    symbol: 'AAPL',
                    price: 119.948,
                    sequence: 535
                }, {
                    symbol: 'MSFT',
                    price: 45.745,
                    sequence: 536
                }, {
                    symbol: 'GOOG',
                    price: 68.98,
                    sequence: 537
                }, {
                    symbol: 'FB',
                    price: 537.362,
                    sequence: 538
                }, {
                    symbol: 'YHOO',
                    price: 49.387,
                    sequence: 539
                }],
                lastUpdateSeq: 540
            },
            {
                test: [{
                    id: '3bc6d7a5-81e0-403c-bb14-002f582fbb42',
                    sequenceId: null,
                    type: 'Execution',
                    source: 'OMS',
                    sourceNotificationId: 'OMS_cihqc7sxh0000s8ipuu4ozc6t',
                    title: 'Darketofzocmetruvtufultumhubenagaf.',
                    notificationTime: '2041-09-05T01:13:14.820Z',
                    creationTime: '2015-12-03T14:28:13.496Z',
                    severity: 'Info',
                    description: 'Mofmihnicawbuzsauvacihvomutvatvungukib.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'ne',
                        value: {
                            stringValue: 'vugahu'
                        }
                    }, {
                        key: 'mumtuvfih',
                        value: {
                            stringValue: 'hojigi'
                        }
                    }],
                    target: {
                        groups: ['Ontario']
                    },
                    reminder: {
                        remindPeriod: 120
                    }
                }, {
                    id: '054ce16b-d759-4016-91f4-6e5fa6dd5a1b',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'GNS',
                    sourceNotificationId: 'GNS_cihqbupsc00009cipgq2txnro',
                    title: 'Belzolicbukgagadativzi.',
                    notificationTime: '2027-08-20T05:41:56.728Z',
                    creationTime: '2015-12-03T14:18:02.894Z',
                    severity: 'Warn',
                    description: 'Vucjabimberfehegatuperbeurtiveliucidoz.',
                    state: 'Closed',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'te',
                        value: {
                            stringValue: 'buga'
                        }
                    }, {
                        key: 'vume',
                        value: {
                            stringValue: 'elmi'
                        }
                    }],
                    lifetime: {
                        expiresAt: '2071-01-20T07:13:32.835Z'
                    },
                    target: {
                        users: ['HowardGriffin', 'FannieMassey']
                    }
                }, {
                    id: '002e26bb-96fa-4cfc-b841-649693e7583c',
                    sequenceId: null,
                    type: 'Workflow',
                    source: 'UNIXTimestamp',
                    sourceNotificationId: 'BPMEngine_cihpzicf800006wip5iei10lq',
                    title: 'Gisizjolawzobzasnufu.',
                    notificationTime: '2084-11-10T03:09:15.631Z',
                    creationTime: '2015-02-07T14:10:38.2275004+02:00',
                    severity: 'Warn',
                    description: 'Kupgezvedgepobjapadazusabakefenudofdamitkobajsajbertateeljo.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    lifetime: {
                        expiresIn: 53990
                    }
                }, {
                    id: '2e9d9954-8fb9-4e67-91e4-2a9ae59d6ad6',
                    sequenceId: null,
                    type: 'Execution',
                    source: 'OMS',
                    sourceNotificationId: 'OMS_cihqcrrr000011cipa4a853ld',
                    title: 'Gitvabkeezjemipevfekkekwumoibrilochumahoav.',
                    notificationTime: '2050-10-15T08:06:41.346Z',
                    creationTime: '2015-12-03T14:43:45.084Z',
                    severity: 'Warn',
                    description: 'Zoidekzagpujhuhupfuwtusecvobumunetargejafonnocbobetiklorzu.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'woisiad',
                        value: {
                            stringValue: 'boshar'
                        }
                    }],
                    target: {
                        users: ['RichardChristensen'],
                        groups: ['Manitoba']
                    }
                }, {
                    id: '2d8befc7-237e-417e-9dba-6fa1cc3b5cda',
                    sequenceId: null,
                    type: 'Workflow',
                    source: 'BPMEngine',
                    sourceNotificationId: 'BPMEngine_cihqcnowm00001cip5m7tamvh',
                    title: 'Sabbezagtibvisebiogevukpuazfebumni.',
                    notificationTime: '2034-12-26T02:14:13.919Z',
                    creationTime: '2015-12-03T14:40:34.777Z',
                    severity: 'Info',
                    description: 'Cabibriisemomifodovpowduzakadmeddajsunijsedtuwepiofkuijvu.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'vedda',
                        value: {
                            stringValue: 'nu'
                        }
                    }],
                    target: {
                        users: ['HuldaPowers', 'LeonManning']
                    },
                    reminder: {
                        remindPeriod: 180
                    }
                }, {
                    id: '8c590cd7-7fc5-41eb-9aa3-37e7922979a4',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'Eikon',
                    sourceNotificationId: 'Eikon_cihqcfma0000074ip0849z2p7',
                    title: 'Paapezumtenotuhmeshoglenematuhdeihotogkezangapnicre.',
                    notificationTime: '2093-02-14T23:58:29.829Z',
                    creationTime: '2015-12-03T14:34:18.122Z',
                    severity: 'Error',
                    description: 'Todiagijodiitoehuahivezotogbebmedid.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'rebbe',
                        value: {
                            stringValue: 'hewjasit'
                        }
                    }],
                    target: {
                        groups: ['Nunavut']
                    }
                }, {
                    id: '463b7116-5a02-478d-9ab8-4e593d3e6fda',
                    sequenceId: null,
                    type: 'Notice',
                    source: 'Operate',
                    sourceNotificationId: 'Operate_cihqc840y0002s8ipb07d6lcv',
                    title: 'Wiewdeljipruvatisgukegeef.',
                    notificationTime: '2031-06-21T04:51:40.645Z',
                    creationTime: '2015-12-03T14:28:27.874Z',
                    severity: 'Warn',
                    description: 'Pareipowezojafkezhombadilezfedmegoacozustadigesuphegobaj.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'pekmig',
                        value: {
                            stringValue: 'segnifze'
                        }
                    }],
                    lifetime: {
                        expiresIn: 45437
                    },
                    target: {
                        users: ['MaggieStokes', 'LuluPorter'],
                        groups: ['NewBrunswick']
                    },
                    reminder: {
                        remindPeriod: 270
                    }
                }, {
                    id: 'f3ec5833-8420-442c-8e1b-3849d65965d2',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'Outlook',
                    sourceNotificationId: 'Outlook_cihp2li2l0001gsip3lapxmv0',
                    title: 'Onuzagoutdeutasewitarumojiro.',
                    notificationTime: '2015-11-08T01:46:14.191Z',
                    creationTime: '2015-12-02T17:11:10.270Z',
                    severity: 'Info',
                    description: 'Togkekupofutrobigampugahbusbeokiarijefitadgukref.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'wukukvew',
                        value: {
                            stringValue: 'hulvewdu'
                        }
                    }, {
                        key: 'mahogag',
                        value: {
                            stringValue: 'ni'
                        }
                    }],
                    target: {
                        users: ['JacksonOwens', 'EmilyLeonard'],
                        groups: ['Manitoba']
                    }
                }]
            }
        ];

        window.dataLen = dataStore.length;

        describe('Sync methods, registered by others should preserve data: ', () => {

            before(() => gtf.createApp()
                .then((glueApplication) => {
                    window.glueApplicationOne = glueApplication;

                    return glueApplicationOne.agm.register(methodDefinition, () => {
                    });
                }));

            after(() => glueApplicationOne.stop());

            for (let i = 0; i < dataLen; i++) {
                it(`Methods complex data store test number ${i}`, (done) => {
                    glue.agm.invoke(methodDefinition, dataStore[i])
                        .then((args) => {
                            const returnValue = args.returned;
                            expect(returnValue).to.eql(dataStore[i]);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
            }
        });

        // describe('Async methods, registered by others should preserve data: ', () => {
        //     let glueApplicationOne;
        //     let currentCallbackArgs;

        //     before(() => gtf.agm.createGlueApplication()
        //         .then((glueApplication) => {
        //             glueApplicationOne = glueApplication;

        //             methodDefinition.name = gtf.agm.getMethodName();

        //             return glueApplicationOne.agm.registerAsync(methodDefinition, (args, caller, success) => {
        //                 currentCallbackArgs = args;
        //                 success();
        //             });
        //         }));

        //     after(() => glueApplicationOne.stop());

        //     for (let i = 0; i < dataLen; i++) {
        //         it(`Methods complex data store test number ${i}`, (done) => {
        //             glue.agm.invoke(methodDefinition, dataStore[i])
        //                 .then(() => {
        //                     expect(currentCallbackArgs).to.eql(dataStore[i]);
        //                     done();
        //                 })
        //                 .catch((err) => {
        //                     done(err);
        //                 });
        //         });
        //     }
        // });
    });
});
