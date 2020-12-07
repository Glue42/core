describe('serverRemoved()', () => {
    let glueApplication;
    let name;
    let methodDefinition;

    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    beforeEach(async () => {
        glueApplication = await gtf.createApp();

        name = gtf.agm.getMethodName();
        methodDefinition = {
            name
        };

        await glueApplication.agm.register(methodDefinition, callbackNeverCalled);
    });

    afterEach(async () => {
        await Promise.all([gtf.agm.unregisterAllMyNonSystemMethods(), gtf.clearWindowActiveHooks()]);

        glueApplication = null;
    });

    it('Should return a working unsubscribe function when triggered.', (done) => {
        const timeout = gtf.wait(3000, () => done());
        const un = glue.interop.serverRemoved(() => {
            timeout.cancel();
            done('Should not be called.');
        });
        if (un) {
            un();
        }
        glueApplication.stop();
    });

    it('Should call the callback with the correct Instance.', (done) => {
        const un = glue.interop.serverRemoved((instance) => {
            if (instance.application === glueApplication.agm.instance.application) {
                done();
            }
        });
        gtf.addWindowHook(un);
        glueApplication.stop();
    });

    it('Should verify that the action really took place.', (done) => {
        const un = glue.interop.serverRemoved((server) => {
            try {
                expect(glue.interop.servers().filter(s => s.instance === server.instance).length).to.eql(0);
                done();
            } catch (err) {
                done(err);
            }
        });
        gtf.addWindowHook(un);
        glueApplication.stop();
    });

    it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
        const un = glue.interop.serverRemoved(() => {
            timeout.cancel();
            done('Should not be called.');
        });
        const timeout = gtf.wait(3000, () => {
            if (un) {
                un();
            }
            glueApplication.stop();
            done();
        });
    });
});
