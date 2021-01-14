describe('getMethods()', () => {
    let name1;
    let name2;
    let name3;

    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    beforeEach(() => {
        name1 = gtf.agm.getMethodName();
        name2 = gtf.agm.getMethodName();
        name3 = gtf.agm.getMethodName();

        return Promise.all([
            glue.interop.register(name1, callbackNeverCalled),
            glue.interop.register(name2, callbackNeverCalled),
            glue.interop.register(name3, callbackNeverCalled)
        ]);
    });

    afterEach(() => {
        return gtf.agm.unregisterAllMyNonSystemMethods();
    });

    it('Should return the same count of method like .methodsForInstance.', async () => {
        const getMethodResult = glue.interop.instance.getMethods();
        const methodResult = glue.interop.methodsForInstance(glue.interop.instance);

        expect(getMethodResult.length).to.equal(methodResult.length);
    });

    it('Should return all methods registered by that instance.', async () => {
        const allMethods = glue.interop.instance.getMethods();
        expect([name1, name2, name3].every(myName => allMethods.some((сMethod) => сMethod.name === myName))).to.equal(true);
    });
});
