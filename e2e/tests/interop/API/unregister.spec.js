describe('unregister()', () => {
    let glueApplication;

    let name;
    let methodDefinition;

    const callbackNeverCalled = () => { };

    const registerMethod = async (name) => {
        await glue.interop.register(name, callbackNeverCalled);
    };

    before(() => {
        return coreReady;
    });

    beforeEach(() => {
        name = gtf.agm.getMethodName();
        methodDefinition = { name };
    });

    afterEach(async () => {
        const promisesToAwait = [gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()];

        if (glueApplication) {
            promisesToAwait.push(glueApplication.stop());
        }

        await Promise.all(promisesToAwait);

        glueApplication = null;
    });

    it('Should remove method when called with "name" as (string)', async () => {
        await registerMethod(name);
        await glue.interop.unregister(name);
        expect(glue.interop.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with methodDefinition object with "name" (methodDefinition) ', async () => {
        await registerMethod(methodDefinition);
        await glue.interop.unregister(methodDefinition);
        expect(glue.interop.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with methodDefinition object with all properties (methodDefinition)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(fullMethodDefinition);
        await glue.interop.unregister(fullMethodDefinition);
        expect(glue.interop.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with name but registered with full methodDefinition (string)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(fullMethodDefinition);
        await glue.interop.unregister(name);
        expect(glue.interop.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with a full methodDefinition but registered only with name (methodDefinition)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(name);
        await glue.interop.unregister(fullMethodDefinition);
        expect(glue.interop.methods({ name }).length).to.equal(0);
    });

    it('Should resolve when called with a simple name predicate (predicate)', async () => {
        await registerMethod(name);
        await glue.interop.unregister((md) => md.name === name);
    });

    [{
        prop: 'accepts',
        value: 'int smth'
    }, {
        prop: 'objectTypes',
        value: ['AType']
    }].forEach(({ prop, value }) => {
        it('Should resolve when called with any kind of method definition property predicate (predicate) ... ' + prop, async () => {
            const methodDef = { name, [prop]: value };
            await registerMethod(methodDef);
            await glue.interop.unregister((md) => md[prop] === value);
        });
    });

    it('Should remove BOTH methods that match the condition (predicate)', async () => {
        const desc = 'unregMePlease';

        await Promise.all([
            registerMethod({
                name: gtf.agm.getMethodName(),
                description: desc
            }),
            registerMethod({
                name: gtf.agm.getMethodName(),
                description: desc
            })
        ]);

        await glue.interop.unregister((md) => md.description === desc)
            .then(() => {
                const methods = glue.interop.methods({ description: desc });
                expect(methods).to.be.an('array');
                expect(methods.length).to.eql(0);
            });
    });

    it('Should reject when there are no methods that match the definition (string).', (done) => {
        glue.interop.unregister('non-existing-method')
            .then(() => done('Should not have resolved'))
            .catch(() => done());
    });

    it('Should reject when there are no methods that match the definition (methodDefinition).', (done) => {
        glue.interop.unregister({ name: 'non-existing-method' })
            .then(() => done('Should not have resolved'))
            .catch(() => done());
    });

    it('Should resolve when the method is really removed from glue.interop.methods', async () => {
        const waitPromise = gtf.agm.waitForMethodAdded(name);

        registerMethod(name);

        await waitPromise;
        await glue.interop.unregister(name);

        const methods = glue.interop.methods({ name });
        expect(methods).to.be.an('array');
        expect(methods.length).to.eql(0);
    });

    it('Should reject when somebody tries to unregister a method that hasn\'t been registered by them. (methodDefinition)', (done) => {
        gtf.createApp()
            .then((app) => {
                glueApplication = app;
                return glueApplication.agm.register(methodDefinition, callbackNeverCalled);
            })
            .then(() => {
                glue.interop.unregister(name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a method from different server (predicate)', (done) => {
        gtf.createApp()
            .then((app) => {
                glueApplication = app;
                return glueApplication.agm.register(methodDefinition, callbackNeverCalled);
            })
            .then(() => {
                glue.interop.unregister((md) => md.name === name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a stream. (stream.name)', (done) => {
        glue.interop.createStream(methodDefinition)
            .then(stream => {
                glue.interop.unregister(stream.name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a stream. (predicate)', (done) => {
        glue.interop.createStream(methodDefinition)
            .then(stream => {
                glue.interop.unregister((md) => md.name === stream.name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when the definition is undefined (string).', (done) => {
        glue.interop.unregister(undefined).catch(() => done());
    });

    it('Should reject when the definition object is empty (methodDefinition).', (done) => {
        glue.interop.unregister({}).catch(() => done());
    });

    it('Should reject when predicate doesnt match any method name(predicate)', (done) => {
        registerMethod(name).then(() => {
            glue.interop.unregister((md) => md.name === 'none <> existing')
                .catch(() => done());
        }).catch(done);
    });

    it('Should reject when predicate is called with non-existing methodDefinition prop', (done) => {
        registerMethod(name).then(() => {
            glue.interop.unregister((md) => md['wrongProp'] === name)
                .catch(() => done());
        }).catch(done);
    });

    it('Should be able to register a method synchronously on the next line after unregistering it', async () => {
        await glue.interop.register(name, callbackNeverCalled);
        glue.interop.unregister(name);
        await glue.interop.register(name, callbackNeverCalled);
    });
});
