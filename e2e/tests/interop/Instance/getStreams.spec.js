describe('getStreams()', () => {
    let myStreams = [];
    let name1;
    let name2;
    let name3;

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        name1 = gtf.agm.getMethodName();
        name2 = gtf.agm.getMethodName();
        name3 = gtf.agm.getMethodName();

        myStreams = await Promise.all([
            glue.interop.createStream({ name: name1 }),
            glue.interop.createStream({ name: name2 }),
            glue.interop.createStream({ name: name3 }),
        ]);
    });

    afterEach(async () => {
        await Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.agm.unregisterMyStreams(myStreams)]);

        myStreams = [];
    });

    it('Should return the same count of method like .methodsForInstance.', async () => {
        const getMethodResult = glue.interop.instance.getStreams();
        const methodResult = glue.interop.methodsForInstance(glue.interop.instance).filter(m => m.supportsStreaming);

        expect(getMethodResult.length).to.equal(methodResult.length);
    });


    it('Should return all streams registered by that instance.', (done) => {
        try {
            const allStreams = glue.interop.instance.getStreams();
            expect([name1, name2, name3].every(myName => allStreams.some(serverS => serverS.name === myName))).to.equal(true);
            done();
        } catch (err) {
            done(err);
        }
    });
});
