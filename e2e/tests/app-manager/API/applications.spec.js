describe('applications()', () => {
    before(() => {
        return coreReady;
    });

    it('Should return all applications provided inside of localApplications.', async () => {
        const localAppNames = (await gtf.appManager.getLocalApplications()).map((localApp) => localApp.name);

        const appNames = glue.appManager.applications().map((application) => application.name);

        expect(localAppNames.every((localApplicationName) => appNames.includes(localApplicationName))).to.be.true;
    });

    describe('remote source', () => {
        beforeEach(async () => {
            // Wait for the application definitions from the remoteSource to be fetched.
            await gtf.waitForFetch();
        });

        it('Should return all applications provided by a remoteSource.', async () => {
            const validRemoteAppNames = (await gtf.appManager.getRemoteSourceApplications()).map((remoteApp) => remoteApp.name).filter((remoteAppName) => remoteAppName !== 'invalid-application');

            const appNames = glue.appManager.applications().map((application) => application.name);

            expect(validRemoteAppNames.every((remoteApplicationName) => appNames.includes(remoteApplicationName))).to.be.true;
        });
    });
});
