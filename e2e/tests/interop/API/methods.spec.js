describe('methods()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
    });

    describe('AGM discovery: ', () => {
        let glueApplicationOne;
        let glueApplicationTwo;

        let myStreams = [];

        let appOneMethodOptions;
        let appOneStreamOptions;
        let appTwoMethodOptions;
        let appTwoStreamOptions;
        let selfMethodOptions;
        let selfStreamOptions;

        const registerStream = (app, options) => app.agm.createStream(options);

        const createSelfMethod = () => {
            return glue.interop.register(selfMethodOptions, callbackNeverCalled);
        };

        const createSelfStream = () => glue.interop.createStream(selfStreamOptions)
            .then((stream) => {
                myStreams.push(stream);
            });

        beforeEach(() => {
            appOneMethodOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['otherApp'],
                description: 'same description'
            };

            appOneStreamOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['otherStream', 'integration.test'],
                description: 'app one stream'
            };

            appTwoMethodOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['otherApp'],
                description: 'same description'
            };

            appTwoStreamOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['otherStream', 'integration.test']
            };

            selfMethodOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['self'],
                description: 'my method'
            };

            selfStreamOptions = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['selfStream', 'integration.test'],
                description: 'my stream'
            };

            const promiseOne = gtf.createApp()
                .then((glueApplication) => {
                    glueApplicationOne = glueApplication;

                    return Promise.all([glueApplicationOne.agm.registerAsync(appOneMethodOptions, (_, __, success) => {
                        success();
                    }), registerStream(glueApplicationOne, appOneStreamOptions)]);
                });

            const promiseTwo = gtf.createApp()
                .then((glueApplication) => {
                    glueApplicationTwo = glueApplication;

                    return Promise.all([glueApplicationTwo.agm.register(appTwoMethodOptions, () => {
                    }), registerStream(glueApplicationTwo, appTwoStreamOptions)]);
                });

            const promiseThree = Promise.all([createSelfMethod(), createSelfStream()]);

            return Promise.all([promiseOne, promiseTwo, promiseThree]);
        });

        afterEach(async () => {
            await Promise.all([glueApplicationOne.stop(), glueApplicationTwo.stop(), gtf.agm.unregisterMyStreams(myStreams)]);
            glueApplicationOne = null;
            glueApplicationTwo = null;

            myStreams = [];
        });

        describe('Methods discovery: ', () => {
            it('Should discover methods created by me by name', () => {
                const methods = glue.interop.methods().filter(m => m.name === selfMethodOptions.name);
                expect(methods.length).to.eql(1);
            });

            it('Should discover methods created by me by object type', () => {
                const methods = glue.interop.methods().filter(m => m.objectTypes.indexOf(selfMethodOptions.objectTypes[0]) !== -1);

                expect(methods.length).to.eql(1);
            });

            it('Should discover methods created by me using MethodFilter object with name and object types', () => {
                const methodsByMethodFilter = glue.interop.methods(selfMethodOptions);
                expect(methodsByMethodFilter.length).to.eql(1);
                expect(methodsByMethodFilter[0].name).to.eql(selfMethodOptions.name);
            });

            it('Should discover methods created by me using MethodFilter object with object types only', () => {
                const methodsByMethodFilter = glue.interop.methods({
                    objectTypes: selfMethodOptions.objectTypes
                });
                expect(methodsByMethodFilter.length).to.eql(1);
                expect(methodsByMethodFilter[0].name).to.eql(selfMethodOptions.name);
            });

            it('Should discover methods created by me using MethodFilter object with description only', () => {
                const methodsByMethodFilter = glue.interop.methods({
                    description: selfMethodOptions.description
                });
                expect(methodsByMethodFilter.length).to.eql(1);
                expect(methodsByMethodFilter[0].name).to.eql(selfMethodOptions.name);
            });

            it('Should discover methods created by others by name', () => {
                const methods = glue.interop.methods().filter(m => m.name === appOneMethodOptions.name);
                expect(methods.length).to.eql(1);
            });

            it('Should discover methods created by others by object type', () => {
                // ASYNC register does not attach object types
                const methods = glue.interop.methods().filter(m => m.objectTypes.indexOf(appTwoMethodOptions.objectTypes[0]) !== -1);

                expect(methods.length).to.eql(2);
                expect(methods.some(m => m.name === appOneMethodOptions.name)).to.eql(true);
                expect(methods.some(m => m.name === appTwoMethodOptions.name)).to.eql(true);
            });

            it('Should discover methods created by others using MethodFilter object with name and object types', () => {
                const methods = glue.interop.methods(appOneMethodOptions);
                expect(methods.length).to.eql(1);
                expect(methods[0].name).to.eql(appOneMethodOptions.name);
            });

            it('Should discover methods created by others using MethodFilter object with object types only', () => {
                const methodsByMethodFilter = glue.interop.methods({
                    objectTypes: appOneMethodOptions.objectTypes
                });
                expect(methodsByMethodFilter.length).to.eql(2);
                expect(methodsByMethodFilter.some(m => m.name === appOneMethodOptions.name)).to.eql(true);
                expect(methodsByMethodFilter.some(m => m.name === appTwoMethodOptions.name)).to.eql(true);
            });

            it('Should discover methods created by others using MethodFilter object with description only', () => {
                const methodsByMethodFilter = glue.interop.methods({
                    description: appTwoMethodOptions.description
                });
                expect(methodsByMethodFilter.length).to.eql(2);
                expect(methodsByMethodFilter.some(m => m.name === appOneMethodOptions.name)).to.eql(true);
                expect(methodsByMethodFilter.some(m => m.name === appTwoMethodOptions.name)).to.eql(true);
            });
        });

        describe('Streams discovery: ', () => {
            it('Should discover streams created by me by name', () => {
                const streams = glue.interop.methods().filter(m => m.name === selfStreamOptions.name);
                expect(streams.length).to.eql(1);
                expect(streams[0].supportsStreaming).to.eql(true);
            });

            it('Should discover streams created by me by object type', () => {
                const objType = selfStreamOptions.objectTypes[0];
                const streams = glue.interop.methods().filter(m => m.objectTypes.indexOf(objType) !== -1);
                expect(streams.length).to.eql(1);
                expect(streams[0].supportsStreaming).to.eql(true);
            });

            it('Should discover streams created by me by supportStreaming property', () => {
                const streams = glue.interop.methods().filter(m => m.supportsStreaming && m.objectTypes.indexOf('integration.test') !== -1);
                expect(streams.length).to.eql(3);
                expect(streams.some(s => s.name === selfStreamOptions.name));
            });

            it('Should discover streams created by me using MethodFilter object with name and object types', () => {
                const streamsByMethodFilter = glue.interop.methods(selfStreamOptions);
                expect(streamsByMethodFilter.length).to.eql(1);
                expect(streamsByMethodFilter[0].name).to.eql(selfStreamOptions.name);
            });

            it('Should discover streams created by me using MethodFilter object with object types only', () => {
                const streamsByMethodFilter = glue.interop.methods({
                    objectTypes: [selfStreamOptions.objectTypes[0]]
                });
                expect(streamsByMethodFilter.length).to.eql(1);
                expect(streamsByMethodFilter[0].name).to.eql(selfStreamOptions.name);
            });

            it('Should discover streams created by me using MethodFilter object with description only', () => {
                const streamsByMethodFilter = glue.interop.methods({
                    description: selfStreamOptions.description
                });
                expect(streamsByMethodFilter.length).to.eql(1);
                expect(streamsByMethodFilter[0].name).to.eql(selfStreamOptions.name);
            });

            it('Should discover streams created by others by name', () => {
                const streams = glue.interop.methods().filter(m => m.name === appOneStreamOptions.name);
                expect(streams.length).to.eql(1);
                expect(streams[0].supportsStreaming).to.eql(true);
            });

            it('Should discover streams created by others by object type', () => {
                const streams = glue.interop.methods().filter(m => m.objectTypes.indexOf(appTwoStreamOptions.objectTypes[0]) !== -1);
                expect(streams.length).to.eql(2);
                expect(streams[0].supportsStreaming).to.eql(true);
                expect(streams[1].supportsStreaming).to.eql(true);
            });

            it('Should discover streams created by others by supportStreaming propertyShould discover streams created by others by supportStreaming property', () => {
                const streams = glue.interop.methods().filter(m => m.supportsStreaming && m.objectTypes.indexOf('integration.test') !== -1);
                expect(streams.length).to.eql(3);
                expect(streams.some(s => s.name === appOneStreamOptions.name));
                expect(streams.some(s => s.name === appTwoStreamOptions.name));
            });

            it('Should discover streams created by others using MethodFilter object, when the object has name and object types', () => {
                const streams = glue.interop.methods(appTwoStreamOptions);
                expect(streams.length).to.eql(1);
                expect(streams[0].name).to.eql(appTwoStreamOptions.name);
            });

            it('Should discover streams created by others using MethodFilter object, when the object has object types only', () => {
                const streamsByMethodFilter = glue.interop.methods({
                    objectTypes: [appOneStreamOptions.objectTypes[0]]
                });
                expect(streamsByMethodFilter.length).to.eql(2);
                expect(streamsByMethodFilter.some(m => m.name === appOneStreamOptions.name)).to.eql(true);
                expect(streamsByMethodFilter.some(m => m.name === appTwoStreamOptions.name)).to.eql(true);
            });

            it('Should discover streams created by others using MethodFilter object, when the object has description only', () => {
                const streamsByMethodFilter = glue.interop.methods({
                    description: appOneStreamOptions.description
                });
                expect(streamsByMethodFilter.length).to.eql(1);
                expect(streamsByMethodFilter[0].name).to.eql(appOneStreamOptions.name);
            });
        });

        describe('Server discovery: ', () => {
            it('Should discover self by self-registered method, when passing MethodFilter with name and object types', () => {
                const server = glue.interop.servers(selfMethodOptions);
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover self by self-registered stream, when passing MethodFilter with name and object types', () => {
                const server = glue.interop.servers(selfStreamOptions);
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover self by self-registered method, when passing only name', () => {
                const server = glue.interop.servers({
                    name: selfMethodOptions.name
                });
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover self by self-registered method, when passing only object type', () => {
                const server = glue.interop.servers({
                    objectTypes: ['self']
                });
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
                expect(server[0].application.includes(RUNNER)).to.eql(true);
            });

            it('Should discover others by registered methods, when passing MethodFilter with name and object types', () => {
                const server = glue.interop.servers(appOneMethodOptions);
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover others by registered methods, when passing only name', () => {
                const server = glue.interop.servers({
                    name: appTwoMethodOptions.name
                });
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover others by registered methods, when passing only description', () => {
                const server = glue.interop.servers({
                    description: 'same description'
                });
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(2);
            });

            it('Should discover other by registered streams, when passing MethodFilter with name and object types', () => {
                const server = glue.interop.servers(appTwoStreamOptions);
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(1);
            });

            it('Should discover all others by registered streams\' object types ', () => {
                const server = glue.interop.servers({
                    objectTypes: [appTwoStreamOptions.objectTypes[0]]
                });
                expect(server).to.not.be.undefined;
                expect(server.length).to.eql(2);
            });

            it('Should discover correct methods (methods and streams) using getMethods() after the instance is received from .servers()', () => {
                const server = glue.interop.servers(appOneMethodOptions)[0];
                const methods = server.getMethods();

                expect(methods).to.not.be.undefined;
                expect(methods.length >= 2).to.eql(true);
                expect(methods.some(m => m.name === appOneMethodOptions.name)).to.eql(true);
                expect(methods.some(m => m.name === appOneStreamOptions.name)).to.eql(true);
            });

            it('Should discover correct streams using getStreams() after the instance is received from .servers()', () => {
                const server = glue.interop.servers(appTwoStreamOptions)[0];
                const streams = server.getStreams();

                expect(streams).to.not.be.undefined;
                expect(streams.length).to.eql(1);
                expect(streams[0].name).to.eql(appTwoStreamOptions.name);
                expect(streams[0].supportsStreaming).to.eql(true);
            });

            it('Should discover my methods when I get my instance from .servers() and pass it to methodsForInstance()', () => {
                const myInstance = glue.interop.servers(selfMethodOptions)[0];
                const myMethods = glue.interop.methodsForInstance(myInstance);
                expect(myMethods).to.not.be.undefined;
                expect(myMethods.length >= 2).to.eql(true);
            });

            it('Should discover others\' methods when I get their instance from .servers() and pass it to methodsForInstance()', () => {
                const otherInstance = glue.interop.servers(appOneMethodOptions)[0];
                const otherMethods = glue.interop.methodsForInstance(otherInstance);
                expect(otherMethods).to.not.be.undefined;
                expect(otherMethods.length >= 2).to.eql(true);
            });
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

        it('Methods().find should return a valid methodDefinition object', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === fullMethodOptions.name);
                    try {
                        checkMethodDefinition(m);
                        done();
                        un();
                    } catch (error) {
                        done(error);
                    }
                }
            });

            glue.interop.register(fullMethodOptions, callbackNeverCalled);
        });

        it('Methods() should return an array of valid methodDefinition objects', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {

                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === fullMethodOptions.name);
                    try {
                        checkMethodDefinition(m);
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

        it('Methods() should return an array of valid methodDefinition objects', (done) => {
            const ready = gtf.waitFor(2, done);

            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {

                if (method.name !== fullMethodOptions.name) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === fullMethodOptions.name);
                    try {
                        checkMethodDefinition(m, true);
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

        it('Should correctly filter when flags are provided - no results (methodDefinition).', async () => {
            await glue.interop.register(fullMethodOptions, callbackNeverCalled);

            const matchingMethods = glue.interop.methods({ flags: { b: { c: 42 } } });
            expect(matchingMethods).to.be.empty;
        });
        it('Should correctly filter when flags are provided - single results (methodDefinition).', async () => {
            await glue.interop.register(fullMethodOptions, callbackNeverCalled);

            const matchingMethods = glue.interop.methods({ flags: { a: 'test' } });
            expect(matchingMethods).to.be.of.length(1);
            expect(matchingMethods[0].name).to.equal(fullMethodOptions.name);
        });

        it('Should correctly filter when flags are provided - multiple results (methodDefinition).', async () => {
            await glue.interop.register(fullMethodOptions, callbackNeverCalled);
            const otherName = gtf.agm.getMethodName();
            await glue.interop.register({ ...fullMethodOptions, name: otherName }, callbackNeverCalled);

            const matchingMethods = glue.interop.methods({ flags: { a: 'test' } });
            const matchingMethodsNames = matchingMethods.map((method) => method.name);
            expect(matchingMethods).to.be.of.length(2);
            expect(matchingMethodsNames).to.include.members([otherName, fullMethodOptions.name]);
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

        it('Methods() should return an array of valid methodDefinition objects', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {

                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === methodName);
                    try {
                        checkMethodDefinition(m);
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

        it('Methods() should return an array of valid methodDefinition objects', (done) => {
            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === methodName);
                    try {
                        checkMethodDefinition(m);
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

        it('Methods() should return an array of valid methodDefinition objects', (done) => {
            const ready = gtf.waitFor(2, done);

            const un = glue.interop.serverMethodAdded(({
                server,
                method
            }) => {
                if (method.name !== methodName) {
                    return;
                }

                if (gtf.agm.compareServers(server, glue.interop.instance)) {

                    const m = glue.interop.methods().find(x => x.name === methodName);
                    try {
                        checkMethodDefinition(m, true);
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

    describe('methods()', () => {
        let glueApplication;

        const accepts1 = 'String test1';
        const description1 = 'Description1';
        const displayName1 = 'DisplayName1';
        const objectTypes1 = ['objectTypes1'];
        const returns1 = 'String test1';
        const methodDefinition1 = {
            accepts: accepts1,
            description: description1,
            displayName: displayName1,
            objectTypes: objectTypes1,
            returns: returns1,
        };

        const accepts2 = 'String test2';
        const description2 = 'Description2';
        const displayName2 = 'DisplayName2';
        const objectTypes2 = ['objectTypes2'];
        const returns2 = 'String test2';
        const methodDefinition2 = {
            accepts: accepts2,
            description: description2,
            displayName: displayName2,
            objectTypes: objectTypes2,
            returns: returns2,
        };

        const accepts3 = 'String test3';
        const description3 = 'Description3';
        const displayName3 = 'DisplayName3';
        const objectTypes3 = ['objectTypes3'];
        const returns3 = 'String test3';
        const methodDefinition3 = {
            accepts: accepts3,
            description: description3,
            displayName: displayName3,
            objectTypes: objectTypes3,
            returns: returns3,
        };

        const accepts4 = 'String test4';
        const description4 = 'Description4';
        const displayName4 = 'DisplayName4';
        const objectTypes4 = ['objectTypes4'];
        const returns4 = 'String test4';
        const methodDefinition4 = {
            accepts: accepts4,
            description: description4,
            displayName: displayName4,
            objectTypes: objectTypes4,
            returns: returns4,
        };

        const accepts5 = 'String test5';
        const description5 = 'Description5';
        const displayName5 = 'DisplayName5';
        const objectTypes5 = ['objectTypes5'];
        const returns5 = 'String test5';
        const methodDefinition5 = {
            accepts: accepts5,
            description: description5,
            displayName: displayName5,
            objectTypes: objectTypes5,
            returns: returns5,
        };

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplication = app;
                methodDefinition1.name = gtf.agm.getMethodName();
                methodDefinition2.name = gtf.agm.getMethodName();
                methodDefinition3.name = gtf.agm.getMethodName();
                methodDefinition4.name = gtf.agm.getMethodName();
                methodDefinition5.name = gtf.agm.getMethodName();

                const promise1 = glueApplication.agm.register(methodDefinition1, callbackNeverCalled);
                const promise2 = glueApplication.agm.register(methodDefinition2, callbackNeverCalled);
                const promise3 = glueApplication.agm.register(methodDefinition3, callbackNeverCalled);
                const promise4 = glueApplication.agm.register(methodDefinition4, callbackNeverCalled);
                const promise5 = glueApplication.agm.register(methodDefinition5, callbackNeverCalled);

                return Promise.all([promise1, promise2, promise3, promise4, promise5]);
            }));

        afterEach(async () => {
            await glueApplication.stop();

            glueApplication = null;
        });

        it('Should return all methods when no filter is provided.', (done) => {
            expect(glue.interop.methods().filter((m) => [methodDefinition1.name, methodDefinition2.name, methodDefinition3.name, methodDefinition4.name, methodDefinition5.name].includes(m.name)).length).to.eql(5);
            done();
        });

        it('Should return all methods that match the accepts property inside the filter.', (done) => {
            expect(glue.interop.methods({
                accepts: 'String test1'
            }).length).to.eql(1);
            done();
        });

        it('Should return all methods that match the description property inside the filter.', (done) => {
            expect(glue.interop.methods({
                description: 'Description1'
            }).length).to.eql(1);
            done();
        });

        it('Should return all methods that match the displayName property inside the filter.', (done) => {
            expect(glue.interop.methods({
                displayName: 'DisplayName1'
            }).length).to.eql(1);
            done();
        });

        it('Should return all methods that match the name property inside the filter.', (done) => {
            expect(glue.interop.methods({
                name: methodDefinition1.name
            }).length).to.eql(1);
            done();
        });

        it('Should return all methods that match the objectTypes property inside the filter.', (done) => {
            expect(glue.interop.methods({
                objectTypes: ['objectTypes1']
            }).length).to.eql(1);
            done();
        });

        it('Should return all methods that match the returns property inside the filter.', (done) => {
            expect(glue.interop.methods({
                returns: 'String test1'
            }).length).to.eql(1);
            done();
        });

        it('Should return an empty array when there is a method with the name property inside the filter, but another accepts property.', (done) => {
            expect(glue.interop.methods({
                name: methodDefinition1.name,
                accepts: 'String test2'
            }).length).to.eql(0);
            done();
        });

        it('Should return an empty array when called with name property inside the filter of a non-existing method.', (done) => {
            expect(glue.interop.methods({
                name: gtf.agm.getMethodName()
            }).length).to.eql(0);
            done();
        });

        it('Should return 1 method when it is registered and filtered with full method definition', async () => {
            const fullMethodDefinition = {
                name: gtf.agm.getMethodName(),
                accepts: 'int a',
                returns: 'int b',
                description: 'awesome test',
                objectTypes: ['DontFail!'],
                version: 42,
                displayName: 'Awesome Method',
            };

            await glue.interop.register(fullMethodDefinition, callbackNeverCalled);
            const methods = glue.interop.methods(fullMethodDefinition);
            expect(methods.length).to.equal(1);

            await glue.interop.unregister(fullMethodDefinition);
        });

        it('Should filter correctly when provided 2 out of 3 object types', async () => {
            const methodDefinition = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['<>', 'Awesome', 'Test'],
            };

            await glue.interop.register(methodDefinition, callbackNeverCalled);
            const methods = glue.interop.methods({
                objectTypes: ['<>', 'Awesome']
            });

            expect(methods.length).to.equal(1);

            await glue.interop.unregister(methodDefinition);
        });

        it('Should return empty when provided 3 out of 2 object types', async () => {
            const methodDefinition = {
                name: gtf.agm.getMethodName(),
                objectTypes: ['<>', 'Awesome'],
            };

            await glue.interop.register(methodDefinition, callbackNeverCalled);

            const methods = glue.interop.methods({
                objectTypes: ['<>', 'Awesome', 'Test']
            });

            expect(methods.length).to.equal(0);

            await glue.interop.unregister(methodDefinition);
        });

        it('Should be able to filter with previously returned from methods()[] invocation', async () => {
            const randomMethodDef = glue.interop.methods()[0];

            const methods = glue.interop.methods(randomMethodDef);

            expect(methods.length).to.not.equal(0);
        });
    });
});
