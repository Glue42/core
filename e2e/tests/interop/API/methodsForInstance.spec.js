describe('methodsForInstance()', () => {
    let glueApplication;
    const callbackNeverCalled = () => { };

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

    before(() => {
        return coreReady;
    });

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
        await Promise.all([glueApplication.stop(), await gtf.agm.unregisterAllMyNonSystemMethods()]);

        glueApplication = null;
    });

    it('Should return all methods registered by the provided server instance.', (done) => {
        const methods = glue.interop.methodsForInstance(glueApplication.agm.instance).filter((m) => [methodDefinition1.name, methodDefinition2.name, methodDefinition3.name, methodDefinition4.name, methodDefinition5.name].includes(m.name));

        expect(methods.length).to.eql(5);
        done();
    });

    it('Should return an empty array when called with a non-existing server instance.', (done) => {
        expect(glue.interop.methodsForInstance({
            application: 'not-existing-application',
            environment: 'TRAINING',
            machine: 'DESKTOP-Q2H9A9K',
            user: 'ggeorgiev',
        })).to.eql([]);
        done();
    });

    it('Should throw an error when called with undefined.', (done) => {
        try {
            glue.interop.methodsForInstance(undefined);
        } catch (err) {
            done();
        }
    });
});
