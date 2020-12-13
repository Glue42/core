describe('properties', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    describe('id', () => {
        it('Should be set correctly.', async () => {
            const { id } = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

            expect(typeof id).to.equal('string');
            expect(id).to.not.be.empty;
        });
    });

    describe('name', () => {
        it('Should be set correctly.', async () => {
            const windowName = gtf.windows.getWindowName();
            const { name } = await glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url);

            expect(name).to.equal(windowName);
        });
    });
});
