describe('find()', () => {
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

    it('Should throw an error when intentFilter isn\'t of type string or type object.', (done) => {
        glue.intents.find(42)
            .then(() => done('find() should have thrown an error because intentFilter wasn\'t of type string or object!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got a number", "at error: expected an object, got a number"]');

                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Should throw an error when intentFilter.name isn\'t of type string.', (done) => {
        glue.intents.find({ name: 42 })
            .then(() => done('find() should have thrown an error because intentFilter.name wasn\'t of type string!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got an object", "at error.name: expected a string, got a number"]');

                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Should return an empty array if the intent doesn\'t exist (string).', async () => {
        expect(await glue.intents.find('non-existent-intent-name')).to.be.empty;
    });

    it('Should return an empty array if the intent doesn\'t exist (IntentFilter - name).', async () => {
        expect(await glue.intents.find({ name: 'non-existent-intent-name' })).to.be.empty;
    });

    it('Should return an empty array if the intent doesn\'t exist (IntentFilter - contextType).', async () => {
        expect(await glue.intents.find({ contextType: 'non-existent-context-type' })).to.be.empty;
    });

    it('Should return an app intent (string).', async () => {
        const localAppIntentsWithAppInfo = gtf.appManager.getLocalApplications().filter((localApp) => typeof localApp.intents !== 'undefined').flatMap((localApp) => localApp.intents.map((intent) => ({ ...localApp, ...intent, applicationName: localApp.name, intentName: intent.name })));

        const intentName = localAppIntentsWithAppInfo[0].name;

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.filter((intent) => intent.name === intentName);

        const foundIntents = await glue.intents.find(intentName);

        expect(foundIntents).to.eql(allMatchingNameIntents);
    });

    it('Should return an instance intent registered by another party (string).', async () => {
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intentToRegister);

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.find((intent) => intent.name === intentToRegister.intent);

        const foundIntents = await glue.intents.find(intentToRegister.intent);

        expect(foundIntents).to.be.of.length(1);

        const foundIntent = foundIntents[0];

        expect(foundIntent).to.eql(allMatchingNameIntents);
    });

    it('Should return an instance intent registered by us (string).', async () => {
        const intentName = 'our-intent';
        const intentToRegister = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intentToRegister, () => { });
        unsubObj.intent = intentName;

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.find((intent) => intent.name === intentToRegister.intent);

        const foundIntents = await glue.intents.find(intentToRegister.intent);

        expect(foundIntents).to.be.of.length(1);

        const foundIntent = foundIntents[0];

        expect(foundIntent).to.eql(allMatchingNameIntents);
    });

    it('Should return an app intent (IntentFilter - name).', async () => {
        const localAppIntentsWithAppInfo = gtf.appManager.getLocalApplications().filter((localApp) => typeof localApp.intents !== 'undefined').flatMap((localApp) => localApp.intents.map((intent) => ({ ...localApp, ...intent, applicationName: localApp.name, intentName: intent.name })));

        const intentName = localAppIntentsWithAppInfo[0].name;

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.filter((intent) => intent.name === intentName);

        const foundIntents = await glue.intents.find({ name: intentName });

        expect(foundIntents).to.eql(allMatchingNameIntents);
    });

    it('Should return an instance intent registered by another party (IntentFilter - name).', async () => {
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intentToRegister);

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.find((intent) => intent.name === intentToRegister.intent);

        const foundIntents = await glue.intents.find({ name: intentToRegister.intent });

        expect(foundIntents).to.be.of.length(1);

        const foundIntent = foundIntents[0];

        expect(foundIntent).to.eql(allMatchingNameIntents);
    });

    it('Should return an instance intent registered by us (IntentFilter - name).', async () => {
        const intentName = 'our-intent';
        const intentToRegister = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intentToRegister, () => { });
        unsubObj.intent = intentName;

        const allIntents = await glue.intents.all();
        const allMatchingNameIntents = allIntents.find((intent) => intent.name === intentToRegister.intent);

        const foundIntents = await glue.intents.find({ name: intentToRegister.intent });

        expect(foundIntents).to.be.of.length(1);

        const foundIntent = foundIntents[0];

        expect(foundIntent).to.eql(allMatchingNameIntents);
    });

    it('Should return an app intent registered by localApplications (IntentFilter - contextType).', async () => {
        const localAppIntentsWithContextsWithAppInfo = gtf.appManager.getLocalApplications().filter((localApp) => Array.isArray(localApp.intents) && localApp.intents.some((intent) => Array.isArray(intent.contexts) && intent.contexts.length > 0)).flatMap((localApp) => localApp.intents.map((intent) => ({ ...localApp, ...intent, applicationName: localApp.name, intentName: intent.name })));

        const contextType = localAppIntentsWithContextsWithAppInfo[0].contexts[0];

        const allIntents = await glue.intents.all();
        const allMatchingContextTypeIntents = allIntents.filter((intent) => intent.handlers.some((handler) => handler.contextTypes.includes(contextType)));

        const foundIntents = await glue.intents.find({ contextType });

        expect(foundIntents).to.eql(allMatchingContextTypeIntents);
    });

    it('Should return an instance intent registered by another party (IntentFilter - contextType).', async () => {
        const contextType = 'test-context';
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: [contextType],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intentToRegister);

        const allIntents = await glue.intents.all();
        const allMatchingContextTypeIntents = allIntents.filter((intent) => intent.handlers.some((handler) => handler.contextTypes.includes(contextType)));

        const foundIntents = await glue.intents.find({ contextType });

        expect(foundIntents).to.eql(allMatchingContextTypeIntents);
    });

    it('Should return an instance intent registered by us (IntentFilter - contextType).', async () => {
        const intentName = 'our-intent';
        const contextType = 'test-context';
        const intentToRegister = {
            intent: intentName,
            contextTypes: [contextType],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intentToRegister, () => { });
        unsubObj.intent = intentName;

        const allIntents = await glue.intents.all();
        const allMatchingContextTypeIntents = allIntents.filter((intent) => intent.handlers.some((handler) => handler.contextTypes.includes(contextType)));

        const foundIntents = await glue.intents.find({ contextType });

        expect(foundIntents).to.eql(allMatchingContextTypeIntents);
    });
});
