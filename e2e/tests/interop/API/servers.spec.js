describe('servers()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);
    });

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
            flags: { a: 'test' },
            description: 'same description'
        };

        appOneStreamOptions = {
            name: gtf.agm.getMethodName(),
            objectTypes: ['otherStream', 'integration.test'],
            flags: { a: 'test', b: true },
            description: 'app one stream'
        };

        appTwoMethodOptions = {
            name: gtf.agm.getMethodName(),
            objectTypes: ['otherApp'],
            flags: { a: 'test', b: true, c: 42 },
            description: 'same description'
        };

        appTwoStreamOptions = {
            name: gtf.agm.getMethodName(),
            objectTypes: ['otherStream', 'integration.test'],
            flags: { a: 'test', b: true, c: 42, d: ['43'] }
        };

        selfMethodOptions = {
            name: gtf.agm.getMethodName(),
            objectTypes: ['self'],
            flags: { a: 'test', b: true, c: 42, d: ['43'], e: { f: 44 } },
            description: 'my method'
        };

        selfStreamOptions = {
            name: gtf.agm.getMethodName(),
            objectTypes: ['selfStream', 'integration.test'],
            flags: { a: 'test', b: true, c: 42, d: ['43'], e: { f: 44 }, g: { h: { i: '45' } } },
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

    describe('Server discovery: ', () => {
        it('Should discover self by self-registered method, when passing MethodFilter with name and object types', () => {
            const server = glue.interop.servers({ ...selfMethodOptions, flags: selfMethodOptions.flags });
            expect(server).to.not.be.undefined;
            expect(server.length).to.eql(1);
        });

        it('Should discover self by self-registered stream, when passing MethodFilter with name and object types', () => {
            const server = glue.interop.servers({ ...selfStreamOptions, flags: selfStreamOptions.flags });
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

        it('Should discover self by self-registered method, when passing only object type.', () => {
            const server = glue.interop.servers({
                objectTypes: ['self']
            });
            expect(server).to.not.be.undefined;
            expect(server.length).to.eql(1);
            expect(server[0].application.includes(RUNNER)).to.eql(true);
        });

        it('Should discover others by registered methods, when passing MethodFilter with name and object types', () => {
            const server = glue.interop.servers({ ...appOneMethodOptions, flags: appOneMethodOptions.flags });
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
            const server = glue.interop.servers({ ...appTwoStreamOptions, flags: appTwoStreamOptions.flags });
            expect(server).to.not.be.undefined;
            expect(server.length).to.eql(1);
        });

        it('Should discover all others by registered streams\'s object types', () => {
            const server = glue.interop.servers({
                objectTypes: [appTwoStreamOptions.objectTypes[0]]
            });
            expect(server).to.not.be.undefined;
            expect(server.length).to.eql(2);
        });

        it('Should discover correct methods (methods and streams) using getMethods() after the instance is received from .servers()', () => {
            const server = glue.interop.servers({ ...appOneMethodOptions, flags: appOneMethodOptions.flags })[0];
            const methods = server.getMethods();

            expect(methods).to.not.be.undefined;
            expect(methods.length >= 2).to.eql(true);
            expect(methods.some(m => m.name === appOneMethodOptions.name)).to.eql(true);
            expect(methods.some(m => m.name === appOneStreamOptions.name)).to.eql(true);
        });

        it('Should discover correct streams using getStreams() after the instance is received from .servers()', () => {
            const server = glue.interop.servers({ ...appTwoStreamOptions, flags: appTwoStreamOptions.flags })[0];
            const streams = server.getStreams();

            expect(streams).to.not.be.undefined;
            expect(streams.length).to.eql(1);
            expect(streams[0].name).to.eql(appTwoStreamOptions.name);
            expect(streams[0].supportsStreaming).to.eql(true);
        });

        it('Should discover my methods when I get my instance from .servers() and pass it to methodsForInstance()', () => {
            const myInstance = glue.interop.servers({ ...selfMethodOptions, flags: selfMethodOptions.flags })[0];
            const myMethods = glue.interop.methodsForInstance(myInstance);
            expect(myMethods).to.not.be.undefined;
            expect(myMethods.length >= 2).to.eql(true);
        });

        it('Should discover others\' methods when I get their instance from .servers() and pass it to methodsForInstance()', () => {
            const otherInstance = glue.interop.servers({ ...appOneMethodOptions, flags: appOneMethodOptions.flags })[0];
            const otherMethods = glue.interop.methodsForInstance(otherInstance);
            expect(otherMethods).to.not.be.undefined;
            expect(otherMethods.length >= 2).to.eql(true);
        });

        it('Should correctly filter when flags are provided (methodDefinition).', async () => {
            let matchingServers = glue.interop.servers({ flags: { g: 'g' } });
            expect(matchingServers).to.be.empty;
            matchingServers = glue.interop.servers({ flags: { a: 'test' } });
            expect(matchingServers).to.be.of.length(3);
            matchingServers = glue.interop.servers({ flags: { b: true } });
            expect(matchingServers).to.be.of.length(3);
            matchingServers = glue.interop.servers({ flags: { c: 42 } });
            expect(matchingServers).to.be.of.length(2);
            matchingServers = glue.interop.servers({ flags: { d: ['43'] } });
            expect(matchingServers).to.be.of.length(2);
            matchingServers = glue.interop.servers({ flags: { e: { f: 44 } } });
            expect(matchingServers).to.be.of.length(1);
            matchingServers = glue.interop.servers({ flags: { g: { h: { i: '45' } } } });
            expect(matchingServers).to.be.of.length(1);
        });
    });
});
