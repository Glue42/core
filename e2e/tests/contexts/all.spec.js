describe("all() Should", () => {
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

    it("return an array", async () => {
        const allContexts = glue.contexts.all();

        expect(Array.isArray(allContexts)).to.be.true;
    });

    it("contain the new context after a new context is updated from the same app", async () => {
        await glue.contexts.update(contextName, { test: 42 });

        const allContexts = glue.contexts.all();

        const containsContext = allContexts.indexOf(contextName) >= 0;

        expect(containsContext).to.be.true;
    });

    it("contain the new context after a new context is set from the same app", async () => {
        await glue.contexts.set(contextName, { test: 42 });

        const allContexts = glue.contexts.all();

        const containsContext = allContexts.indexOf(contextName) >= 0;

        expect(containsContext).to.be.true;
    });

    it("contain the new context after a new context is updated from another app", async () => {
        await secondApp.updateContext(contextName, { test: 42 });

        const allContexts = glue.contexts.all();

        const containsContext = allContexts.indexOf(contextName) >= 0;

        expect(containsContext).to.be.true;
    });

    it("contain the new context after a new context is set from the same app", async () => {
        await secondApp.setContext(contextName, { test: 42 });

        const allContexts = glue.contexts.all();

        const containsContext = allContexts.indexOf(contextName) >= 0;

        expect(containsContext).to.be.true;
    });
});