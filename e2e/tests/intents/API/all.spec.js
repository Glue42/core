describe('all()', () => {
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

    it('Should return all app intents.', async () => {
        const localAppIntentsWithAppInfo = gtf.appManager.getLocalApplications().filter((localApp) => typeof localApp.intents !== 'undefined').flatMap((localApp) => localApp.intents.map((intent) => ({ ...localApp, ...intent, applicationName: localApp.name, intentName: intent.name })));

        const allIntents = await glue.intents.all();

        const appIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'app');

        localAppIntentsWithAppInfo.forEach((localAppIntentWithAppInfo) => {
            const appIntentHandlersWithSameName = appIntentHandlers.filter((handler) => handler.intentName === localAppIntentWithAppInfo.intentName);
            expect(appIntentHandlersWithSameName).to.be.of.length(1);
            const onlyAppIntentHandler = appIntentHandlersWithSameName[0];
            expect(onlyAppIntentHandler.applicationName).to.equal(localAppIntentWithAppInfo.applicationName);
            expect(onlyAppIntentHandler.contextTypes).to.have.all.members(localAppIntentWithAppInfo.contexts);
            expect(onlyAppIntentHandler.instanceId).to.be.undefined;
        });
    });

    it('Should return all instance intents registered by another party.', async () => {
        const intentName = 'another-party-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(2);
        const intentInstanceIntentHandler = instanceIntentHandlers.find((instanceIntentHandler) => instanceIntentHandler.intentName === intentName);

        expect(intentInstanceIntentHandler.intentName).to.equal(intent.intent);
        expect(intentInstanceIntentHandler.applicationName).to.equal('coreSupport');
        expect(intentInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(intentInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(intentInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(intentInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(intentInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(intentInstanceIntentHandler.instanceId).to.equal(glueApplication.myInstance.id);
    });

    it('Should return all instance intents registered by us.', async () => {
        const intentName = 'our-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intent, () => { });
        unsubObj.intent = intentName;

        const allIntents = await glue.intents.all();

        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        expect(instanceIntentHandlers).to.be.of.length(1);
        const onlyInstanceIntentHandler = instanceIntentHandlers[0];
        expect(onlyInstanceIntentHandler.intentName).to.equal(intentName);
        expect(onlyInstanceIntentHandler.applicationName).to.equal(RUNNER);
        expect(onlyInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(onlyInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(onlyInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(onlyInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(onlyInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(onlyInstanceIntentHandler.instanceId).to.equal(glue.interop.instance.windowId);
    });

    it('Should be populated before `addIntentListener()` resolves.', async () => {
        const intentName = 'another-party-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(2);
        const intentInstanceIntentHandler = instanceIntentHandlers.find((instanceIntentHandler) => instanceIntentHandler.intentName === intentName);

        expect(intentInstanceIntentHandler.intentName).to.equal(intentName);
        expect(intentInstanceIntentHandler.applicationName).to.equal('coreSupport');
        expect(intentInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(intentInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(intentInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(intentInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(intentInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(intentInstanceIntentHandler.instanceId).to.equal(glueApplication.myInstance.id);
    });

    it('Should be populated before `unregister()` resolves.', async () => {
        const intent = {
            intent: 'another-party-intent',
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);
        await glueApplication.intents.unregisterIntent(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(1);
    });
});
