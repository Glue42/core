describe('getTitle()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should return a promise that resolves with the title (my).', async () => {
        expect(await glue.windows.my().getTitle()).to.equal(RUNNER);
    });

    it('Should return a promise that resolves with the title (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        expect(await newlyOpenedWindow.getTitle()).to.equal('Core Support');
    });

    it('Should return a promise that resolves with the title (Platform).', async () => {
        expect(await (await gtf.windows.getPlatformWindow()).getTitle()).to.equal(gtf.windows.PLATFORM_DETAILS.title);
    });
});
