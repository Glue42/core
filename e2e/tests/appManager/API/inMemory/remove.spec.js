describe('remove() ', function () {
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


    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    afterEach(async () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }

        await glue.appManager.inMemory.import(definitionsOnStart, "replace");

        if (unsubs.length) {
            unsubs.forEach((un) => un());
            unsubs = [];
        }
    });

    it("should return a promise and resolve when the name is a valid string", async () => {
        const appsDeletePromise = glue.appManager.inMemory.remove("test");

        expect(appsDeletePromise.then).to.be.a("function");
        expect(appsDeletePromise.catch).to.be.a("function");

        await appsDeletePromise;
    });

    [
        undefined,
        null,
        42,
        true,
        [],
        {}
    ].forEach((name) => {
        it("should reject when the provided argument is not a string", (done) => {
            glue.appManager.inMemory.remove(name)
                .then(() => {
                    done(`Should not have resolve, because the provided name is not valid: ${JSON.stringify(name)}`)
                })
                .catch(() => {
                    done();
                });
        });
    });

    it("the system should not have the definition present after remove resolved (export check)", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const appsBefore = await glue.appManager.inMemory.export();

        expect(appsBefore.some((app) => app.name === extraDefOne.name)).to.be.true;

        await glue.appManager.inMemory.remove(extraDefOne.name);

        const appsAfter = await glue.appManager.inMemory.export();

        expect(appsAfter.some((app) => app.name === extraDefOne.name)).to.be.false;
    });

    it("the system should not have the definition present after remove resolved (applications check)", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const appsBefore = glue.appManager.applications();

        expect(appsBefore.some((app) => app.name === extraDefOne.name)).to.be.true;

        await glue.appManager.inMemory.remove(extraDefOne.name);

        const appsAfter = glue.appManager.applications();

        expect(appsAfter.some((app) => app.name === extraDefOne.name)).to.be.false;
    });

    it("removed event should be fired when remove actually removes a definition", (done) => {
        const ready = gtf.waitFor(2, done);

        const setUpEvent = () => {
            const unsub = glue.appManager.onAppRemoved((app) => {
                if (app.name === extraDefOne.name) {
                    ready();
                } else {
                    done(`Received unexpected app removed event for: ${app.name}`);
                }
            });

            unsubs.push(unsub);
        };

        setUpEvent();
        glue.appManager.inMemory.import([extraDefOne], "merge")
            .then(() => {
                return glue.appManager.inMemory.remove(extraDefOne.name);
            })
            .then(ready)
            .catch(done);
    });

    it("removed event should not be fired when remove doesn't remove a definition, because it was not present", (done) => {
        const ready = gtf.waitFor(2, done);

        timeout = setTimeout(ready, 3000);

        const setUpEvent = () => {
            const unsub = glue.appManager.onAppRemoved((app) => {
                done(`Received unexpected app removed event for: ${app.name}`);
            });

            unsubs.push(unsub);
        };

        setUpEvent();

        glue.appManager.inMemory.remove(extraDefOne.name)
            .then(ready)
            .catch(done);
    });

});
