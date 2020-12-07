describe('initialization', () => {
    let gluesToDisconnect = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.connection.disconnectGlues(gluesToDisconnect);
        gluesToDisconnect = [];
    });

    const appManagerAPIMethodsAndProp = [
        'application',
        'applications',
        'instances',
        'onAppAdded',
        'onAppChanged',
        'onAppRemoved',
        'onInstanceStarted',
        'onInstanceStopped',
        'myInstance',
    ];

    it('Should not be initialized when Glue42Web is called with an object that has an appManager: false property.', async () => {
        const newGlue = await GlueWeb({ appManager: false });
        gluesToDisconnect.push(newGlue);

        expect(newGlue.appManager).to.be.undefined;
    });

    it('Should be initialized when Glue42Web is called with an object that has an appManager: true property.', async () => {
        const newGlue = await GlueWeb({ appManager: true });
        gluesToDisconnect.push(newGlue);

        expect(newGlue.appManager).to.not.be.undefined;

        const registeredAppManagerAPIProperties = [];
        for (const property in newGlue.appManager) {
            registeredAppManagerAPIProperties.push(property);
        }

        for (const appManagerAPIMethod of appManagerAPIMethodsAndProp) {
            expect(registeredAppManagerAPIProperties).to.include(appManagerAPIMethod);
        }
    });

    it('Should set the application name passed to GlueWeb.', async () => {
        const appName = 'Test';

        const newGlue = await GlueWeb({ appManager: true, application: appName });
        gluesToDisconnect.push(newGlue);

        expect(newGlue.appManager.myInstance.application.name).to.equal(appName);
    });

    it('Should set the document\'s title to the one from the application definition.', async () => {
        const appName = 'AppWithDetails-local';

        const appTitle = gtf.appManager.getLocalApplications().find((localApp) => localApp.name === appName).title;

        const newGlue = await GlueWeb({ appManager: true, application: appName });
        gluesToDisconnect.push(newGlue);

        expect(document.title).to.equal(appTitle);
    });

    it('Should ignore duplicate application definitions', async () => {
        // The application is part of both the local application definitions and the application definitions provided by the remote source.
        const duplicateAppName = 'Test';

        // Wait for the application definitions from the remoteSource to be fetched.
        await gtf.waitForFetch();

        const duplicateAppNames = glue.appManager.applications().filter((application) => application.name === duplicateAppName);

        expect(duplicateAppNames).to.be.of.length(1);
    });
});
