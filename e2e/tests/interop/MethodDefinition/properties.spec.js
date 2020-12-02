describe('properties', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.agm.unregisterAllMyNonSystemMethods();
    });

    describe('accepts', () => {
        it('Should set the argument types that the method accepts.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name,
                accepts: 'String test'
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.accepts).to.eql('String test');
        });
    });

    describe('description', () => {
        it('Should set the method\'s description.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name,
                description: 'This is a description.'
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.description).to.eql('This is a description.');
        });
    });

    describe('displayName', () => {
        it('Should set the method\'s displayName.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name,
                displayName: 'Fancy display name'
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.displayName).to.eql('Fancy display name');
        });
    });

    describe('name', () => {
        it('Should set the name of the method.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.name).to.eql(name);
        });
    });

    describe('objectTypes', () => {
        it('Should contain all the object types of the method.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name,
                objectTypes: ['woah', 'rainbow', 'random']
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.objectTypes).to.eql(['woah', 'rainbow', 'random']);
        });
    });

    describe('returns', () => {
        it('Should set the argument types that the method returns.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({
                name,
                returns: 'String test'
            }, callbackNeverCalled);

            const meth = glue.interop.methods().find(m => m.name === name);
            expect(meth.returns).to.eql('String test');
        });
    });

    describe('supportsStreaming', () => {
        it('Should be true for a stream.', async () => {
            const name = gtf.agm.getMethodName();

            await glue.interop.createStream({ name });
            const clientStreams = glue.interop.methods({ name });

            expect(clientStreams).to.not.be.undefined;
            expect(clientStreams[0].supportsStreaming).to.be.true;
        });

        it('Should be false for a method.', async () => {
            const name = gtf.agm.getMethodName();
            await glue.interop.register({ name }, callbackNeverCalled);

            const meth = glue.interop.methods({ name });
            expect(meth).to.not.be.undefined;
            expect(meth[0].supportsStreaming).to.be.false;
        });
    });
});
