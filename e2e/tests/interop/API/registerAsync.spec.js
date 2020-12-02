describe('registerAsync()', () => {
    const callbackNeverCalled = () => { };
    let name;
    let methodDefinition;


    before(() => {
        return coreReady;
    });

    beforeEach(() => {
        name = gtf.agm.getMethodName()
        methodDefinition = {
            name
        };
    });

    afterEach(() => {
        return gtf.agm.unregisterAllMyNonSystemMethods();
    });

    describe('Async: ', () => {
        it('The method should contain all properties defined in the API, when registered only with name', (done) => {
            methodDefinition.name = gtf.agm.getMethodName();

            glue.interop.registerAsync(methodDefinition, callbackNeverCalled)
                .then(() => {
                    const method = glue.interop.methods().find(m => m.name === methodDefinition.name);
                    // const t = method.hasOwnProperty('accepts');
                    expect(method.hasOwnProperty('accepts')).to.be.true;
                    expect(method.hasOwnProperty('description')).to.be.true;
                    expect(method.hasOwnProperty('displayName')).to.be.true;
                    expect(typeof method.getServers).to.eql('function');
                    expect(method.name).to.eql(methodDefinition.name);
                    expect(method.hasOwnProperty('returns')).to.be.true;
                    expect(method.objectTypes).to.not.be.undefined;
                    expect(method.objectTypes.length).to.eql(0);
                    expect(method.supportsStreaming).to.eql(false);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('The method should contain all properties defined in the API, when registered with all options', (done) => {
            methodDefinition.name = gtf.agm.getMethodName();
            methodDefinition.accepts = 'composite: { string a, string b } party';
            methodDefinition.description = 'awesome description';
            methodDefinition.displayName = 'TestMethod';
            methodDefinition.objectTypes = ['tick'];
            methodDefinition.returns = 'int c';
            methodDefinition.version = 42;

            glue.interop.registerAsync(methodDefinition, callbackNeverCalled)
                .then(() => {
                    const method = glue.interop.methods().find(m => m.name === methodDefinition.name);
                    expect(method.accepts).to.eql('composite: { string a, string b } party');
                    expect(method.description).to.eql(methodDefinition.description);
                    expect(method.displayName).to.eql(methodDefinition.displayName);
                    expect(typeof method.getServers).to.eql('function');
                    expect(method.name).to.eql(methodDefinition.name);
                    expect(method.objectTypes).to.not.be.undefined;
                    expect(method.objectTypes.length).to.eql(1);
                    expect(method.objectTypes[0]).to.eql(methodDefinition.objectTypes[0]);
                    expect(method.returns).to.eql('int c');
                    expect(method.supportsStreaming).to.eql(false);
                    expect(method.version).to.eql(42);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('registerAsync()', () => {
        let glueApplication;

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplication = app;
            }));

        afterEach(async () => {
            await glueApplication.stop();
            glueApplication = null;
        });

        it('Should return a promise that when resolved notifies that the method has been registered.', () => {
            return glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42))
                .then(() => {
                    expect(glue.interop.methods({ name }).length).to.eql(1);
                });
        });

        it('Should call the handler with the correct caller Instance when invoked.', async () => {
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => {
                expect(caller).to.eql(glue.interop.instance);
                success(42);
            });

            glue.interop.invoke(methodDefinition);
        });

        it('Should register a method with the correct name.', async () => {
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name }).length).to.eql(1);
        });

        it('Should register a method with correct accepts when provided (methodDefinition).', async () => {
            methodDefinition.accepts = 'String test';
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].accepts).to.eql('String test');
        });

        it('Should register a method with correct description when provided (methodDefinition).', async () => {
            methodDefinition.description = 'Hello world.';
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].description).to.eql('Hello world.');
        });

        it('Should register a method with correct display when provided (methodDefinition).', async () => {
            methodDefinition.displayName = 'Display name.';
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].displayName).to.eql('Display name.');
        });

        it('Should register a method with correct objectTypes when provided (methodDefinition).', async () => {
            methodDefinition.objectTypes = ['S', 'O', 'L', 'I', 'D'];
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].objectTypes).to.eql(['S', 'O', 'L', 'I', 'D']);
        });

        it('Should register a method with correct returns when provided (methodDefinition).', async () => {
            methodDefinition.returns = 'String test';
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].returns).to.eql('String test');
        });

        it('Should register a method with supportsStreaming false inside it\'s definition property.', async () => {
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42));
            expect(glue.interop.methods({ name })[0].supportsStreaming).to.be.false;
        });

        it('Should call the successCallback of the handler once executed w/o errors.', async () => {
            await glue.interop.registerAsync(methodDefinition, (_, __, success) => {
                success({
                    test: 42
                });
            });

            const invokeRes = await glue.interop.invoke(methodDefinition);

            expect(invokeRes.returned).to.eql({ test: 42 });
        });

        it('Should reject when registering a method with the same name as an existing one.', (done) => {
            glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42))
                .then(() => glue.interop.registerAsync(methodDefinition, (_, __, success) => success(42)))
                .then(() => done('Should not have resolved !'))
                .catch(() => done());
        });

        it('Should reject when the method/methodDefinition is undefined.', (done) => {
            glue.interop.registerAsync(undefined, (_, __, success) => success(42))
                .then(() => done('Should not have resolved !'))
                .catch(() => done());
        });

        it('Should call the errorCallback of the handler once executed w/ errors.', (done) => {
            glue.interop.registerAsync(methodDefinition, (_, __, ___, error) => error('test: 24'))
                .then(() => glue.interop.invoke(methodDefinition.name))
                .catch((errorRes) => {
                    try {
                        expect(errorRes.message).to.eql('test: 24');
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
        });

        ['string', 5].forEach((type) => {
            it('Should reject when the second parameter is not a function', (done) => {
                glue.interop.registerAsync(name, type)
                    .then(() => done('Should not have resolved !'))
                    .catch(() => done());
            });
        });

        it('Should reject when supportsStreaming IS passed as TRUE', (done) => {
            methodDefinition.supportsStreaming = true;
            glue.interop.registerAsync(methodDefinition)
                .then(() => done('Should not have resolved !'))
                .catch(() => done());
        });

        it('Should reject when registering a method with the same name as an existing one.', (done) => {
            glue.interop.registerAsync(methodDefinition, callbackNeverCalled);
            gtf.agm.waitForMethodAdded(methodDefinition).then(() => {
                glue.interop.registerAsync(methodDefinition, callbackNeverCalled)
                    .then(() => done('Should not have resolved !'))
                    .catch(() => done());
            });
        });

        it('Should reject when the method/methodDefinition is undefined.', (done) => {
            glue.interop.registerAsync(undefined, callbackNeverCalled)
                .then(() => done('Should not have resolved'))
                .catch(() => done());
        });

        it('Should resolve when the method is able to be invoked', async () => {
            await glue.interop.registerAsync(name, callbackNeverCalled);
            glue.interop.invoke(name);
        });

        it('Should resolve when the method is contained in the glue.interop.methods() client collection', async () => {
            await glue.interop.registerAsync(name, callbackNeverCalled);

            expect(glue.interop.methods({ name }).length).to.eql(1);
        });

        it('Should not mutate the .methods() collection when the methodDefinition object of the registered method is changed', async () => {
            methodDefinition.displayName = 'Should not be mutated';
            await glue.interop.registerAsync(methodDefinition, callbackNeverCalled);
            methodDefinition.displayName === 'Mutator';

            expect(glue.interop.methods({ name })[0].displayName).to.equal('Should not be mutated');
        });
    });
});
