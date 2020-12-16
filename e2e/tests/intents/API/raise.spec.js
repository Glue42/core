describe('raise()', () => {
    // An unsub function returned by `addIntentListener()`.
    let unsubObj;
    let glueApplication;

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        if (typeof unsubObj !== "undefined") {
            const intentListenerRemovedPromise = gtf.intents.waitForIntentListenerRemoved(unsubObj.intent);
            unsubObj.unsubscribe();
            await intentListenerRemovedPromise;
            unsubObj = undefined;
        }
        if (typeof glueApplication !== "undefined") {
            await glueApplication.stop();

            glueApplication = undefined;
        }
    });

    it('Should throw an error when intentRequest isn\'t of type string or type object.', (done) => {
        glue.intents.raise(42)
            .then(() => done('raise() should have thrown an error because intentRequest wasn\'t of type string or object!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got a number", "at error: expected an object, got a number"]');

                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Should throw an error when intentRequest.name isn\'t of type string.', (done) => {
        glue.intents.raise({ intent: 42 })
            .then(() => done('raise() should have thrown an error because intentRequest.name wasn\'t of type string!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got an object", "at error.intent: expected a string, got a number"]');

                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Should raise the intent with the provided context to target app.', async () => {
        const appName = 'coreSupport';
        const intentName = 'core-intent';
        const intentRequest = {
            intent: intentName,
            target: 'startNew',
            context: {
                type: 'test-context',
                data: {
                    a: 42
                }
            }
        };

        const allIntents = await glue.intents.all();
        const intent = allIntents.find((intent) => intent.name === intentName);
        const intentHandler = intent.handlers.find((handler) => handler.applicationName === appName && handler.type === 'app');

        const intentResult = await glue.intents.raise(intentRequest);
        const expectedHandler = {
            ...intentHandler,
            instanceId: intentResult.handler.instanceId
        };

        const appInstances = glue.appManager.application(appName).instances;
        expect(appInstances).to.be.of.length(1);
        glueApplication = appInstances[0];

        expect(intentResult.request).to.eql(intentRequest);
        expect(intentResult.handler).to.eql(expectedHandler);
        // The coreSupport app's core-intent is setup to return the context it is raised with.
        expect(intentResult.result).to.eql(intentRequest.context);
    });

    it('Should raise the intent with the provided context to target instance.', async () => {
        const appTitle = 'Core Support';
        const intentName = 'core-intent';
        const intentListenerAddedPromise = gtf.intents.waitForIntentListenerAdded(intentName)

        glueApplication = await gtf.createApp();

        await intentListenerAddedPromise;

        const intentRequest = {
            intent: intentName,
            target: 'reuse',
            context: {
                type: 'test-context',
                data: {
                    a: 42
                }
            }
        };

        const allIntents = await glue.intents.all();
        const intent = allIntents.find((intent) => intent.name === intentName);
        const intentHandler = intent.handlers.find((handler) => handler.applicationName === 'coreSupport' && handler.type === 'app');

        const intentResult = await glue.intents.raise(intentRequest);
        const expectedHandler = {
            ...intentHandler,
            instanceId: intentResult.handler.instanceId,
            type: 'instance',
            instanceTitle: appTitle
        };

        expect(intentResult.request).to.eql(intentRequest);
        expect(intentResult.handler).to.eql(expectedHandler);
        // The coreSupport app's core-intent is setup to return the context it is raised with.
        expect(intentResult.result).to.eql(intentRequest.context);
    });

    it('Should raise the intent with the provided context to an application.', async () => {
        const appName = 'coreSupport';
        const intentName = 'core-intent';
        const intentRequest = {
            intent: intentName,
            target: {
                app: appName
            },
            context: {
                type: 'test-context',
                data: {
                    a: 42
                }
            }
        };

        const allIntents = await glue.intents.all();
        const intent = allIntents.find((intent) => intent.name === intentName);
        const intentHandler = intent.handlers.find((handler) => handler.applicationName === appName && handler.type === 'app');

        const intentResult = await glue.intents.raise(intentRequest);
        const expectedHandler = {
            ...intentHandler,
            instanceId: intentResult.handler.instanceId
        };

        const appInstances = glue.appManager.application(appName).instances;
        expect(appInstances).to.be.of.length(1);
        glueApplication = appInstances[0];

        expect(intentResult.request).to.eql(intentRequest);
        expect(intentResult.handler).to.eql(expectedHandler);
        // The coreSupport app's core-intent is setup to return the context it is raised with.
        expect(intentResult.result).to.eql(intentRequest.context);
    });

    it('Should raise the intent with the provided context to an instance.', async () => {
        const appTitle = 'Core Support';
        const intentName = 'core-intent';
        const intentListenerAddedPromise = gtf.intents.waitForIntentListenerAdded(intentName)

        glueApplication = await gtf.createApp();

        await intentListenerAddedPromise;

        const intentRequest = {
            intent: intentName,
            target: {
                instance: glueApplication.agm.instance.windowId
            },
            context: {
                type: 'test-context',
                data: {
                    a: 42
                }
            }
        };

        const allIntents = await glue.intents.all();
        const intent = allIntents.find((intent) => intent.name === intentName);
        const intentHandler = intent.handlers.find((handler) => handler.applicationName === 'coreSupport' && handler.type === 'app');

        const intentResult = await glue.intents.raise(intentRequest);
        const expectedHandler = {
            ...intentHandler,
            instanceId: intentResult.handler.instanceId,
            type: 'instance',
            instanceTitle: appTitle
        };

        expect(intentResult.request).to.eql(intentRequest);
        expect(intentResult.handler).to.eql(expectedHandler);
        // The coreSupport app's core-intent is setup to return the context it is raised with.
        expect(intentResult.result).to.eql(intentRequest.context);
    });
});
