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

    it('Should return all intents registered by localApplications.', async () => {
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

    it('Should return all dynamic intents registered by another party.', async () => {
        const intent = {
            intent: 'another-party-intent',
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        expect(instanceIntentHandlers).to.be.of.length(1);
        const onlyInstanceIntentHandler = instanceIntentHandlers[0];

        expect(onlyInstanceIntentHandler.intentName).to.equal(intent.intent);
        expect(onlyInstanceIntentHandler.applicationName).to.equal('coreSupport');
        expect(onlyInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(onlyInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(onlyInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(onlyInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(onlyInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(onlyInstanceIntentHandler.instanceId).to.equal(glueApplication.myInstance.id);
    });

    it('Should return all dynamic intents registered by us.', async () => {
        const intentName = 'our-intent'
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intent, () => { });
        unsubObj.intent = intentName;
        // `addIntentListener()` is sync so we need to wait for the intent listener to be added before calling `all()`.
        await gtf.intents.waitForIntentListenerAdded(intentName);

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
});
