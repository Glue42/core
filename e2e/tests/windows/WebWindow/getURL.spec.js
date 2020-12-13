describe('getURL()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should return a promise that resolves with the URL (my).', async () => {
        expect(await glue.windows.my().getURL()).to.equal(RUNNER === gtf.windows.PLATFORM_DETAILS.name ? gtf.windows.PLATFORM_DETAILS.url : gtf.windows.SUPPORT_DETAILS.url);
    });

    it('Should return a promise that resolves with the URL (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        expect(await newlyOpenedWindow.getURL()).to.equal(gtf.windows.SUPPORT_DETAILS.url);
    });

    it('Should return a promise that resolves with the URL (platform).', async () => {
        expect(await (await gtf.windows.getPlatformWindow()).getURL()).to.equal(gtf.windows.PLATFORM_DETAILS.url);
    });
});
