describe('properties', () => {
    let gluesToDisconnect = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.connection.disconnectGlues(gluesToDisconnect);
        gluesToDisconnect = [];
    });

    describe('myInstance', () => {
        it('Should not set myInstance.application if the application definition isn\t provided inside of localApplications/by a remoteSource.', async () => {
            const newGlue = await GlueWeb({ appManager: true, application: 'non-existing-application' });
            gluesToDisconnect.push(newGlue);

            expect(newGlue.appManager.myInstance.application).to.be.undefined;
        });

        it('Should set myInstance.application correctly if the application definition is provided inside of localApplications.', async () => {
            const appName = 'AppWithDetails-local';
            const { title, version, details, customProperties: { a: customPropertiesA } } = (await gtf.appManager.getLocalApplications()).find((localApp) => localApp.name === appName);

            const newGlue = await GlueWeb({ appManager: true, application: appName });
            gluesToDisconnect.push(newGlue);

            const application = newGlue.appManager.myInstance.application;

            expect(application.name).to.equal(appName);
            expect(application.title).to.equal(title);
            expect(application.version).to.equal(version);
            expect(application.userProperties.details).to.eql(details);
            expect(application.userProperties.a).to.equal(customPropertiesA);
        });

        describe('remote source', () => {
            beforeEach(async () => {
                // Wait for the application definitions from the remoteSource to be fetched.
                await gtf.waitForFetch();
            });

            it('Should set myInstance.application correctly if the application definition is provided by a remoteSource.', async () => {
                const appName = 'AppWithDetails-remote';
                const { title, version, details, customProperties: { a: customPropertiesA } } = (await gtf.appManager.getRemoteSourceApplications()).find((remoteApp) => remoteApp.name === appName);

                const newGlue = await GlueWeb({ appManager: true, application: appName });
                gluesToDisconnect.push(newGlue);

                const application = newGlue.appManager.myInstance.application;

                expect(application.name).to.equal(appName);
                expect(application.title).to.equal(title);
                expect(application.version).to.equal(version);
                expect(application.userProperties.details).to.eql(details);
                expect(application.userProperties.a).to.equal(customPropertiesA);
            });
        });
    });
});
