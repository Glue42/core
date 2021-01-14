describe('import() ', function () {
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

    let definitionsOnStart;
    let unsubs = [];
    let timeout;

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    afterEach(async () => {
        extraDefOne.customProperties.includeInWorkspaces = true;
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

    describe('basic ', () => {
        it('should return a promise and resolve when the provided args are valid', async () => {
            const appsImportPromise = glue.appManager.inMemory.import([], "merge");

            expect(appsImportPromise.then).to.be.a("function");
            expect(appsImportPromise.catch).to.be.a("function");

            await appsImportPromise;
        });

        it('importing the exported definitions should not make any changes to the definitions', async () => {
            await glue.appManager.inMemory.import(definitionsOnStart);
            const currentDefinitions = await glue.appManager.inMemory.export();

            expect(currentDefinitions).to.eql(definitionsOnStart);
        });

        const invalidArgs = [
            { definitions: [], mode: true },
            { definitions: [], mode: 42 },
            { definitions: [], mode: [] },
            { definitions: [], mode: {} },
            { definitions: [], mode: 42 },
            {},
            { definitions: undefined },
            { definitions: {} },
            { definitions: true },
            { definitions: "test" },
            { definitions: 42 }
        ];

        invalidArgs.forEach((args) => {
            it('should reject and not change the system definitions when the provided args type is not valid', async () => {

                try {
                    await glue.appManager.inMemory.import(args.definitions, args.mode);
                } catch (error) {
                    const currentDefinitions = await glue.appManager.inMemory.export();

                    try {
                        expect(currentDefinitions).to.eql(definitionsOnStart);

                    } catch (error) {
                        throw new Error(`failed equality check for: ${JSON.stringify(args)}`);
                    }

                    return;
                }

                throw new Error(`Should not have resolved, because the args are not valid: ${JSON.stringify(args)}`);
            });
        });

        const invalidDefs = [
            ["true"],
            [true],
            [42],
            [null],
            [[]],
            [{}],
            [{ name: "valid" }],
            [{ name: "valid", details: {} }],
            [{ details: { url: "valid" } }],
            [{ name: "valid", details: { url: "valid" } }]
        ];

        invalidDefs.forEach((definitions) => {
            it('should resolve, but not change the system definitions and populate the errors array when the provided definitions are not valid', async () => {

                const result = await glue.appManager.inMemory.import(definitions, "merge");

                const currentDefinitions = await glue.appManager.inMemory.export();

                expect(currentDefinitions).to.eql(definitionsOnStart);

                expect(result.imported.length).to.eql(0);

                expect(result.errors.length).to.eql(1);
            });
        });
    });

    describe('mode: replace', () => {
        const mode = "replace";

        it('should be the default mode of operation (export check)', async () => {
            await glue.appManager.inMemory.import([]);
            const currentDefinitions = await glue.appManager.inMemory.export();

            expect(currentDefinitions).to.eql([]);
        });

        it('should return valid import result when the definition is valid', async () => {
            const importResult = await glue.appManager.inMemory.import([extraDefOne]);

            expect(importResult.imported.length).to.eql(1);
            expect(importResult.imported[0]).to.eql(extraDefOne.name);
            expect(importResult.errors.length).to.eql(0);
        });

        it('importing two definitions - one invalid and one valid should resolve, the result object should contain the correct data and the valid definition should be in the system (export check)', async () => {
            const importResult = await glue.appManager.inMemory.import([{ test: 42 }, extraDefOne]);

            expect(importResult.imported.length).to.eql(1);
            expect(importResult.imported[0]).to.eql(extraDefOne.name);
            expect(importResult.errors.length).to.eql(1);

            const current = await glue.appManager.inMemory.export();

            expect([extraDefOne]).to.eql(current);
        });

        it('importing two definitions - one invalid and one valid should resolve, the result object should contain the correct data and the valid definition should be in the system (applications check)', async () => {
            const importResult = await glue.appManager.inMemory.import([{ test: 42 }, extraDefOne]);

            expect(importResult.imported.length).to.eql(1);
            expect(importResult.imported[0]).to.eql(extraDefOne.name);
            expect(importResult.errors.length).to.eql(1);

            const currentApps = glue.appManager.applications();

            expect(currentApps.length).to.eql(1);
            expect(currentApps[0].name).to.eql(extraDefOne.name);
        });

        it('should be the default mode of operation (applications check)', async () => {
            await glue.appManager.inMemory.import([]);
            const currentApps = glue.appManager.applications();

            expect(currentApps).to.eql([]);
        });

        it('should delete all definitions if an empty collection is provided (export check)', async () => {
            await glue.appManager.inMemory.import([], mode);
            const currentDefinitions = await glue.appManager.inMemory.export();

            expect(currentDefinitions).to.eql([]);
        });

        it('should delete all definitions if an empty collection is provided (applications check)', async () => {
            await glue.appManager.inMemory.import([], mode);
            const currentApps = glue.appManager.applications();

            expect(currentApps).to.eql([]);
        });

        [
            [],
            [extraDefOne],
            [extraDefOne, extraDefTwo]
        ].forEach((definitions) => {
            it('the system should have exactly the same definitions as imported (export check)', async () => {
                await glue.appManager.inMemory.import(definitions, mode);

                const current = await glue.appManager.inMemory.export();

                expect(definitions).to.eql(current);
            });

            it('the system should have exactly the same definitions as imported (applications check)', async () => {
                await glue.appManager.inMemory.import(definitions, mode);

                const currentApps = glue.appManager.applications();

                expect(definitions.length).to.eql(currentApps.length);

                definitions.forEach((def) => {
                    expect(currentApps.some((app) => app.name === def.name)).to.be.true;
                });
            });
        });

        it('should fire removed event when a system definition is missing from the import collection', (done) => {
            const ready = gtf.waitFor(2, done);

            const setUpEvent = () => {
                const unsub = glue.appManager.onAppRemoved((app) => {
                    if (app.name === extraDefTwo.name) {
                        ready();
                    } else {
                        done(`Received unexpected app removed event for: ${app.name}`);
                    }
                });

                unsubs.push(unsub);
            };

            glue.appManager.inMemory.import([extraDefOne, extraDefTwo], mode)
                .then(() => {
                    setUpEvent();
                    return glue.appManager.inMemory.import([extraDefOne], mode);
                })
                .then(ready)
                .catch(done);
        });

        it('should fire added event when the import collection has a definition not previously present in the system', (done) => {
            const ready = gtf.waitFor(2, done);

            const setUpEvent = () => {
                const unsub = glue.appManager.onAppAdded((app) => {
                    if (app.name === extraDefTwo.name) {
                        ready();
                    }
                });

                unsubs.push(unsub);
            };

            glue.appManager.inMemory.import([extraDefOne], mode)
                .then(() => {
                    setUpEvent();
                    return glue.appManager.inMemory.import([extraDefOne, extraDefTwo], mode);
                })
                .then(ready)
                .catch(done);
        });

        it('should fire changed event when the import collection has a definition previously present in the system and there is some difference', (done) => {
            const ready = gtf.waitFor(2, done);

            const setUpEvent = () => {
                const unsub = glue.appManager.onAppChanged((app) => {
                    if (app.name === extraDefOne.name) {
                        ready();
                    }
                });

                unsubs.push(unsub);
            };

            glue.appManager.inMemory.import([extraDefOne], mode)
                .then(() => {
                    extraDefOne.customProperties.includeInWorkspaces = false;
                    setUpEvent();
                    return glue.appManager.inMemory.import([extraDefOne], mode);
                })
                .then(ready)
                .catch(done);
        });

    });

    describe('mode: merge', () => {
        const mode = "merge";

        it('should not make any changes to the system definitions when an empty array is provided (export check)', async () => {
            await glue.appManager.inMemory.import([], mode);

            const current = await glue.appManager.inMemory.export();

            expect(current).to.eql(definitionsOnStart);
        });

        it('importing two definitions - one invalid and one valid should resolve, the result object should contain the correct data and the valid definition should be in the system (export check)', async () => {
            const importResult = await glue.appManager.inMemory.import([{ test: 42 }, extraDefOne], mode);

            expect(importResult.imported.length).to.eql(1);
            expect(importResult.imported[0]).to.eql(extraDefOne.name);
            expect(importResult.errors.length).to.eql(1);

            const current = await glue.appManager.inMemory.export();

            expect(current).to.eql([...definitionsOnStart, extraDefOne]);
        });

        it('importing two definitions - one invalid and one valid should resolve, the result object should contain the correct data and the valid definition should be in the system (applications check)', async () => {
            const appsOnStart = glue.appManager.applications();

            const importResult = await glue.appManager.inMemory.import([{ test: 42 }, extraDefOne], mode);

            expect(importResult.imported.length).to.eql(1);
            expect(importResult.imported[0]).to.eql(extraDefOne.name);
            expect(importResult.errors.length).to.eql(1);

            const current = glue.appManager.applications();

            expect(current.length).to.eql(appsOnStart.length + 1);

            expect(current.some((app) => app.name === extraDefOne.name)).to.be.true;
        });

        it('should not make any changes to the system definitions when an empty array is provided (applications check)', async () => {
            const appsOnStart = glue.appManager.applications();

            await glue.appManager.inMemory.import([], mode);

            const currentApps = glue.appManager.applications();

            expect(currentApps).to.eql(appsOnStart);
        });

        it('should add a new definition to the system, if one definitions is imported it was not present previously (export check)', async () => {
            await glue.appManager.inMemory.import([extraDefOne], mode);

            const current = await glue.appManager.inMemory.export();

            expect(current).to.eql([...definitionsOnStart, extraDefOne]);
        });

        it('should add a new definition to the system, if one definitions is imported it was not present previously (applications check)', async () => {
            const appsOnStart = glue.appManager.applications();

            await glue.appManager.inMemory.import([extraDefOne], mode);

            const current = glue.appManager.applications();

            expect(current.length).to.eql(appsOnStart.length + 1);

            expect(current.some((app) => app.name === extraDefOne.name)).to.be.true;
        });

        it('should add two new definitions to the system, if two definitions are imported it they were not present previously (export check)', async () => {
            await glue.appManager.inMemory.import([extraDefOne, extraDefTwo], mode);

            const current = await glue.appManager.inMemory.export();

            expect(current).to.eql([...definitionsOnStart, extraDefOne, extraDefTwo]);
        });

        it('should add two new definitions to the system, if two definitions are imported it they were present previously (applications check)', async () => {
            const appsOnStart = glue.appManager.applications();

            await glue.appManager.inMemory.import([extraDefOne, extraDefTwo], mode);

            const current = glue.appManager.applications();

            expect(current.length).to.eql(appsOnStart.length + 2);

            expect(current.some((app) => app.name === extraDefOne.name)).to.be.true;
            expect(current.some((app) => app.name === extraDefTwo.name)).to.be.true;
        });

        it('should fire added event when a new definition is added', (done) => {
            const ready = gtf.waitFor(2, done);

            const setUpEvent = () => {
                const unsub = glue.appManager.onAppAdded((app) => {
                    if (app.name === extraDefOne.name) {
                        ready();
                    }
                });

                unsubs.push(unsub);
            };

            setUpEvent();
            glue.appManager.inMemory.import([extraDefOne], mode).then(ready).catch(done);
        });

        it('should change an existing definition, if it was previously present', async () => {
            await glue.appManager.inMemory.import([extraDefOne], mode);

            extraDefOne.customProperties.includeInWorkspaces = false;

            await glue.appManager.inMemory.import([extraDefOne], mode);

            const current = await glue.appManager.inMemory.export();

            const def = current.find((d) => d.name === extraDefOne.name);

            expect(def).to.not.be.undefined;
            expect(def.customProperties.includeInWorkspaces).to.be.false;
        });

        it('should fire changed event when an existing definition is modified', (done) => {
            const ready = gtf.waitFor(2, done);

            const setUpEvent = () => {
                const unsub = glue.appManager.onAppChanged((app) => {
                    if (app.name === extraDefOne.name) {
                        ready();
                    }
                });

                unsubs.push(unsub);
            };

            glue.appManager.inMemory.import([extraDefOne], mode)
                .then(() => {
                    setUpEvent();
                    extraDefOne.customProperties.includeInWorkspaces = false;
                    return glue.appManager.inMemory.import([extraDefOne], mode);
                })
                .then(ready)
                .catch(done);
        });
    });
});
