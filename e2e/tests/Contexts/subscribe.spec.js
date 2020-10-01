describe("subscribe() Should", () => {
    let contextName;
    let secondApp;
    before(async () => {
        await coreReady;
        secondApp = await gtf.createApp();
    });

    after(() => {
        return secondApp.stop();
    });

    beforeEach(() => {
        contextName = gtf.getWindowName("gtfContext");
    });

    it("be invoked when a context is updated and is invoked after the context was created", (done) => {
        const sampleContext = { test: 1 };
        secondApp.updateContext(contextName, sampleContext).then(() => {
            return glue.contexts.subscribe(contextName, () => {
                done();
            });
        }).then(() => {
            return secondApp.updateContext(contextName, { test: 2 });
        }).catch(done);;
    });

    it("be invoked when a context is set and is invoked after the context was created", (done) => {
        const sampleContext = { test: 1 };
        secondApp.setContext(contextName, sampleContext).then(() => {
            return glue.contexts.subscribe(contextName, () => {
                done();
            });

        }).then(() => {
            return secondApp.setContext(contextName, { test: 2 });
        }).catch(done);;
    });

    it("be invoked when a context is updated and is invoked before the context was created", (done) => {
        glue.contexts.subscribe(contextName, () => {
            done();
        }).then(() => {
            return secondApp.updateContext(contextName, { test: 2 });
        }).catch(done);;
    });

    it("be invoked when a context is set and is invoked before the context was created", (done) => {
        glue.contexts.subscribe(contextName, () => {
            done();
        }).then(() => {
            return secondApp.setContext(contextName, { test: 2 });
        }).catch(done);;
    });

    it("be invoked with the correct context when a context is updated and is invoked after the context was created", (done) => {
        const sampleContext = { test: 1 };
        const secondContext = { test: 2 };
        secondApp.updateContext(contextName, sampleContext).then(() => {
            return glue.contexts.subscribe(contextName, (c) => {
                if (c.test === secondContext.test) {
                    done();
                }
            });

        }).then(() => {
            secondApp.updateContext(contextName, secondContext).catch(done);;
        }).catch(done);;
    });

    it("be invoked with the correct when a context is set and is invoked after the context was created", (done) => {
        const sampleContext = { test: 1 };
        const secondContext = { test: 2 };
        secondApp.setContext(contextName, sampleContext).then(() => {
            glue.contexts.subscribe(contextName, (c) => {
                if (c.test === secondContext.test) {
                    done();
                }
            }).then(() => {
                secondApp.setContext(contextName, secondContext).catch(done);;
            }).catch(done);;

        }).catch(done);;
    });

    it("be invoked when a context is updated and is invoked before the context was created", (done) => {
        const sampleContext = { test: 1 };
        glue.contexts.subscribe(contextName, (c) => {
            if (c.test === sampleContext.test) {
                done();
            }
        }).then((unsub) => {
            return secondApp.updateContext(contextName, sampleContext);
        }).catch(done);;
    });

    it("be invoked when a context is set and is invoked before the context was created", (done) => {
        const sampleContext = { test: 1 };
        glue.contexts.subscribe(contextName, (c) => {
            if (c.test === sampleContext.test) {
                done();
            }
        }).then((unsub) => {
            return secondApp.setContext(contextName, sampleContext);
        }).catch(done);
    });

    it("unsubscribe successfully when the unsubscribe function is invoked", (done) => {
        setTimeout(() => {
            done()
        }, 3000);

        glue.contexts.subscribe(contextName, (c) => {
            done("Should not resolve");
        }).then((unsub) => {
            unsub();

            return secondApp.setContext(contextName, { test: 1 });
        }).catch(done);
    });
});