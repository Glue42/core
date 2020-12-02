describe('serverAdded()', () => {
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    describe('AGM events about other servers\' actions: ', () => {
        let glueApplicationOne;
        let glueApplicationTwo;

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplicationOne = app;
            }));

        afterEach(async () => {
            await Promise.all([glueApplicationOne.stop(), gtf.clearWindowActiveHooks()]);

            glueApplicationOne = null;

            if (glueApplicationTwo) {
                await glueApplicationTwo.stop();

                glueApplicationTwo = null;
            }
        });

        it('Should receive serverAdded event when a server is started.', (done) => {
            let receivedServerNotifications = [];

            gtf.wait(3000, () => {
                try {
                    expect(receivedServerNotifications.length).to.eql(1);
                    done();
                } catch (error) {
                    done(error);
                }
            }).catch(done);

            gtf.createApp()
                .then((app) => {
                    glueApplicationTwo = app;

                    const un = glue.interop.serverAdded((server) => {
                        if (gtf.agm.compareServers(server, glueApplicationTwo.agm.instance)) {
                            receivedServerNotifications.push(server);
                        }
                    });
                    gtf.addWindowHook(un);
                });
        });
    });

    describe('serverAdded()', () => {
        let glueApplication;

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplication = app;
            }));

        afterEach(async () => {
            await Promise.all([glueApplication.stop(), gtf.clearWindowActiveHooks()]);

            glueApplication = null;
        });

        it('Should return a working unsubscribe function when triggered.', (done) => {
            const timeout = gtf.wait(3000, () => done());

            const un = glue.interop.serverAdded((server) => {
                const valid = gtf.agm.compareServers(glueApplication.agm.instance, server);
                if (valid) {
                    timeout.cancel();
                    done('Should not be triggered.');
                }
            });
            if (typeof un === 'function') {
                un();
            }
            glueApplication.agm.register(gtf.agm.getMethodName(), callbackNeverCalled);
        });

        it('Should call the callback with the correct Instance.', (done) => {
            const un = glue.interop.serverAdded((server) => {
                const valid = gtf.agm.compareServers(glueApplication.agm.instance, server);
                if (valid) {
                    done();
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(gtf.agm.getMethodName(), callbackNeverCalled);
        });

        it('Should verify that the action really took place.', (done) => {
            const un = glue.interop.serverAdded((server) => {
                const valid = gtf.agm.compareServers(glueApplication.agm.instance, server);
                if (valid) {
                    try {
                        const newServer = glue.interop.servers().find(s => gtf.agm.compareServers(glueApplication.agm.instance, s));
                        expect(newServer).to.not.be.undefined;
                        done();
                    } catch (err) {
                        done(err);
                    }
                }
            });
            gtf.addWindowHook(un);
            glueApplication.agm.register(gtf.agm.getMethodName(), callbackNeverCalled);
        });

        it('Should return the unsubFunc BEFORE the first callback gets called', (done) => {
            const un = glue.interop.serverAdded(() => {
                try {
                    expect(typeof un).to.eql('function');
                    un();
                    done();
                } catch (e) {
                    done(e);
                }
            });

            gtf.addWindowHook(un);
        });
    });
});
