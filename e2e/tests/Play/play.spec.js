// describe("what if? ", () => {

//     let inst;
//     let method;


//     afterEach(async () => {
//         if (inst) {
//             await inst.stop()
//             inst = null;
//         }

//         if (method) {
//             await glue.interop.unregister(method);
//         }
//     });

//     it("can I fly", async () => {
//         expect(glue.appManager).to.not.be.an('undefined');
//     });

//     it('asd0', () => {
//         expect(gtf).to.not.be.an('undefined');
//         expect(gtf.waitFor).to.not.be.an('undefined');
//         expect(gtf.getWindowName).to.not.be.an('undefined');
//         expect(gtf.getGlueConfigJson).to.not.be.an('undefined');
//         expect(gtf.getChannelNames).to.not.be.an('undefined');
//         expect(gtf.createApp).to.not.be.an('undefined');
//     });

//     it('asd', async () => {
//         console.log(glue.windows.list().length);
//         const app = await gtf.createApp();
//         console.log(glue.windows.list().length);
//         await app.stop();
//         console.log(glue.windows.list().length);
//     });

//     it('asd2', async () => {
//         const app = await gtf.createApp();
//         await app.setContext("testMe", { test: 42 });

//         const all = glue.contexts.all();
//         console.log(all);
//         await app.stop();
//     });

//     it('should contain agm with getMethodName', async () => {
//         const app = await gtf.createApp();
//         const methodName = gtf.agm.getMethodName();
//         await app.stop();
//     });
// });
describe('register()', function () {

    before(() => coreReady);

    describe('Sync: ', () => {
        before(() => {
            let name = gtf.agm.getMethodName();
            let methodDefinition = {
                name,
            };
            const callbackNeverCalled = () => {
            };
            window.methodDefinition = methodDefinition;
            window.callbackNeverCalled = callbackNeverCalled;
        })
        afterEach(() => {
            return gtf.agm.clearMethod(methodDefinition.name, glue.interop.instance);
        });

        it('The method should contain all properties defined in the API, when registered only with name', done => {
            methodDefinition.name = gtf.agm.getMethodName();
            glue.interop.register(methodDefinition, callbackNeverCalled)
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

            glue.interop.register(methodDefinition, callbackNeverCalled)
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

    describe('register()', function () {

        beforeEach(() => {
            window.name = gtf.agm.getMethodName();
            // eslint-disable-next-line no-console
            window.methodDefinition = { name };
        });

        before(() => gtf.createApp()
            .then((glueApplication) => {
                window.glueApplicationOne = glueApplication;
            }));

        after(() => glueApplicationOne.stop());

        it('Should return a promise that when resolved notifies that the method has been registered.', async () => {
            await glue.interop.register(methodDefinition, callbackNeverCalled);
            expect(glue.interop.methods({ name }).length).to.eql(1);
        });

        it('Should return a promise that when resolved notifies that the method has been registered.', async () => {
            await glue.interop.register(methodDefinition, callbackNeverCalled);
            expect(glue.interop.methods({ name }).length).to.eql(1);
        });

        it('Should call the handler with the correct caller Instance when invoked.', (done) => {
            glue.interop.register(methodDefinition, (args, instance) => {
                try {
                    // because deep equal doen't work with those functions
                    instance.getMethods = undefined;
                    instance.getStreams = undefined;

                    const glueAgmInstance = Object.assign({}, glue.interop.instance);
                    glueAgmInstance.getMethods = undefined;
                    glueAgmInstance.getStreams = undefined;

                    expect(instance).to.eql(glueAgmInstance);
                    expect(instance).to.eql(glueAgmInstance);
                    done();
                } catch (err) {
                    done(err);
                }
            }).then(() => {
                glue.interop.invoke(methodDefinition);
            });
        });

        it('Should register a method with the correct name.', async () => {
            await glue.interop.register(methodDefinition, callbackNeverCalled);
            expect(glue.interop.methods().filter(m => m.name === name).length).to.equal(1);
        });

        it('Should register a method with correct accepts when provided (methodDefinition).', async () => {
            methodDefinition.accepts = 'String test';
            await glue.interop.register(methodDefinition, callbackNeverCalled);
            const method = glue.interop.methods({ name })[0];
            expect(method.accepts).to.eql('String test');
        });

        it('Should register a method with correct description when provided (methodDefinition).', async () => {
            methodDefinition.description = 'Random description.';
            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const method = glue.interop.methods({ name })[0];
            expect(method.description).to.eql('Random description.');
        });

        it('Should register a method with correct display when provided (methodDefinition).', async () => {
            methodDefinition.displayName = 'Friendly display name :)';
            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const method = glue.interop.methods({ name })[0];
            expect(method.displayName).to.eql('Friendly display name :)');
        });

        it('Should register a method with correct objectTypes when provided (methodDefinition).', async () => {
            methodDefinition.objectTypes = ['random', 'object', 'type'];
            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const method = glue.interop.methods({ name })[0];
            expect(method.objectTypes).to.eql(['random', 'object', 'type']);
        });

        it('Should register a method with correct returns when provided (methodDefinition).', async () => {
            methodDefinition.returns = 'String test';
            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const method = glue.interop.methods({ name })[0];
            expect(method.returns).to.eql('String test');
        });

        // TODO: dont we have this test
        it('Should register a method with correct supportsStreaming when provided (methodDefinition).', async () => {
            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const method = glue.interop.methods({ name })[0];
            expect(method.supportsStreaming).to.be.false;
        });

        ['string', 5].forEach((type) => {
            it('Should reject when the second parameter is not a function', (done) => {
                glue.interop.register(name, type)
                    .then(() => done('Should not have resolved !'))
                    .catch(() => done());
            });
        });

        it('Should reject when supportsStreaming IS passed as TRUE', (done) => {
            methodDefinition.supportsStreaming = true;
            glue.interop.register(methodDefinition)
                .then(() => done('Should not have resolved !'))
                .catch(() => done());
        });

        it('Should reject when registering a method with the same name as an existing one.', (done) => {
            glue.interop.register(methodDefinition, callbackNeverCalled)
                .then(() => glue.interop.register(methodDefinition, callbackNeverCalled))
                .then(() => done('Should not have resolved !'))
                .catch(() => done());
        });

        it('Should reject when the method/methodDefinition is undefined.', (done) => {
            glue.interop.register(undefined, callbackNeverCalled)
                .then(() => done('Should not have resolved'))
                .catch(() => done());
        });

        it('Should resolve when the method is able to be invoked', async () => {
            await glue.interop.register(name, callbackNeverCalled);
            glue.interop.invoke(name);
        });

        it('Should resolve when the method is contained in the glue.interop.methods() client collection', async () => {
            await glue.interop.register(name, callbackNeverCalled);

            expect(glue.interop.methods({ name }).length).to.eql(1);
        });

        it('Should not mutate the .methods() collection when the methodDefinition object of the registered method is changed', async () => {
            methodDefinition.displayName = 'Should not be mutated';
            await glue.interop.register(methodDefinition, callbackNeverCalled);
            methodDefinition.displayName === 'Mutator';

            expect(glue.interop.methods({ name })[0].displayName).to.equal('Should not be mutated');
        });
    });
});
