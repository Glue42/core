describe('clear() ', function () {
    let definitionsOnStart;
    let unsubs = [];
    let timeout;

    const extraDefOne = {
        name: "ExtraOne",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };

    const extraDefTwo = {
        name: "ExtraTwo",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };


    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
        await glue.appManager.inMemory.import([]);
    });

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }

        await glue.appManager.inMemory.import([]);

        if (unsubs.length) {
            unsubs.forEach((un) => un());
            unsubs = [];
        }
    });

    after(() => glue.appManager.inMemory.import(definitionsOnStart, "replace"));

    it('should return a promise', async () => {
        const clearPromise = glue.appManager.inMemory.clear();

        expect(clearPromise.then).to.be.a("function");
        expect(clearPromise.catch).to.be.a("function");

        await clearPromise;
    });

    it('should resolve and do not change state if no definitions initially', async () => {
        const beforeDefs = await glue.appManager.inMemory.export();
        const beforeApps = glue.appManager.applications();

        await glue.appManager.inMemory.clear();

        const afterDefs = await glue.appManager.inMemory.export();
        const afterApps = glue.appManager.applications();

        expect(beforeApps).to.eql(afterApps);
        expect(beforeDefs).to.eql(afterDefs);
    });

    it('should resolve and not notify about removed definitions if no definitions initially', (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        const unsub = glue.appManager.onAppRemoved((app) => {
            done(`Received unexpected app removed event for: ${app.name}`);
        });

        unsubs.push(unsub);

        glue.appManager.inMemory.clear().then(ready).catch(done);
    });

    it('should remove all definitions if one definition present', async () => {
        await glue.appManager.inMemory.import([extraDefOne]);
        await glue.appManager.inMemory.clear();

        const afterDefs = await glue.appManager.inMemory.export();
        const afterApps = glue.appManager.applications();

        expect(afterDefs).to.eql([]);
        expect(afterApps).to.eql([]);
    });

    it('should notify of a correct removed definition if one definitions was present', (done) => {
        const ready = gtf.waitFor(2, done);

        glue.appManager.inMemory.import([extraDefOne])
            .then(() => {
                const unsub = glue.appManager.onAppRemoved((app) => {
                    try {
                        expect(app.name).to.eql(extraDefOne.name);
                        ready();
                    } catch (error) {
                        done(error);
                    }
                });

                unsubs.push(unsub);

                return glue.appManager.inMemory.clear();
            })
            .then(ready).catch(done);

    });

    it('should remove all definition if two definitions were present', async () => {
        await glue.appManager.inMemory.import([extraDefOne, extraDefTwo]);
        await glue.appManager.inMemory.clear();

        const afterDefs = await glue.appManager.inMemory.export();
        const afterApps = glue.appManager.applications();

        expect(afterDefs).to.eql([]);
        expect(afterApps).to.eql([]);
    });

    it('should notify of two correct removed definition if two definitions were present', (done) => {
        const ready = gtf.waitFor(3, done);
        const expectedNames = [extraDefOne.name, extraDefTwo.name];

        glue.appManager.inMemory.import([extraDefOne, extraDefTwo])
            .then(() => {
                const unsub = glue.appManager.onAppRemoved((app) => {
                    try {
                        
                        if (!expectedNames.length) {
                            done("No more definitions are expected as removed");
                            return;
                        }

                        const foundAppIndex = expectedNames.findIndex((n) => n === app.name);

                        expect(foundAppIndex >= 0).to.be.true;

                        expectedNames.splice(foundAppIndex, 1);
                        ready();
                    } catch (error) {
                        done(error);
                    }
                });

                unsubs.push(unsub);

                return glue.appManager.inMemory.clear();
            })
            .then(ready).catch(done);
    });

});
