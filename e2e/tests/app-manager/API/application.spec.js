describe('application()', () => {
    before(() => {
        return coreReady;
    });

    it('Should throw an error when name isn\'t of type string.', () => {
        try {
            glue.appManager.application(42);
            throw new Error('application() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the name as a string!');
        }
    });

    it('Should return the application (local application definition).', async () => {
        const appName = 'AppWithDetails-local';
        const { title, version, details, customProperties: { a: customPropertiesA } } = gtf.appManager.getLocalApplications().find((localApp) => localApp.name === appName);

        const application = glue.appManager.application(appName);

        expect(application.name).to.equal(appName);
        expect(application.title).to.equal(title);
        expect(application.version).to.equal(version);
        expect(application.userProperties.details).to.eql(details);
        expect(application.userProperties.a).to.equal(customPropertiesA);
    });

    it('Should return undefined if the application doesn\'t exist.', async () => {
        const appName = 'non-existent-application';

        // Wait for the application definitions from the remoteSource to be fetched.
        await gtf.waitForFetch();

        const application = glue.appManager.application(appName);

        expect(application).to.be.undefined;
    });

    describe('remote source', () => {
        beforeEach(async () => {
            // Wait for the application definitions from the remoteSource to be fetched.
            await gtf.waitForFetch();
        });

        it('Should return the application (application definition provided by a remote source).', async () => {
            const appName = 'AppWithDetails-remote';
            const { title, version, details, customProperties: { a: customPropertiesA } } = (await gtf.appManager.getRemoteSourceApplications()).find((remoteApp) => remoteApp.name === appName);

            const application = glue.appManager.application(appName);

            expect(application.name).to.equal(appName);
            expect(application.title).to.equal(title);
            expect(application.version).to.equal(version);
            expect(application.userProperties.details).to.eql(details);
            expect(application.userProperties.a).to.equal(customPropertiesA);
        });
    });
});
